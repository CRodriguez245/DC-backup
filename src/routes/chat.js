"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("../utils/openai");
const prompts_1 = require("../utils/prompts");
const router = express_1.default.Router();
// In-memory session state storage (For Production, replace with Redis/DB)
const sessionState = {};
const MAX_TURNS = 20;

// Health check endpoint
router.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

router.post('/', async (req, res) => {
    const userMessage = req.body.message;
    const sessionId = req.body.session_id || 'anon-session';
    const userId = req.body.user_id || 'anon-user';
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
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        // Return mock response for development
        console.log("Using mock response - no OpenAI API key configured");
        const mockDqScoreComponents = {
            framing: 0.7,
            alternatives: 0.6,
            information: 0.8,
            values: 0.5,
            reasoning: 0.9,
            commitment: 0.4
        };
        const dqScore = Math.min(...Object.values(mockDqScoreComponents));
        const jamieReply = "I understand you're working through this decision. Let me help you think through this systematically. What's the core issue you're trying to resolve?";
        
        // Update DQ coverage if score >= 0.3
        for (const dimension of Object.keys(mockDqScoreComponents)) {
            if (mockDqScoreComponents[dimension] >= 0.3) {
                sessionState[sessionId].dqCoverage[dimension] = true;
            }
        }
        
        const turnsUsed = sessionState[sessionId].turnsUsed;
        const turnsRemaining = MAX_TURNS - turnsUsed;
        const dqCoverage = sessionState[sessionId].dqCoverage;
        let conversationStatus = 'in-progress';
        if (Object.values(dqCoverage).every(Boolean)) {
            conversationStatus = 'dq-complete';
        }
        else if (turnsRemaining <= 0) {
            conversationStatus = 'turn-limit-reached';
        }
        const sessionSummary = (conversationStatus !== 'in-progress') ? {
            totalTurns: turnsUsed,
            dqAreasCompleted: Object.keys(dqCoverage).filter((k) => dqCoverage[k]),
            dqAreasMissed: Object.keys(dqCoverage).filter((k) => !dqCoverage[k]),
            feedback: conversationStatus === 'dq-complete' ? 'You covered all key areas of Decision Quality.' : 'Session ended before all DQ areas were explored.'
        } : null;
        
        const response = {
            session_id: sessionId,
            user_id: userId,
            user_message: userMessage,
            jamie_reply: jamieReply,
            dq_score: mockDqScoreComponents,
            dq_score_minimum: dqScore,
            turnsUsed,
            turnsRemaining,
            dqCoverage,
            conversationStatus,
            sessionSummary,
            timestamp: new Date().toISOString(),
        };
        res.status(200).json(response);
        return;
    }
    
    try {
        console.log("Received message:", userMessage);
        const dqScoreComponents = await (0, openai_1.scoreDQ)(userMessage);
        console.log("DQ Score Components:", dqScoreComponents);
        // Calculate DQ score using the "weakest link" principle (minimum of all components)
        const dqScoreValues = Object.values(dqScoreComponents);
        const dqScore = Math.min(...dqScoreValues);
        console.log("DQ Score (minimum):", dqScore);
        // Get dynamic Jamie prompt based on coach's effectiveness
        const jamieSystemPrompt = (0, prompts_1.getJamieSystemPrompt)(dqScore);
        const jamieReply = await (0, openai_1.getJamieResponse)(userMessage, jamieSystemPrompt);
        console.log("Jamie reply:", jamieReply);
        // Update DQ coverage if score >= 0.3
        for (const dimension of Object.keys(dqScoreComponents)) {
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
        }
        else if (turnsRemaining <= 0) {
            conversationStatus = 'turn-limit-reached';
        }
        const sessionSummary = (conversationStatus !== 'in-progress') ? {
            totalTurns: turnsUsed,
            dqAreasCompleted: Object.keys(dqCoverage).filter((k) => dqCoverage[k]),
            dqAreasMissed: Object.keys(dqCoverage).filter((k) => !dqCoverage[k]),
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
    }
    catch (err) {
        console.error("Error processing chat:", err);
        res.status(500).send('Failed to process message.');
    }
});
module.exports = router;
