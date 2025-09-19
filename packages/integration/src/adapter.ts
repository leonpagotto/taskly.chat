import { ChatMessage, InstructionLayer } from '@taskly/core';
import { mergeInstructionLayers, extractTaskDrafts } from '@taskly/ai';

export interface OutgoingAssistantMessage {
  id: string;
  content: string;
  createdAt: string;
  source: 'model' | 'system';
}

export interface TaskDraftAttachment {
  messageId: string;
  drafts: ReturnType<typeof extractTaskDrafts>['drafts'];
}

export interface FrameworkAdapter {
  mergeSystemPrompt(layers: InstructionLayer[]): string;
  extractDrafts(message: ChatMessage): TaskDraftAttachment | null;
}

export function createFrameworkAdapter(): FrameworkAdapter {
  return {
    mergeSystemPrompt(layers) {
      return mergeInstructionLayers(layers).systemPrompt;
    },
    extractDrafts(message) {
      if (message.role !== 'user') return null;
      const result = extractTaskDrafts(message);
      if (!result.drafts.length) return null;
      return { messageId: message.id, drafts: result.drafts };
    }
  };
}
