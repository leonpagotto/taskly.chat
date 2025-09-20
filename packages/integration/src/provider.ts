import { ChatMessage } from '@taskly/core';
import { generateGeminiResponse } from './gemini';

export type ModelProvider = 'gemini'; // future: 'openai' | 'anthropic'

export interface ProviderResponse {
  id: string;
  content: string;
}

export interface ProviderOptions {
  provider?: ModelProvider;
  systemPrompt?: string;
}

export async function generateModelResponse(messages: ChatMessage[], options: ProviderOptions = {}): Promise<ProviderResponse> {
  const provider: ModelProvider = options.provider || 'gemini';
  switch (provider) {
    case 'gemini': {
      const r = await generateGeminiResponse(messages, options.systemPrompt);
      return { id: r.id, content: r.content };
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function resolveDefaultProvider(): ModelProvider {
  const raw = (globalThis as any).process?.env?.MODEL_PROVIDER?.trim()?.toLowerCase();
  if (!raw) return 'gemini';
  switch (raw) {
    case 'gemini':
      return 'gemini';
    default:
      // Fail closed to gemini but surface a warning once per session
      if (typeof console !== 'undefined') {
        console.warn(`[integration] Unknown MODEL_PROVIDER='${raw}', falling back to 'gemini'`);
      }
      return 'gemini';
  }
}