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
// Persona-specific turn limits
const getMaxTurns = (persona) => {
    const normalizedPersona = (persona || '').toLowerCase();
    if (normalizedPersona === 'kavya')
        return 10;
    if (normalizedPersona === 'daniel')
        return 10;
    if (normalizedPersona === 'sarah')
        return 10;
    if (normalizedPersona === 'jamie')
        return 10;
    return 20; // Default for andres and others
};
router.post('/', async (req, res) => {
    const userMessage = req.body.message;
    const sessionId = req.body.session_id || 'anon-session';
    const userId = req.body.user_id || 'anon-user';
    const persona = (req.body.character || 'jamie').toLowerCase();
    const shouldReset = req.body.reset === true;
    // Handle session reset - clear existing session state if reset flag is set
    if (shouldReset && sessionState[sessionId]) {
        console.log(`🔄 Resetting session ${sessionId} due to reset flag`);
        delete sessionState[sessionId];
    }
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
        console.log(`🆕 Created new session state for ${sessionId}`);
    }
    sessionState[sessionId].turnsUsed += 1;
    try {
        console.log("Received message:", userMessage);
        // Build conversation history string from previous messages
        const conversationHistory = sessionState[sessionId].conversationHistory
            .map(msg => `${msg.role === 'user' ? 'Client' : 'Coach'}: ${msg.content}`)
            .join('\n\n');
        // PRE-CHECK: Catch truly minimal messages and leading questions (exact phrases only, not substantive content)
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
        // Detect leading questions that give answers (should be penalized)
        const leadingQuestionPatterns = [
            /^have you considered\s+/i,
            /^why don't you\s+/i,
            /^why don't\s+/i,
            /^you could\s+/i,
            /^you should\s+/i,
            /^maybe you could\s+/i,
            /^what if you\s+/i,
            /^how about\s+/i
        ];
        // Detect minimal coaching responses (should be penalized)
        const minimalCoachingPatterns = [
            /^why don't you just\s+/i,
            /^just try\s+/i,
            /^just\s+[a-z]+\s+/i
        ];
        // Only catch exact minimal phrases - if message has substantive content, let LLM score it
        const trimmedMessage = userMessage.trim();
        console.log("🔍 Checking minimal message patterns. Trimmed message:", JSON.stringify(trimmedMessage));
        const isExactMinimalPhrase = minimalMessagePatterns.some(pattern => {
            const matches = pattern.test(trimmedMessage);
            if (matches) {
                console.log("✅ Pattern matched:", pattern.toString());
            }
            return matches;
        });
        const isLeadingQuestion = leadingQuestionPatterns.some(pattern => {
            const matches = pattern.test(trimmedMessage);
            if (matches) {
                console.log("⚠️ LEADING QUESTION DETECTED:", pattern.toString());
            }
            return matches;
        });
        const isMinimalCoaching = minimalCoachingPatterns.some(pattern => {
            const matches = pattern.test(trimmedMessage);
            if (matches) {
                console.log("⚠️ MINIMAL COACHING DETECTED:", pattern.toString());
            }
            return matches;
        });
        console.log("🔍 isExactMinimalPhrase result:", isExactMinimalPhrase);
        console.log("🔍 isLeadingQuestion result:", isLeadingQuestion);
        console.log("🔍 isMinimalCoaching result:", isMinimalCoaching);
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
        else if (isLeadingQuestion || isMinimalCoaching) {
            // Leading questions and minimal coaching should be penalized (0.2-0.3 range)
            console.log("⚠️ LEADING QUESTION OR MINIMAL COACHING DETECTED - Penalizing scores for:", userMessage);
            dqScoreComponents = {
                framing: 0.2,
                alternatives: 0.2,
                information: 0.2,
                values: 0.2,
                reasoning: 0.2,
                commitment: 0.2,
                overall: 0.2,
                rationale: "The coach's message contains leading questions or minimal coaching that provides answers rather than facilitating independent thinking. Per scoring rules, this should be penalized."
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
        for (const dim of dqDimensions) {
            const value = dqScoreComponents?.[dim];
            // Skip null/undefined
            if (value === null || value === undefined)
                continue;
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
            const allValid = dqScoreValues.every(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
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
        const weights = prompts_1.scoringWeights[conversationStage];
        console.log(`Conversation stage: ${conversationStage} (turn ${turnsUsed}), applying weights:`, weights);
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
        let personaConfig = prompts_1.personaStageConfigs[persona];
        if (!personaConfig) {
            console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Persona "${persona}" not found in personaStageConfigs! Defaulting to jamie.`);
            personaConfig = prompts_1.personaStageConfigs['jamie'];
        }
        console.log('✅ Persona config validated - persona:', persona, 'defaultStage:', personaConfig.defaultStage);
        console.log('✅ Persona config stages:', personaConfig.stages.map(s => s.key));
        // CRITICAL: Force correct default stage for this persona (never use wrong persona's default)
        let stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
        console.log('🔍 Initial stageKey before determination:', stageKey);
        // Apply light smoothing: use exponential moving average to prevent rapid jumps
        // Store previous average in session state for smoothing
        const smoothingKey = `${persona}_avgScore`;
        const previousAvg = sessionState[sessionId][smoothingKey] || avgTop5ScoreForStage;
        const smoothingFactor = 0.7; // 70% new score, 30% previous (more responsive, less smoothing)
        const smoothedScore = (smoothingFactor * avgTop5ScoreForStage) + ((1 - smoothingFactor) * previousAvg);
        sessionState[sessionId][smoothingKey] = smoothedScore;
        // Use smoothed score for stage determination to prevent rapid jumps
        const stageScore = smoothedScore;
        console.log("Stage score (smoothed):", stageScore, "from weighted avg:", avgTop5ScoreForStage, "previous:", previousAvg);
        // Detect coaching style for persona response patterns
        const isDirective = /(?:you should|you need to|you must|do this|try this|start by|pursue|ask them to)/i.test(userMessage);
        const isExplorative = /(?:what|how|why|tell me|explore|consider|think about|what if|help me think)/i.test(userMessage);
        const coachingStyle = isDirective && isExplorative ? 'mixed' :
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
            }
            else {
                stageKey = personaConfig.stages[currentIndex].key;
                const validStageKeys = personaConfig.stages.map(s => s.key);
                if (!validStageKeys.includes(stageKey)) {
                    console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid stage "${stageKey}" for persona "${persona}". Defaulting to: ${personaConfig.defaultStage || personaConfig.stages[0].key}`);
                    stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
                }
                console.log(`📊 determineStageKey (locked) result: persona="${persona}", score=${stageScore.toFixed(3)}, currentIndex=${currentIndex}, stageKey="${stageKey}"`);
            }
        }
        else {
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
            }
            else {
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
        const systemPrompt = (0, prompts_1.getPersonaSystemPrompt)(persona, stageKey, coachingStyle);
        console.log('Persona selection:', {
            persona,
            stageKey,
            coachingStyle,
            promptPreview: systemPrompt.slice(0, 120)
        });
        // Pass conversation history to getJamieResponse so it knows the conversation context
        // This prevents repeating the opening message
        const jamieReply = await (0, openai_1.getJamieResponse)(userMessage, systemPrompt, persona, conversationHistory);
        console.log("Jamie reply:", jamieReply);
        // Update conversation history
        sessionState[sessionId].conversationHistory.push({ role: 'user', content: userMessage }, { role: 'coach', content: jamieReply });
        // Update DQ coverage if score >= 0.3
        for (const dimension of Object.keys(dqScoreComponents)) {
            if (dqScoreComponents[dimension] >= 0.3) {
                sessionState[sessionId].dqCoverage[dimension] = true;
            }
        }
        // turnsUsed is already declared above (line 155)
        const maxTurnsForPersona = getMaxTurns(persona);
        const turnsRemaining = maxTurnsForPersona - turnsUsed;
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
