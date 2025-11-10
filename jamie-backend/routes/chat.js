"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("../utils/openai");
const prompts_1 = require("../utils/prompts");
const router = express_1.default.Router();
const sessionState = {};
const MAX_TURNS = 20;
router.post('/', async (req, res) => {
    const userMessage = req.body.message;
    const sessionId = req.body.session_id || 'anon-session';
    const userId = req.body.user_id || 'anon-user';
    const persona = (req.body.character || 'jamie').toLowerCase();
    const personaConfig = prompts_1.personaStageConfigs[persona] || prompts_1.personaStageConfigs['jamie'];
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
    const ensurePersonaState = () => {
        if (!sessionState[sessionId].personaStages[persona]) {
            sessionState[sessionId].personaStages[persona] = {
                currentIndex: 0,
                maxAchievedIndex: 0,
                sampleCounts: new Array(personaConfig.stages.length).fill(0)
            };
        }
        return sessionState[sessionId].personaStages[persona];
    };
    const determineStageKey = (score) => {
        if (personaConfig.lockOnceAchieved) {
            const personaState = ensurePersonaState();
            for (let i = personaState.maxAchievedIndex + 1; i < personaConfig.stages.length; i++) {
                const stageConfig = personaConfig.stages[i];
                if (score >= stageConfig.minScore) {
                    personaState.sampleCounts[i] = (personaState.sampleCounts[i] || 0) + 1;
                    const requiredSamples = stageConfig.minSamples || personaConfig.minSamples;
                    if (personaState.sampleCounts[i] >= requiredSamples) {
                        personaState.maxAchievedIndex = i;
                        personaState.currentIndex = i;
                    }
                }
            }
            return personaConfig.stages[personaState.currentIndex].key;
        }
        let chosenIndex = 0;
        personaConfig.stages.forEach((stageConfig, index) => {
            if (score >= stageConfig.minScore) {
                chosenIndex = index;
            }
        });
        return personaConfig.stages[chosenIndex].key;
    };
    try {
        console.log("Received message:", userMessage);
        const dqScoreComponents = await (0, openai_1.scoreDQ)(userMessage);
        console.log("DQ Score Components:", dqScoreComponents);
        const dqScoreValues = Object.values(dqScoreComponents);
        const dqScore = Math.min(...dqScoreValues);
        console.log("DQ Score (minimum):", dqScore);
        const stageKey = determineStageKey(dqScore);
        const systemPrompt = (0, prompts_1.getPersonaSystemPrompt)(persona, stageKey);
        const jamieReply = await (0, openai_1.getJamieResponse)(userMessage, systemPrompt);
        console.log("Persona reply:", jamieReply);
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
            persona_stage: stageKey,
            persona
        };
        res.status(200).json(response);
    }
    catch (err) {
        console.error("Error processing chat:", err);
        res.status(500).send('Failed to process message.');
    }
});
module.exports = router;
