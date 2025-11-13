import express from 'express';
import { getJamieResponse, scoreDQ } from '../utils/openai';
import { getPersonaSystemPrompt, personaStageConfigs, PersonaStageKey } from '../utils/prompts';

const router = express.Router();

type DQDimension = 'framing' | 'alternatives' | 'information' | 'values' | 'reasoning' | 'commitment';

type PersonaStageState = {
  currentIndex: number;
  maxAchievedIndex: number;
  sampleCounts: number[];
};

type SessionState = {
  turnsUsed: number;
  dqCoverage: Record<DQDimension, boolean>;
  personaStages: Record<string, PersonaStageState>;
  conversationHistory: Array<{ role: 'user' | 'coach'; content: string }>;
};

// In-memory session state storage (For Production, replace with Redis/DB)
const sessionState: Record<string, SessionState> = {};

const MAX_TURNS = 20;

router.post('/', async (req, res) => {
  const userMessage: string = req.body.message;
  const sessionId: string = req.body.session_id || 'anon-session';
  const userId: string = req.body.user_id || 'anon-user';
  const persona: string = (req.body.character || 'jamie').toLowerCase();

  if (!sessionState[sessionId]) {
    sessionState[sessionId] = {
      turnsUsed: 0,
      dqCoverage: {
        framing: false,
        alternatives: false,
        information: false,
        values: false,
        reasoning: false,
        commitment: false
      },
      personaStages: {},
      conversationHistory: []
    };
  }

  sessionState[sessionId].turnsUsed += 1;

  try {
    console.log("Received message:", userMessage);

    // Build conversation history string from previous messages
    const conversationHistory = sessionState[sessionId].conversationHistory
      .map(msg => `${msg.role === 'user' ? 'Client' : 'Coach'}: ${msg.content}`)
      .join('\n\n');

    // Score DQ with conversation context (coach response will be added after generation)
    const dqScoreComponents = await scoreDQ(userMessage, conversationHistory);
    console.log("DQ Score Components:", dqScoreComponents);

    // Calculate DQ score using the "weakest link" principle (minimum of all components)
    // Only use the 6 core DQ dimensions, exclude 'overall' and 'rationale'
    const dqDimensions: DQDimension[] = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];
    const dqScoreValues: number[] = [];
    
    // Safely extract and validate each dimension score
    for (const dim of dqDimensions) {
      const value = dqScoreComponents?.[dim];
      
      // Skip null/undefined
      if (value === null || value === undefined) continue;
      
      // Convert to number
      const numValue = typeof value === 'number' ? value : parseFloat(String(value));
      
      // Validate: must be a finite number between 0 and 1
      if (typeof numValue === 'number' && 
          !isNaN(numValue) && 
          isFinite(numValue) && 
          numValue >= 0 && 
          numValue <= 1) {
        dqScoreValues.push(numValue);
      }
    }
    
    // Calculate minimum with extra safety
    let finalDqScore = 0;
    if (dqScoreValues.length > 0) {
      // Double-check all values are valid before Math.min
      const allValid = dqScoreValues.every(v => 
        typeof v === 'number' && !isNaN(v) && isFinite(v)
      );
      if (allValid) {
        const minScore = Math.min(...dqScoreValues);
        // Final validation
        if (typeof minScore === 'number' && !isNaN(minScore) && isFinite(minScore)) {
          finalDqScore = minScore;
        }
      }
    }
    
    console.log("DQ Score (minimum):", finalDqScore, "from values:", dqScoreValues, "raw components:", dqScoreComponents);

    // Calculate average of top 5 dimensions for stage progression (matches frontend progress calculation)
    // This ensures persona stage aligns with visible progress, not just the weakest link
    const sortedScores = [...dqScoreValues].sort((a, b) => b - a);
    const top5Scores = sortedScores.slice(0, Math.min(5, sortedScores.length));
    const avgTop5Score = top5Scores.length > 0 
      ? top5Scores.reduce((sum, val) => sum + val, 0) / top5Scores.length 
      : finalDqScore; // Fallback to minimum if no valid scores
    
    console.log("DQ Score (avg top 5):", avgTop5Score, "from top 5:", top5Scores);

    // Determine persona stage and get appropriate system prompt
    const personaConfig = personaStageConfigs[persona] || personaStageConfigs['jamie'];
    let stageKey: PersonaStageKey = personaConfig.defaultStage;
    
    // Apply smoothing: use exponential moving average to prevent rapid jumps
    // Store previous average in session state for smoothing
    const smoothingKey = `${persona}_avgScore`;
    const previousAvg = (sessionState[sessionId] as any)[smoothingKey] || avgTop5Score;
    const smoothingFactor = 0.3; // 30% new score, 70% previous (higher = more stable)
    const smoothedScore = (smoothingFactor * avgTop5Score) + ((1 - smoothingFactor) * previousAvg);
    (sessionState[sessionId] as any)[smoothingKey] = smoothedScore;
    
    // Use smoothed score for stage determination to prevent rapid jumps
    const stageScore = smoothedScore;
    console.log("Stage score (smoothed):", stageScore, "from avg:", avgTop5Score, "previous:", previousAvg);

    if (!sessionState[sessionId].personaStages[persona]) {
      sessionState[sessionId].personaStages[persona] = {
        currentIndex: 0,
        maxAchievedIndex: 0,
        sampleCounts: new Array(personaConfig.stages.length).fill(0)
      };
    }

    const personaState = sessionState[sessionId].personaStages[persona];

    if (personaConfig.lockOnceAchieved) {
      // Locked progression: can only move forward
      for (let i = personaState.maxAchievedIndex + 1; i < personaConfig.stages.length; i++) {
        const stageConfig = personaConfig.stages[i];
        if (stageScore >= stageConfig.minScore) {
          personaState.sampleCounts[i] = (personaState.sampleCounts[i] || 0) + 1;
          const requiredSamples = stageConfig.minSamples ?? personaConfig.minSamples;
          if (personaState.sampleCounts[i] >= requiredSamples) {
            personaState.maxAchievedIndex = i;
            personaState.currentIndex = i;
          }
        }
      }
      stageKey = personaConfig.stages[personaState.currentIndex].key;
    } else {
      // Unlocked progression: can regress if score drops significantly
      let chosenIndex = personaState.currentIndex;
      
      // Check for progression
      for (let i = personaState.currentIndex + 1; i < personaConfig.stages.length; i++) {
        const stageConfig = personaConfig.stages[i];
        if (stageScore >= stageConfig.minScore) {
          personaState.sampleCounts[i] = (personaState.sampleCounts[i] || 0) + 1;
          const requiredSamples = stageConfig.minSamples ?? personaConfig.minSamples;
          if (personaState.sampleCounts[i] >= requiredSamples) {
            chosenIndex = i;
            if (i > personaState.maxAchievedIndex) {
              personaState.maxAchievedIndex = i;
            }
          }
        }
      }

      // Check for regression (if regressionThreshold is defined)
      if (personaConfig.regressionThreshold !== undefined) {
        const currentStageConfig = personaConfig.stages[personaState.currentIndex];
        const scoreDrop = currentStageConfig.minScore - stageScore;
        
        if (scoreDrop > personaConfig.regressionThreshold && chosenIndex === personaState.currentIndex) {
          // Score dropped significantly below current stage threshold
          // Find the highest stage that matches the current score
          for (let i = personaState.currentIndex - 1; i >= 0; i--) {
            const stageConfig = personaConfig.stages[i];
            if (stageScore >= stageConfig.minScore) {
              chosenIndex = i;
              break;
            }
          }
        }
      } else {
        // No regression threshold: find highest matching stage
        for (let i = personaConfig.stages.length - 1; i >= 0; i--) {
          const stageConfig = personaConfig.stages[i];
          if (stageScore >= stageConfig.minScore) {
            chosenIndex = i;
            break;
          }
        }
      }

      personaState.currentIndex = chosenIndex;
      stageKey = personaConfig.stages[chosenIndex].key;
    }

    const systemPrompt = getPersonaSystemPrompt(persona, stageKey);
    console.log('Persona selection:', {
      persona,
      stageKey,
      promptPreview: systemPrompt.slice(0, 120)
    });
    
    const jamieReply = await getJamieResponse(userMessage, systemPrompt, persona);
    console.log("Jamie reply:", jamieReply);

    // Update conversation history
    sessionState[sessionId].conversationHistory.push(
      { role: 'user', content: userMessage },
      { role: 'coach', content: jamieReply }
    );

    // Update DQ coverage if score >= 0.3
    for (const dimension of Object.keys(dqScoreComponents) as DQDimension[]) {
      if (dqScoreComponents[dimension] >= 0.3) {
        sessionState[sessionId].dqCoverage[dimension] = true;
      }
    }

    const turnsUsed = sessionState[sessionId].turnsUsed;
    const turnsRemaining = MAX_TURNS - turnsUsed;
    const dqCoverage = sessionState[sessionId].dqCoverage;

    let conversationStatus = 'in-progress';
    if (Object.values(dqCoverage).every(Boolean)) {
      conversationStatus = 'dq-complete';
    } else if (turnsRemaining <= 0) {
      conversationStatus = 'turn-limit-reached';
    }

    const sessionSummary = (conversationStatus !== 'in-progress') ? {
      totalTurns: turnsUsed,
      dqAreasCompleted: Object.keys(dqCoverage).filter((k) => dqCoverage[k as DQDimension]),
      dqAreasMissed: Object.keys(dqCoverage).filter((k) => !dqCoverage[k as DQDimension]),
      feedback: conversationStatus === 'dq-complete' ? 'You covered all key areas of Decision Quality.' : 'Session ended before all DQ areas were explored.',
      persona_stage: stageKey,
      persona,
      persona_prompt_preview: systemPrompt.slice(0, 200)
    } : null;

    const response = {
      session_id: sessionId,
      user_id: userId,
      user_message: userMessage,
      jamie_reply: jamieReply,
      dq_score: dqScoreComponents,
      dq_score_minimum: finalDqScore,
      turnsUsed,
      turnsRemaining,
      dqCoverage,
      conversationStatus,
      sessionSummary,
      timestamp: new Date().toISOString(),
      persona_stage: stageKey,
      persona,
      persona_prompt_preview: systemPrompt.slice(0, 200)
    };

    res.status(200).json(response);

  } catch (err) {
    console.error("Error processing chat:", err);
    res.status(500).send('Failed to process message.');
  }
});

module.exports = router;