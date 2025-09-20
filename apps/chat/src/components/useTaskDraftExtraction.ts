"use client";
import { useMemo } from 'react';
import { extractTaskDrafts } from '@taskly/ai';
import type { ChatMessage, TaskDraft } from '@taskly/core';

interface DraftExtractionResult { drafts: TaskDraft[]; parse?: any }

/**
 * useTaskDraftExtraction
 * Lightweight wrapper over extractTaskDrafts for future multi-phase enrichment.
 */
export function useTaskDraftExtraction(latestUserMessage?: string): DraftExtractionResult {
  return useMemo(() => {
    if (!latestUserMessage || !latestUserMessage.trim()) return { drafts: [] };
    const msg: ChatMessage = {
      id: 'draft-local',
      role: 'user',
      content: latestUserMessage,
      createdAt: new Date().toISOString()
    };
    const res = extractTaskDrafts(msg);
    return { drafts: res.drafts, parse: undefined };
  }, [latestUserMessage]);
}
