import OpenAI from "openai";
import { dqScoringPrompt } from "./prompts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Helper function to retry OpenAI API calls with exponential backoff for rate limit errors
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      // Check if it's a rate limit error
      const isRateLimitError = error?.status === 429 || 
                               error?.code === 'rate_limit_exceeded' ||
                               error?.message?.includes('rate limit');

      if (!isRateLimitError || attempt === maxRetries - 1) {
        // Not a rate limit error, or we've exhausted retries
        throw error;
      }

      // Calculate delay with exponential backoff
      // Use retry-after header if available, otherwise use exponential backoff
      const retryAfterMs = error?.headers?.['retry-after-ms'] 
        ? parseInt(error.headers['retry-after-ms'])
        : baseDelay * Math.pow(2, attempt);

      const delay = Math.min(retryAfterMs, 30000); // Cap at 30 seconds

      console.log(`⏳ Rate limit hit, retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt + 1}/${maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Max retries exceeded');
}

export async function getJamieResponse(userInput: string, systemPrompt: string, persona?: string, conversationHistory: string = ''): Promise<string> {
  // Check if this is a persona with 6 sentence limit (Andres, Kavya, Daniel, Sarah, or Jamie)
  // Check both the persona parameter and the system prompt content
  const has6SentenceLimit = (persona?.toLowerCase() === 'andres' || persona?.toLowerCase() === 'kavya' || 
                              persona?.toLowerCase() === 'daniel' || persona?.toLowerCase() === 'sarah' ||
                              persona?.toLowerCase() === 'jamie') || 
                             systemPrompt.includes('RESPONSE LENGTH: You MUST respond with EXACTLY 6 sentences');
  
  if (has6SentenceLimit) {
    console.log(`🔒 Applying 200 token limit for ${persona || 'persona'} with 6 sentence limit`);
  }
  
  // Build messages array with conversation history if provided
  const messages: any[] = [
    { role: "system", content: systemPrompt }
  ];
  
  // If conversation history is provided, parse and add it
  if (conversationHistory && conversationHistory.trim()) {
    const historyLines = conversationHistory.split('\n\n').filter(line => line.trim());
    for (const line of historyLines) {
      if (line.startsWith('Client:')) {
        messages.push({ role: "user", content: line.replace(/^Client:\s*/, '') });
      } else if (line.startsWith('Coach:')) {
        messages.push({ role: "assistant", content: line.replace(/^Coach:\s*/, '') });
      }
    }
  }
  
  // Add the current user input
  messages.push({ role: "user", content: userInput });
  
  const chat = await retryWithBackoff(async () => {
    return await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      // Limit tokens for personas with 6 sentence limit (approximately 6 sentences = ~150-200 tokens)
      max_tokens: has6SentenceLimit ? 200 : undefined,
    });
  });

  const response = chat.choices[0]?.message?.content || '';
  if (has6SentenceLimit) {
    const sentenceCount = (response.match(/[.!?]+/g) || []).length;
    console.log(`📊 ${persona || 'Persona'} response: ${sentenceCount} sentences, ${chat.usage?.completion_tokens || 'unknown'} tokens`);
  }
  
  return response;
}

export async function scoreDQ(userInput: string, conversationHistory: string = '', coachResponse?: string) {
  const prompt = dqScoringPrompt(userInput, conversationHistory, coachResponse);

  const chat = await retryWithBackoff(async () => {
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
  } catch (e) {
    const match = text.match(/\{[\s\S]*?\}/);
    if (match) {
      return JSON.parse(match[0]);
    } else {
      throw new Error("Failed to parse JSON: " + text);
    }
  }
}
