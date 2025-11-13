"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const openai_1 = require("../utils/openai");
const prompts_1 = require("../utils/prompts");
const scoringWeights = prompts_1.scoringWeights;
const andresResponsePatterns = prompts_1.andresResponsePatterns;
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
        const isExactMinimalPhrase = minimalMessagePatterns.some(function (pattern) { return pattern.test(trimmedMessage); });
        let dqScoreComponents;
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
        }
        else {
            // Score DQ with conversation context (coach response will be added after generation)
            dqScoreComponents = await (0, openai_1.scoreDQ)(userMessage, conversationHistory);
        }
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
        
        // Apply contextual scoring weights based on conversation stage
        const turnsUsed = sessionState[sessionId].turnsUsed;
        let conversationStage;
        if (turnsUsed <= 6) {
            conversationStage = 'earlyConversation';
        }
        else if (turnsUsed <= 13) {
            conversationStage = 'midConversation';
        }
        else {
            conversationStage = 'lateConversation';
        }
        const weights = scoringWeights[conversationStage];
        console.log("Conversation stage: " + conversationStage + " (turn " + turnsUsed + "), applying weights:", weights);
        // Create a map of dimension to score
        const dimensionScores = {
            framing: 0,
            alternatives: 0,
            information: 0,
            values: 0,
            reasoning: 0,
            commitment: 0
        };
        // Populate dimension scores from dqScoreComponents
        for (var _i = 0, dqDimensions_2 = dqDimensions; _i < dqDimensions_2.length; _i++) {
            var dim = dqDimensions_2[_i];
            var value = dqScoreComponents === null || dqScoreComponents === void 0 ? void 0 : dqScoreComponents[dim];
            if (value !== null && value !== undefined) {
                var numValue = typeof value === 'number' ? value : parseFloat(String(value));
                if (typeof numValue === 'number' && !isNaN(numValue) && isFinite(numValue) && numValue >= 0 && numValue <= 1) {
                    dimensionScores[dim] = numValue;
                }
            }
        }
        // Calculate weighted average for stage progression
        var weightedSum = 0;
        var totalWeight = 0;
        for (var _a = 0, dqDimensions_3 = dqDimensions; _a < dqDimensions_3.length; _a++) {
            var dim = dqDimensions_3[_a];
            var score = dimensionScores[dim];
            var weight = weights[dim];
            weightedSum += score * weight;
            totalWeight += weight;
        }
        var weightedAvgScore = totalWeight > 0 ? weightedSum / totalWeight : finalDqScore;
        // Also calculate average of top 5 dimensions (for backward compatibility and frontend display)
        const sortedScores = dqScoreValues.slice().sort(function (a, b) { return b - a; });
        const top5Scores = sortedScores.slice(0, Math.min(5, sortedScores.length));
        const avgTop5Score = top5Scores.length > 0 
            ? top5Scores.reduce(function (sum, val) { return sum + val; }, 0) / top5Scores.length 
            : finalDqScore;
        // Use weighted average for stage progression (more contextual)
        const avgTop5ScoreForStage = weightedAvgScore;
        console.log("DQ Score (weighted avg):", weightedAvgScore, "DQ Score (avg top 5):", avgTop5Score, "from top 5:", top5Scores);
        // Apply smoothing: use exponential moving average to prevent rapid jumps
        // Store previous average in session state for smoothing
        const smoothingKey = persona + "_avgScore";
        const previousAvg = sessionState[sessionId][smoothingKey] || avgTop5ScoreForStage;
        const smoothingFactor = 0.7; // 70% new score, 30% previous (more responsive, less smoothing)
        const smoothedScore = (smoothingFactor * avgTop5ScoreForStage) + ((1 - smoothingFactor) * previousAvg);
        sessionState[sessionId][smoothingKey] = smoothedScore;
        console.log("Stage score (smoothed):", smoothedScore, "from weighted avg:", avgTop5ScoreForStage, "previous:", previousAvg);
        // Detect coaching style for persona response patterns
        const isDirective = /(?:you should|you need to|you must|do this|try this|start by|pursue|ask them to)/i.test(userMessage);
        const isExplorative = /(?:what|how|why|tell me|explore|consider|think about|what if|help me think)/i.test(userMessage);
        const coachingStyle = isDirective && isExplorative ? 'mixed' :
            isDirective ? 'directive' :
                isExplorative ? 'explorative' : 'mixed';
        console.log("Coaching style detected:", coachingStyle);
        const stageKey = determineStageKey(smoothedScore);
        const systemPrompt = (0, prompts_1.getPersonaSystemPrompt)(persona, stageKey, coachingStyle);
        console.log('Persona selection:', {
            persona,
            stageKey,
            coachingStyle,
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
