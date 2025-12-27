"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJamieResponse = getJamieResponse;
exports.scoreDQ = scoreDQ;
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./prompts");
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
/**
 * Helper function to retry OpenAI API calls with exponential backoff for rate limit errors
 */
async function retryWithBackoff(fn, maxRetries, baseDelay) {
    if (maxRetries === void 0) { maxRetries = 3; }
    if (baseDelay === void 0) { baseDelay = 1000; }
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            // Check if it's a rate limit error
            const isRateLimitError = (error === null || error === void 0 ? void 0 : error.status) === 429 ||
                (error === null || error === void 0 ? void 0 : error.code) === 'rate_limit_exceeded' ||
                ((error === null || error === void 0 ? void 0 : error.message) === null || (error === null || error === void 0 ? void 0 : error.message) === void 0 ? void 0 : error.message.includes('rate limit'));
            if (!isRateLimitError || attempt === maxRetries - 1) {
                // Not a rate limit error, or we've exhausted retries
                throw error;
            }
            // Calculate delay with exponential backoff
            // Use retry-after header if available, otherwise use exponential backoff
            const retryAfterMs = (error === null || error === void 0 ? void 0 : error.headers) && error.headers['retry-after-ms']
                ? parseInt(error.headers['retry-after-ms'])
                : baseDelay * Math.pow(2, attempt);
            const delay = Math.min(retryAfterMs, 30000); // Cap at 30 seconds
            console.log("⏳ Rate limit hit, retrying in " + (delay / 1000).toFixed(1) + "s (attempt " + (attempt + 1) + "/" + maxRetries + ")");
            await new Promise(function (resolve) { return setTimeout(resolve, delay); });
        }
    }
    throw new Error('Max retries exceeded');
}
async function getJamieResponse(userInput, systemPrompt, persona, conversationHistory) {
    if (conversationHistory === void 0) { conversationHistory = ''; }
    // Check if this is Andres or Kavya persona (6 sentence limit)
    // Check both the persona parameter and the system prompt content
    const normalizedPersona = (persona === null || persona === void 0 ? void 0 : persona.toLowerCase()) || '';
    const isAndres = normalizedPersona === 'andres' ||
        systemPrompt.includes('Andres') ||
        systemPrompt.includes('andres') ||
        systemPrompt.includes('RESPONSE LENGTH: You MUST respond with EXACTLY 6 sentences');
    const isKavya = normalizedPersona === 'kavya' ||
        systemPrompt.includes('Kavya') ||
        systemPrompt.includes('kavya') ||
        (systemPrompt.includes('recent graduate') && systemPrompt.includes('corporate path'));
    const hasSixSentenceLimit = isAndres || isKavya || systemPrompt.includes('RESPONSE LENGTH: You MUST respond with EXACTLY 6 sentences');
    
    if (hasSixSentenceLimit) {
        const personaName = isAndres ? 'Andres' : isKavya ? 'Kavya' : 'Unknown';
        console.log("🔒 Applying 200 token limit for " + personaName + " persona");
    }
    
    // Build messages array with conversation history if provided
    const messages = [
        { role: "system", content: systemPrompt }
    ];
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.trim()) {
        // Parse conversation history (format: "Client: message\n\nCoach: response\n\n...")
        const historyParts = conversationHistory.split(/\n\n/);
        for (const part of historyParts) {
            if (part.startsWith('Client: ')) {
                messages.push({ role: "user", content: part.substring(8) });
            }
            else if (part.startsWith('Coach: ')) {
                messages.push({ role: "assistant", content: part.substring(7) });
            }
        }
    }
    
    // CRITICAL: If conversation history is empty and this is Kavya, inject her opening context
    // This prevents the model from defaulting to Jamie's context when history is empty
    if (isKavya && (!conversationHistory || !conversationHistory.trim())) {
        const kavyaOpeningContext = "Previously, you said: 'Honestly, I'm just exhausted trying to figure out what to do after graduation. I keep going back and forth between the corporate path—you know, stability, benefits, clear career progression—and the idea of starting my own business where I could actually have work-life balance and make a meaningful impact. But every corporate job I look at seems like it'll eat my soul, and starting something on my own feels impossible with student loans and no real experience. I feel like I'm supposed to just know what I want, but I don't. It's all just too much pressure right now.'";
        messages.push({ role: "assistant", content: kavyaOpeningContext });
    }
    
    // Add the current user message
    messages.push({ role: "user", content: userInput });
    
    const chat = await retryWithBackoff(async function () {
        return await openai.chat.completions.create({
        model: "gpt-4o",
            messages: messages,
            // Limit tokens for Andres/Kavya to encourage shorter responses (approximately 6 sentences = ~150 tokens)
            max_tokens: hasSixSentenceLimit ? 200 : undefined,
        });
    });
    const response = chat.choices[0]?.message?.content || '';
    if (hasSixSentenceLimit) {
        const sentenceCount = (response.match(/[.!?]+/g) || []).length;
        const personaName = isAndres ? 'Andres' : isKavya ? 'Kavya' : 'Unknown';
        console.log("📊 " + personaName + " response: " + sentenceCount + " sentences, " + (chat.usage === null || chat.usage === void 0 ? void 0 : chat.usage.completion_tokens) + " tokens");
    }
    return response;
}
async function scoreDQ(userInput, conversationHistory, coachResponse) {
    if (conversationHistory === void 0) { conversationHistory = ''; }
    const prompt = (0, prompts_1.dqScoringPrompt)(userInput, conversationHistory, coachResponse);
    const chat = await retryWithBackoff(async function () {
        return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
        });
    });
    let text = chat.choices[0]?.message?.content || '{}';
    // Remove markdown fences like ```json or ```
    text = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
    try {
        return JSON.parse(text);
    }
    catch (e) {
        const match = text.match(/\{[\s\S]*?\}/);
        if (match) {
            return JSON.parse(match[0]);
        }
        else {
            throw new Error("Failed to parse JSON: " + text);
        }
    }
}
