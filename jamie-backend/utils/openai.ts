import OpenAI from "openai";
import { dqScoringPrompt } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getJamieResponse(userInput: string, systemPrompt: string): Promise<string> {
  const chat = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput }
    ],
  });

  return chat.choices[0]?.message?.content || '';
}

export async function scoreDQ(userInput: string) {
  const prompt = dqScoringPrompt(userInput);

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
