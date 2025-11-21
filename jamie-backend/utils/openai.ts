import OpenAI from "openai";
import { dqScoringPrompt } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getJamieResponse(userInput: string, systemPrompt: string, persona?: string): Promise<string> {
  // Check if this is Andres persona (6 sentence limit)
  // Check both the persona parameter and the system prompt content
  const isAndres = (persona?.toLowerCase() === 'andres') || 
                   systemPrompt.includes('Andres') || 
                   systemPrompt.includes('andres') ||
                   systemPrompt.includes('RESPONSE LENGTH: You MUST respond with EXACTLY 6 sentences');
  
  if (isAndres) {
    console.log('🔒 Applying 200 token limit for Andres persona');
  }
  
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput }
    ],
    // Limit tokens for Andres to encourage shorter responses (approximately 6 sentences = ~150 tokens)
    max_tokens: isAndres ? 200 : undefined,
  });

  const response = chat.choices[0]?.message?.content || '';
  if (isAndres) {
    const sentenceCount = (response.match(/[.!?]+/g) || []).length;
    console.log(`📊 Andres response: ${sentenceCount} sentences, ${chat.usage?.completion_tokens || 'unknown'} tokens`);
  }
  
  return response;
}

export async function scoreDQ(userInput: string, conversationHistory: string = '', coachResponse?: string) {
  const prompt = dqScoringPrompt(userInput, conversationHistory, coachResponse);

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
  } catch (e) {
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse JSON: " + text);
    }
  }
}
