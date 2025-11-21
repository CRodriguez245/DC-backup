import express from 'express';
import { getJamieResponse, scoreDQ } from '../utils/openai';
import { getPersonaSystemPrompt, personaStageConfigs, PersonaStageKey, scoringWeights, andresResponsePatterns } from '../utils/prompts';

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

// Persona-specific turn limits
const getMaxTurns = (persona: string): number => {
  const normalizedPersona = (persona || '').toLowerCase();
  return normalizedPersona === 'kavya' ? 10 : 20;
};

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

    // PRE-CHECK: Catch truly minimal messages (exact phrases only, not substantive content)
    const minimalMessagePatterns = [
      /^tell me more\s*$/i,
      /^tell me more about\s*$/i,
      /^yes\s*$/i,
      /^okay?\s*$/i,
      /^ok\s*$/i,
      /^sure\s*$/i,
      /^go on\s*$/i,
      /^continue\s*$/i,
      /^keep going\s*$/i,
      /^what do you think\s*\??\s*$/i,
      /^what's your take\s*\??\s*$/i,
      /^i see\s*$/i,
      /^i understand\s*$/i,
      /^that makes sense\s*$/i
    ];
    
    // Only catch exact minimal phrases - if message has substantive content, let LLM score it
    const trimmedMessage = userMessage.trim();
    const isExactMinimalPhrase = minimalMessagePatterns.some(pattern => pattern.test(trimmedMessage));
    
    let dqScoreComponents: any;
    if (isExactMinimalPhrase) {
      // Force minimal scores only for exact minimal phrases
      console.log("⚠️ MINIMAL MESSAGE DETECTED - Forcing 0.1 scores for:", userMessage);
      dqScoreComponents = {
        framing: 0.1,
        alternatives: 0.1,
        information: 0.1,
        values: 0.1,
        reasoning: 0.1,
        commitment: 0.1,
        overall: 0.1,
        rationale: "The coach's message is minimal and does not contain substantive coaching content. Per scoring rules, all dimensions must be scored 0.0-0.2."
      };
    } else {
      // Score DQ with conversation context (coach response will be added after generation)
      dqScoreComponents = await scoreDQ(userMessage, conversationHistory);
    }
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

    // Apply contextual scoring weights based on conversation stage
    const turnsUsed = sessionState[sessionId].turnsUsed;
    let conversationStage: 'earlyConversation' | 'midConversation' | 'lateConversation';
    if (turnsUsed <= 6) {
      conversationStage = 'earlyConversation';
    } else if (turnsUsed <= 13) {
      conversationStage = 'midConversation';
    } else {
      conversationStage = 'lateConversation';
    }
    
    const weights = scoringWeights[conversationStage];
    console.log(`Conversation stage: ${conversationStage} (turn ${turnsUsed}), applying weights:`, weights);
    
    // Create a map of dimension to score
    const dimensionScores: Record<DQDimension, number> = {
      framing: 0,
      alternatives: 0,
      information: 0,
      values: 0,
      reasoning: 0,
      commitment: 0
    };
    
    // Populate dimension scores from dqScoreComponents
    for (const dim of dqDimensions) {
      const value = dqScoreComponents?.[dim];
      if (value !== null && value !== undefined) {
        const numValue = typeof value === 'number' ? value : parseFloat(String(value));
        if (typeof numValue === 'number' && !isNaN(numValue) && isFinite(numValue) && numValue >= 0 && numValue <= 1) {
          dimensionScores[dim] = numValue;
        }
      }
    }
    
    // Calculate weighted average for stage progression
    let weightedSum = 0;
    let totalWeight = 0;
    for (const dim of dqDimensions) {
      const score = dimensionScores[dim];
      const weight = weights[dim];
      weightedSum += score * weight;
      totalWeight += weight;
    }
    const weightedAvgScore = totalWeight > 0 ? weightedSum / totalWeight : finalDqScore;
    
    // Also calculate average of top 5 dimensions (for backward compatibility and frontend display)
    const sortedScores = [...dqScoreValues].sort((a, b) => b - a);
    const top5Scores = sortedScores.slice(0, Math.min(5, sortedScores.length));
    const avgTop5Score = top5Scores.length > 0 
      ? top5Scores.reduce((sum, val) => sum + val, 0) / top5Scores.length 
      : finalDqScore;
    
    // Use weighted average for stage progression (more contextual)
    const avgTop5ScoreForStage = weightedAvgScore;
    console.log("DQ Score (weighted avg):", weightedAvgScore, "DQ Score (avg top 5):", avgTop5Score, "from top 5:", top5Scores);

    // Determine persona stage and get appropriate system prompt
    let personaConfig = personaStageConfigs[persona];
    if (!personaConfig) {
      console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Persona "${persona}" not found in personaStageConfigs! Defaulting to jamie.`);
      personaConfig = personaStageConfigs['jamie'];
    }
    console.log('✅ Persona config validated - persona:', persona, 'defaultStage:', personaConfig.defaultStage);
    console.log('✅ Persona config stages:', personaConfig.stages.map(s => s.key));
    
    // CRITICAL: Force correct default stage for this persona (never use wrong persona's default)
    let stageKey: PersonaStageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
    console.log('🔍 Initial stageKey before determination:', stageKey);
    
    // Apply light smoothing: use exponential moving average to prevent rapid jumps
    // Store previous average in session state for smoothing
    const smoothingKey = `${persona}_avgScore`;
    const previousAvg = (sessionState[sessionId] as any)[smoothingKey] || avgTop5ScoreForStage;
    const smoothingFactor = 0.7; // 70% new score, 30% previous (more responsive, less smoothing)
    const smoothedScore = (smoothingFactor * avgTop5ScoreForStage) + ((1 - smoothingFactor) * previousAvg);
    (sessionState[sessionId] as any)[smoothingKey] = smoothedScore;

    // Use smoothed score for stage determination to prevent rapid jumps
    const stageScore = smoothedScore;
    console.log("Stage score (smoothed):", stageScore, "from weighted avg:", avgTop5ScoreForStage, "previous:", previousAvg);
    
    // Detect coaching style for persona response patterns
    const isDirective = /(?:you should|you need to|you must|do this|try this|start by|pursue|ask them to)/i.test(userMessage);
    const isExplorative = /(?:what|how|why|tell me|explore|consider|think about|what if|help me think)/i.test(userMessage);
    const coachingStyle: 'directive' | 'explorative' | 'mixed' = 
      isDirective && isExplorative ? 'mixed' :
      isDirective ? 'directive' :
      isExplorative ? 'explorative' : 'mixed';
    console.log("Coaching style detected:", coachingStyle);

    if (!sessionState[sessionId].personaStages[persona]) {
      console.log(`🔄 Initializing persona state for "${persona}" - default stage: ${personaConfig.stages[0].key}`);
      sessionState[sessionId].personaStages[persona] = {
        currentIndex: 0,
        maxAchievedIndex: 0,
        sampleCounts: new Array(personaConfig.stages.length).fill(0)
      };
    }

    const personaState = sessionState[sessionId].personaStages[persona];
    
    // CRITICAL: Validate that the stored state matches the persona's config
    if (personaState.currentIndex >= personaConfig.stages.length) {
      console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Persona state currentIndex ${personaState.currentIndex} is out of bounds for persona "${persona}" (${personaConfig.stages.length} stages). Resetting to 0.`);
      personaState.currentIndex = 0;
    }

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
      // CRITICAL: Final validation before returning for locked progression
      const currentIndex = personaState.currentIndex;
      if (currentIndex < 0 || currentIndex >= personaConfig.stages.length) {
        console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid currentIndex ${currentIndex} for persona "${persona}" with ${personaConfig.stages.length} stages. Defaulting to index 0.`);
        stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
      } else {
        stageKey = personaConfig.stages[currentIndex].key;
        const validStageKeys = personaConfig.stages.map(s => s.key);
        if (!validStageKeys.includes(stageKey)) {
          console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid stage "${stageKey}" for persona "${persona}". Defaulting to: ${personaConfig.defaultStage || personaConfig.stages[0].key}`);
          stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
        }
        console.log(`📊 determineStageKey (locked) result: persona="${persona}", score=${stageScore.toFixed(3)}, currentIndex=${currentIndex}, stageKey="${stageKey}"`);
      }
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
      
      // CRITICAL: Final validation before returning - ensure index is valid
      if (chosenIndex < 0 || chosenIndex >= personaConfig.stages.length) {
        console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid chosenIndex ${chosenIndex} for persona "${persona}" with ${personaConfig.stages.length} stages. Defaulting to index 0.`);
        chosenIndex = 0;
        personaState.currentIndex = 0;
      }
      
      stageKey = personaConfig.stages[chosenIndex].key;
      const validStageKeys = personaConfig.stages.map(s => s.key);
      
      // CRITICAL: Double-check that the returned stage key is valid for this persona
      if (!validStageKeys.includes(stageKey)) {
        console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid stage "${stageKey}" for persona "${persona}". Valid stages:`, validStageKeys);
        stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
        console.error(`⚠️ Defaulting to: ${stageKey}`);
      }
      
      console.log(`📊 determineStageKey result: persona="${persona}", score=${stageScore.toFixed(3)}, chosenIndex=${chosenIndex}, stageKey="${stageKey}"`);
    }
    
    // CRITICAL: Final validation after stage determination - MUST RUN BEFORE PROMPT GENERATION
    const validStagesForPersona = personaConfig.stages.map(s => s.key);
    if (!validStagesForPersona.includes(stageKey)) {
      console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid stage "${stageKey}" for persona "${persona}". Valid stages:`, validStagesForPersona);
      console.error(`⚠️ Current persona config:`, {
        persona,
        defaultStage: personaConfig.defaultStage,
        stages: validStagesForPersona,
        receivedStageKey: stageKey
      });
      stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
      console.error(`⚠️✅ FORCING CORRECT STAGE: Defaulting to "${stageKey}" for persona "${persona}"`);
    }
    
    // CRITICAL: Double-check stage matches persona before proceeding
    if (persona === 'kavya' && (stageKey === 'confused' || stageKey === 'uncertain' || stageKey === 'thoughtful' || stageKey === 'confident')) {
      console.error(`⚠️⚠️⚠️ CRITICAL: Kavya received Jamie stage "${stageKey}"! Forcing correct stage "overwhelmed"`);
      stageKey = 'overwhelmed';
      personaState.currentIndex = 0;
    }
    
    console.log('✅ Validated stage key:', stageKey, 'for persona:', persona);
    const systemPrompt = getPersonaSystemPrompt(persona, stageKey, coachingStyle);
    console.log('Persona selection:', {
      persona,
      stageKey,
      coachingStyle,
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
    const maxTurnsForPersona = getMaxTurns(persona);
    const turnsRemaining = maxTurnsForPersona - turnsUsed;
    console.log(`📊 Turn tracking: persona="${persona}", turnsUsed=${turnsUsed}, maxTurns=${maxTurnsForPersona}, turnsRemaining=${turnsRemaining}`);
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