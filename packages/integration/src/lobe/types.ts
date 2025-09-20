export interface LobeChatMessage { id: string; role: 'user' | 'assistant' | 'system'; content: string }
export interface LobeReply { id: string; content: string }
export interface LobeChatProviderOptions { systemPrompt?: string }
export interface LobeChatProvider {
  generateReply(messages: LobeChatMessage[], options?: LobeChatProviderOptions): Promise<LobeReply>
}
