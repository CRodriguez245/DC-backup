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
      personaStages: {}
    };
  }

  sessionState[sessionId].turnsUsed += 1;

  try {
    console.log("Received message:", userMessage);

    const dqScoreComponents = await scoreDQ(userMessage);
    console.log("DQ Score Components:", dqScoreComponents);

    // Calculate DQ score using the "weakest link" principle (minimum of all components)
    const dqScoreValues = Object.values(dqScoreComponents as Record<string, number>);
    const dqScore = Math.min(...dqScoreValues);
    console.log("DQ Score (minimum):", dqScore);

    // Determine persona stage and get appropriate system prompt
    const personaConfig = personaStageConfigs[persona] || personaStageConfigs['jamie'];
    let stageKey: PersonaStageKey = personaConfig.defaultStage;

    if (personaConfig.lockOnceAchieved) {
      if (!sessionState[sessionId].personaStages[persona]) {
        sessionState[sessionId].personaStages[persona] = {
          currentIndex: 0,
          maxAchievedIndex: 0,
          sampleCounts: new Array(personaConfig.stages.length).fill(0)
        };
      }

      const personaState = sessionState[sessionId].personaStages[persona];

      for (let i = personaState.maxAchievedIndex + 1; i < personaConfig.stages.length; i++) {
        const stageConfig = personaConfig.stages[i];
        if (dqScore >= stageConfig.minScore) {
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
      let chosenIndex = 0;
      personaConfig.stages.forEach((stageConfig, index) => {
        if (dqScore >= stageConfig.minScore) {
          chosenIndex = index;
        }
      });
      stageKey = personaConfig.stages[chosenIndex].key;
    }

    const systemPrompt = getPersonaSystemPrompt(persona, stageKey);
    console.log('Persona selection:', {
      persona,
      stageKey,
      promptPreview: systemPrompt.slice(0, 120)
    });
    
    const jamieReply = await getJamieResponse(userMessage, systemPrompt);
    console.log("Jamie reply:", jamieReply);

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
      dq_score_minimum: dqScore,
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