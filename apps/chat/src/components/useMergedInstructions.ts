"use client";
import { useMemo } from 'react';
import { mergeInstructionLayers } from '@taskly/ai';
import { InstructionLayer } from '@taskly/core';

const baseLayers: InstructionLayer[] = [
  { id: 'global', content: 'You are Taskly Chat, an AI assistant that helps convert user intentions into structured tasks while maintaining context and memory.' },
  { id: 'context:session', content: 'Session context is lightweight in this prototype.' }
];

export function useMergedInstructions(extraLayers: InstructionLayer[] = []) {
  return useMemo(() => mergeInstructionLayers([...baseLayers, ...extraLayers]), [extraLayers]);
}
