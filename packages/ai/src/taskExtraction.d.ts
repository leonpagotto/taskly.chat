import { TaskDraft, ChatMessage } from '@taskly/core';
export interface TaskExtractionResult {
    drafts: TaskDraft[];
    rawModelOutput?: string;
}
export interface TaskExtractorOptions {
    maxDrafts?: number;
    confidenceFloor?: number;
}
export declare function extractTaskDrafts(message: ChatMessage, opts?: TaskExtractorOptions): TaskExtractionResult;
//# sourceMappingURL=taskExtraction.d.ts.map