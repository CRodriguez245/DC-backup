import express from 'express';
import { getJamieResponse, scoreDQ } from '../utils/openai';
import { getJamieSystemPrompt } from '../utils/prompts';

const router = express.Router();

type DQDimension = 'framing' | 'alternatives' | 'information' | 'values' | 'reasoning' | 'commitment';

// In-memory session state storage (For Production, replace with Redis/DB)
const sessionState: Record<string, {
  turnsUsed: number;
  dqCoverage: Record<DQDimension, boolean>;
}> = {};

const MAX_TURNS = 20;

router.post('/', async (req, res) => {
  const userMessage: string = req.body.message;
  const sessionId: string = req.body.session_id || 'anon-session';
  const userId: string = req.body.user_id || 'anon-user';

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
      }
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

    // Get dynamic Jamie prompt based on coach's effectiveness
    const jamieSystemPrompt = getJamieSystemPrompt(dqScore);
    
    const jamieReply = await getJamieResponse(userMessage, jamieSystemPrompt);
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
      feedback: conversationStatus === 'dq-complete' ? 'You covered all key areas of Decision Quality.' : 'Session ended before all DQ areas were explored.'
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
    };

    res.status(200).json(response);

  } catch (err) {
    console.error("Error processing chat:", err);
    res.status(500).send('Failed to process message.');
  }
});

module.exports = router;