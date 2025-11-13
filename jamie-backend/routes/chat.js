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
            personaStages: {},
            conversationHistory: []
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
        const personaState = ensurePersonaState();
        if (personaConfig.lockOnceAchieved) {
            // Locked progression: can only move forward
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
        else {
            // Unlocked progression: can regress if score drops significantly
            let chosenIndex = personaState.currentIndex;
            // Check for progression
            for (let i = personaState.currentIndex + 1; i < personaConfig.stages.length; i++) {
                const stageConfig = personaConfig.stages[i];
                if (score >= stageConfig.minScore) {
                    personaState.sampleCounts[i] = (personaState.sampleCounts[i] || 0) + 1;
                    const requiredSamples = stageConfig.minSamples || personaConfig.minSamples;
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
                const scoreDrop = currentStageConfig.minScore - score;
                if (scoreDrop > personaConfig.regressionThreshold && chosenIndex === personaState.currentIndex) {
                    // Score dropped significantly below current stage threshold
                    // Find the highest stage that matches the current score
                    for (let i = personaState.currentIndex - 1; i >= 0; i--) {
                        const stageConfig = personaConfig.stages[i];
                        if (score >= stageConfig.minScore) {
                            chosenIndex = i;
                            break;
                        }
                    }
                }
            }
            else {
                // No regression threshold: find highest matching stage
                for (let i = personaConfig.stages.length - 1; i >= 0; i--) {
                    const stageConfig = personaConfig.stages[i];
                    if (score >= stageConfig.minScore) {
                        chosenIndex = i;
                        break;
                    }
                }
            }
            personaState.currentIndex = chosenIndex;
            return personaConfig.stages[chosenIndex].key;
        }
    };
    try {
        console.log("Received message:", userMessage);
        // Build conversation history string from previous messages
        const conversationHistory = sessionState[sessionId].conversationHistory
            .map(function (msg) { return (msg.role === 'user' ? 'Client' : 'Coach') + ": " + msg.content; })
            .join('\n\n');
        // Score DQ with conversation context (coach response will be added after generation)
        const dqScoreComponents = await (0, openai_1.scoreDQ)(userMessage, conversationHistory);
        console.log("DQ Score Components:", dqScoreComponents);
        // Calculate DQ score using the "weakest link" principle (minimum of all components)
        // Only use the 6 core DQ dimensions, exclude 'overall' and 'rationale'
        const dqDimensions = ['framing', 'alternatives', 'information', 'values', 'reasoning', 'commitment'];
        const dqScoreValues = [];
        
        // Safely extract and validate each dimension score
        for (var _i = 0, dqDimensions_1 = dqDimensions; _i < dqDimensions_1.length; _i++) {
            var dim = dqDimensions_1[_i];
            var value = dqScoreComponents === null || dqScoreComponents === void 0 ? void 0 : dqScoreComponents[dim];
            
            // Skip null/undefined
            if (value === null || value === undefined) {
                continue;
            }
            
            // Convert to number
            var numValue = typeof value === 'number' ? value : parseFloat(String(value));
            
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
        var finalDqScore = 0;
        if (dqScoreValues.length > 0) {
            // Double-check all values are valid before Math.min
            var allValid = dqScoreValues.every(function (v) { 
                return typeof v === 'number' && !isNaN(v) && isFinite(v); 
            });
            if (allValid) {
                var minScore = Math.min.apply(Math, dqScoreValues);
                // Final validation
                if (typeof minScore === 'number' && !isNaN(minScore) && isFinite(minScore)) {
                    finalDqScore = minScore;
                }
            }
        }
        
        console.log("DQ Score (minimum):", finalDqScore, "from values:", dqScoreValues, "raw components:", dqScoreComponents);
        
        // Calculate average of top 5 dimensions for stage progression (matches frontend progress calculation)
        // This ensures persona stage aligns with visible progress, not just the weakest link
        const sortedScores = dqScoreValues.slice().sort(function (a, b) { return b - a; });
        const top5Scores = sortedScores.slice(0, Math.min(5, sortedScores.length));
        const avgTop5Score = top5Scores.length > 0 
            ? top5Scores.reduce(function (sum, val) { return sum + val; }, 0) / top5Scores.length 
            : finalDqScore; // Fallback to minimum if no valid scores
        
        console.log("DQ Score (avg top 5):", avgTop5Score, "from top 5:", top5Scores);
        
        // Apply smoothing: use exponential moving average to prevent rapid jumps
        // Store previous average in session state for smoothing
        const smoothingKey = persona + "_avgScore";
        const previousAvg = sessionState[sessionId][smoothingKey] || avgTop5Score;
        const smoothingFactor = 0.3; // 30% new score, 70% previous (higher = more stable)
        const smoothedScore = (smoothingFactor * avgTop5Score) + ((1 - smoothingFactor) * previousAvg);
        sessionState[sessionId][smoothingKey] = smoothedScore;
        console.log("Stage score (smoothed):", smoothedScore, "from avg:", avgTop5Score, "previous:", previousAvg);
        
        const stageKey = determineStageKey(smoothedScore);
        const systemPrompt = (0, prompts_1.getPersonaSystemPrompt)(persona, stageKey);
        console.log('Persona selection:', {
            persona,
            stageKey,
            promptPreview: systemPrompt.slice(0, 120)
        });
        const jamieReply = await (0, openai_1.getJamieResponse)(userMessage, systemPrompt, persona);
        console.log("Persona reply:", jamieReply);
        // Update conversation history
        sessionState[sessionId].conversationHistory.push({ role: 'user', content: userMessage }, { role: 'coach', content: jamieReply });
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
    }
    catch (err) {
        console.error("Error processing chat:", err);
        res.status(500).send('Failed to process message.');
    }
});
module.exports = router;
