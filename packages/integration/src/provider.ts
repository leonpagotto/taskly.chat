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
  // placeholder for env-based selection later
  return 'gemini';
}