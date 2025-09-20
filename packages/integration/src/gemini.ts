import { ChatMessage } from '@taskly/core';

// Lightweight wrapper around Google Gemini SDK.
// Assumes environment variables GEMINI_API_KEY and GEMINI_MODEL.

interface GeminiClient {
  model: any;
}

let singleton: Promise<GeminiClient> | null = null;

async function getClient(): Promise<GeminiClient> {
  if (singleton) return singleton;
  singleton = (async () => {
    const apiKey = (globalThis as any).process?.env?.GEMINI_API_KEY as string | undefined;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    const modelName = (globalThis as any).process?.env?.GEMINI_MODEL || 'gemini-1.5-flash';
    const mod = await import('@google/generative-ai');
    const genAI = new mod.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    return { model };
  })();
  return singleton;
}

export interface GeminiChatResult {
  id: string;
  content: string;
  raw?: any;
}

export async function generateGeminiResponse(messages: ChatMessage[], systemPrompt?: string): Promise<GeminiChatResult> {
  const { model } = await getClient();
  const userVisible: string[] = [];
  if (systemPrompt) userVisible.push(`System: ${systemPrompt}`);
  for (const m of messages) {
    userVisible.push(`${m.role === 'assistant' ? 'Assistant' : 'User'}: ${m.content}`);
  }
  const prompt = userVisible.join('\n');
  const result = await model.generateContent(prompt);
  const text = result.response?.text?.() || '';
  return { id: 'gemini-' + Date.now().toString(36), content: text, raw: undefined };
}
