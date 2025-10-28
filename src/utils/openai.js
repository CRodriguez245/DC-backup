"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJamieResponse = getJamieResponse;
exports.scoreDQ = scoreDQ;
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./prompts");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
async function getJamieResponse(userInput, systemPrompt) {
    const chat = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userInput }
        ],
    });
    return chat.choices[0]?.message?.content || '';
}
async function scoreDQ(userInput) {
    const prompt = (0, prompts_1.dqScoringPrompt)(userInput);
    const chat = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
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
