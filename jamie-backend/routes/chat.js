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
// Persona-specific turn limits
const getMaxTurns = (persona) => {
    const normalizedPersona = (persona || '').toLowerCase();
    return normalizedPersona === 'kavya' ? 10 : 20;
};
router.post('/', async (req, res) => {
    console.log('=== INCOMING REQUEST ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Character from body:', req.body.character);
    
    const userMessage = req.body.message;
    const sessionId = req.body.session_id || 'anon-session';
    const userId = req.body.user_id || 'anon-user';
    const persona = (req.body.character || 'jamie').toLowerCase();
    console.log('Normalized persona:', persona);
    console.log('Session ID:', sessionId);
    
    let personaConfig = prompts_1.personaStageConfigs[persona];
    if (!personaConfig) {
        console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Persona "${persona}" not found in personaStageConfigs! Defaulting to jamie.`);
        personaConfig = prompts_1.personaStageConfigs['jamie'];
    }
    console.log('Persona config found:', !!personaConfig);
    console.log('Persona config stages:', personaConfig.stages.map(s => s.key));
    console.log('✅ Persona config validated - persona:', persona, 'defaultStage:', personaConfig.defaultStage);
    
    // CRITICAL: Check if this is a reset/new session - if conversation history contains wrong persona context, clear it
    const isReset = req.body.reset === true || req.body.reset === 'true';
    const hasExistingHistory = sessionState[sessionId] && sessionState[sessionId].conversationHistory && sessionState[sessionId].conversationHistory.length > 0;
    
    console.log('🔍 Session check - hasExistingHistory:', hasExistingHistory, 'sessionId:', sessionId, 'persona:', persona);
    
    // Always check for contamination on EVERY request BEFORE using conversation history
    if (hasExistingHistory) {
        // Check if conversation history is contaminated with wrong persona context
        const historyText = sessionState[sessionId].conversationHistory
            .map(function (msg) { return msg.content || ''; })
            .join(' ');
        
        console.log('🔍 Checking for contamination - history length:', historyText.length, 'preview:', historyText.substring(0, 200));
        
        // CRITICAL: Detect contamination by checking for keywords that belong to OTHER personas
        const hasWrongContext = 
            (persona === 'kavya' && (
                /\bengineering\b/i.test(historyText) || 
                /\bdesign\b/i.test(historyText) || 
                /\bmajor\b/i.test(historyText) || 
                /\bmom\b/i.test(historyText) ||
                /\bart\s*school/i.test(historyText) ||
                /\bdesign\s*program/i.test(historyText) ||
                /\bux\s*design/i.test(historyText) ||
                /\bindustrial\s*design/i.test(historyText) ||
                /\bdrawing/i.test(historyText) ||
                /\bart\b/i.test(historyText) ||
                /\bcreative\s*major/i.test(historyText) ||
                /\bmechanical\s*engineering/i.test(historyText) ||
                /\bswitching\s*major/i.test(historyText)
            )) ||
            (persona === 'jamie' && (
                /\bcorporate\s*path/i.test(historyText) || 
                /\bentrepreneurship/i.test(historyText) || 
                /\bstartup/i.test(historyText) ||
                /\bstarting\s*my\s*own\s*business/i.test(historyText)
            )) ||
            (persona === 'andres' && (
                /\bmom\b/i.test(historyText) || 
                /\bdrawing/i.test(historyText) || 
                /\bart\s*school/i.test(historyText)
            ));
        
        if (hasWrongContext) {
            console.log('⚠️⚠️⚠️ CONVERSATION HISTORY CONTAMINATION DETECTED! Clearing contaminated history for persona:', persona);
            console.log('⚠️ Contaminated history preview (first 500 chars):', historyText.substring(0, 500));
            // Reset everything - treat as new session
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
            console.log('✅ Session cleared - ready for fresh start');
        } else {
            console.log('✅ No contamination detected - using existing history');
        }
    }
    
    // Initialize fresh session if it doesn't exist or was reset
    if (isReset || (!sessionState[sessionId])) {
        // New session or reset - initialize fresh state
        console.log('🔄 Initializing fresh session state (reset:', isReset, ')');
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
        console.log('✅ Session state initialized - turnsUsed:', sessionState[sessionId].turnsUsed);
    }
    
    // CRITICAL: Only increment turnsUsed if this is NOT a reset (reset already sets it to 0)
    // If it's a reset, we'll set it to 1 after initialization
    if (!isReset) {
        sessionState[sessionId].turnsUsed += 1;
    } else {
        // Reset case: set to 1 since we're processing the first message
        sessionState[sessionId].turnsUsed = 1;
        console.log('✅ Reset session - turnsUsed set to 1 for first message');
    }
    const ensurePersonaState = () => {
        if (!sessionState[sessionId].personaStages[persona]) {
            // CRITICAL: Initialize with correct default stage (index 0) for this persona
            console.log(`🔄 Initializing persona state for "${persona}" - default stage: ${personaConfig.stages[0].key}`);
            sessionState[sessionId].personaStages[persona] = {
                currentIndex: 0,
                maxAchievedIndex: 0,
                sampleCounts: new Array(personaConfig.stages.length).fill(0)
            };
        }
        // CRITICAL: Validate that the stored state matches the persona's config
        const personaState = sessionState[sessionId].personaStages[persona];
        if (personaState.currentIndex >= personaConfig.stages.length) {
            console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Persona state currentIndex ${personaState.currentIndex} is out of bounds for persona "${persona}" (${personaConfig.stages.length} stages). Resetting to 0.`);
            personaState.currentIndex = 0;
        }
        return personaState;
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
            // CRITICAL: Final validation before returning for locked progression
            const currentIndex = personaState.currentIndex;
            if (currentIndex < 0 || currentIndex >= personaConfig.stages.length) {
                console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid currentIndex ${currentIndex} for persona "${persona}" with ${personaConfig.stages.length} stages. Defaulting to index 0.`);
                return personaConfig.defaultStage || personaConfig.stages[0].key;
            }
            const returnedStageKey = personaConfig.stages[currentIndex].key;
            const validStageKeys = personaConfig.stages.map(s => s.key);
            if (!validStageKeys.includes(returnedStageKey)) {
                console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid stage "${returnedStageKey}" for persona "${persona}". Defaulting to: ${personaConfig.defaultStage || personaConfig.stages[0].key}`);
                return personaConfig.defaultStage || personaConfig.stages[0].key;
            }
            console.log(`📊 determineStageKey (locked) result: persona="${persona}", score=${score.toFixed(3)}, currentIndex=${currentIndex}, stageKey="${returnedStageKey}"`);
            return returnedStageKey;
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
            
            // CRITICAL: Final validation before returning - ensure index is valid
            if (chosenIndex < 0 || chosenIndex >= personaConfig.stages.length) {
                console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid chosenIndex ${chosenIndex} for persona "${persona}" with ${personaConfig.stages.length} stages. Defaulting to index 0.`);
                chosenIndex = 0;
                personaState.currentIndex = 0;
            }
            
            const returnedStageKey = personaConfig.stages[chosenIndex].key;
            const validStageKeys = personaConfig.stages.map(s => s.key);
            
            // CRITICAL: Double-check that the returned stage key is valid for this persona
            if (!validStageKeys.includes(returnedStageKey)) {
                console.error(`⚠️⚠️⚠️ CRITICAL ERROR: determineStageKey returned invalid stage "${returnedStageKey}" for persona "${persona}". Valid stages:`, validStageKeys);
                const defaultStageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
                console.error(`⚠️ Defaulting to: ${defaultStageKey}`);
                return defaultStageKey;
            }
            
            console.log(`📊 determineStageKey result: persona="${persona}", score=${score.toFixed(3)}, chosenIndex=${chosenIndex}, stageKey="${returnedStageKey}"`);
            return returnedStageKey;
        }
    };
    try {
        console.log("Received message:", userMessage);
        // Build conversation history string from previous messages
        // CRITICAL: Only use conversation history if it's NOT contaminated
        const conversationHistoryArray = sessionState[sessionId].conversationHistory || [];
        const conversationHistory = conversationHistoryArray
            .map(function (msg) { return (msg.role === 'user' ? 'Client' : 'Coach') + ": " + msg.content; })
            .join('\n\n');
        
        // Log conversation history for debugging
        console.log('📜 Conversation history length:', conversationHistory.length);
        console.log('📜 Conversation history preview (first 500 chars):', conversationHistory.substring(0, 500));
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
        let stageKey = determineStageKey(smoothedScore);
        
        // CRITICAL: Validate that stageKey is valid for this persona
        const validStagesForPersona = personaConfig.stages.map(s => s.key);
        if (!validStagesForPersona.includes(stageKey)) {
            console.error(`⚠️⚠️⚠️ CRITICAL ERROR: Invalid stage "${stageKey}" for persona "${persona}". Valid stages:`, validStagesForPersona);
            console.error(`⚠️ Defaulting to persona's default stage: ${personaConfig.defaultStage || personaConfig.stages[0].key}`);
            stageKey = personaConfig.defaultStage || personaConfig.stages[0].key;
        }
        
        console.log('✅ Validated stage key:', stageKey, 'for persona:', persona);
        const systemPrompt = (0, prompts_1.getPersonaSystemPrompt)(persona, stageKey, coachingStyle);
        console.log('=== PERSONA SELECTION DEBUG ===');
        console.log('Persona from request:', persona);
        console.log('Stage key:', stageKey);
        console.log('Coaching style:', coachingStyle);
        console.log('Conversation history length:', conversationHistory ? conversationHistory.length : 0);
        console.log('Prompt preview (first 300 chars):', systemPrompt.slice(0, 300));
        console.log('Prompt contains "Kavya":', systemPrompt.includes('Kavya') || systemPrompt.includes('kavya'));
        console.log('Prompt contains "corporate path":', systemPrompt.includes('corporate path'));
        console.log('Prompt contains "engineering":', systemPrompt.includes('engineering'));
        console.log('================================');
        
        // CRITICAL: Validate persona is correct - log warning if mismatch detected
        if (persona === 'kavya' && (systemPrompt.includes('engineering') || systemPrompt.includes('design') || systemPrompt.includes('major'))) {
            console.error('⚠️⚠️⚠️ CRITICAL WARNING: Kavya prompt contains Jamie context! Prompt may be incorrect.');
            console.error('Prompt snippet with Jamie content:', systemPrompt.match(/engineering|design|major/gi));
        }
        if (persona === 'kavya' && !systemPrompt.includes('corporate path') && !systemPrompt.includes('starting your own business')) {
            console.error('⚠️⚠️⚠️ CRITICAL WARNING: Kavya prompt missing her core context (corporate vs entrepreneurship)!');
        }
        
        // CRITICAL: For Kavya at turn 10, inject closing message INSTEAD OF generating response
        const maxTurnsForPersona = getMaxTurns(persona);
        const shouldInjectClosing = persona === 'kavya' && sessionState[sessionId].turnsUsed === maxTurnsForPersona;
        console.log('🔍 Closing message check:', {
            persona,
            turnsUsed: sessionState[sessionId].turnsUsed,
            maxTurnsForPersona,
            shouldInjectClosing
        });
        
        let jamieReply;
        if (shouldInjectClosing) {
            jamieReply = "I have to go. Is there anything else you want to say before we wrap up?";
            console.log('🔚 Kavya closing message injected at turn 10 - skipping AI generation');
        } else {
            jamieReply = await (0, openai_1.getJamieResponse)(userMessage, systemPrompt, persona, conversationHistory);
            console.log("Persona reply:", jamieReply);
            
            // CRITICAL: Post-response contamination check for Kavya
            if (persona === 'kavya') {
                const jamieKeywords = /\b(engineering|mechanical engineering|design\s*(?:course|program|school)|switching\s*(?:your|my)\s*major|majoring\s*in|art\s*school|ux\s*design|parent[^s]|mom|dad|disappointing\s*(?:my|your)\s*(?:parent|mom|dad))/i;
                if (jamieKeywords.test(jamieReply)) {
                    console.error('⚠️⚠️⚠️ CRITICAL: Kavya response contains Jamie keywords! Clearing history and regenerating.');
                    // Clear contaminated history
                    sessionState[sessionId].conversationHistory = [];
                    sessionState[sessionId].turnsUsed = 1; // Reset to 1 since we're processing this turn
                    // Regenerate with clean history
                    jamieReply = await (0, openai_1.getJamieResponse)(userMessage, systemPrompt, persona, '');
                    console.log("✅ Regenerated Kavya reply (clean history):", jamieReply);
                }
            }
        }
        
        // Update conversation history
        sessionState[sessionId].conversationHistory.push({ role: 'user', content: userMessage }, { role: 'coach', content: jamieReply });
        for (const dimension of Object.keys(dqScoreComponents)) {
            if (dqScoreComponents[dimension] >= 0.3) {
                sessionState[sessionId].dqCoverage[dimension] = true;
            }
        }
        // turnsUsed is already declared above (line 350)
        const turnsRemaining = maxTurnsForPersona - turnsUsed;
        console.log(`📊 Turn tracking: persona="${persona}", turnsUsed=${turnsUsed}, maxTurns=${maxTurnsForPersona}, turnsRemaining=${turnsRemaining}`);
        const dqCoverage = sessionState[sessionId].dqCoverage;
        
        // CRITICAL: For Kavya, if we just sent the closing message, allow one more turn for response
        const isWaitingForFinalResponse = persona === 'kavya' && shouldInjectClosing;
        const effectiveTurnsRemaining = isWaitingForFinalResponse ? 1 : turnsRemaining;
        
        let conversationStatus = 'in-progress';
        if (Object.values(dqCoverage).every(Boolean)) {
            conversationStatus = 'dq-complete';
        }
        // For Kavya, if we just sent closing message, stay in-progress to allow final response
        // Otherwise, end if turns are exhausted
        else if (!isWaitingForFinalResponse && turnsRemaining <= 0) {
            conversationStatus = 'turn-limit-reached';
        }
        // After the user responds to the closing message, end the session
        else if (persona === 'kavya' && sessionState[sessionId].turnsUsed > maxTurnsForPersona) {
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
            turnsRemaining: effectiveTurnsRemaining,
            dqCoverage,
            conversationStatus,
            sessionSummary,
            isWaitingForFinalResponse: isWaitingForFinalResponse,
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
