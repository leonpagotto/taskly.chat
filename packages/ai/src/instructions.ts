import { InstructionLayer, MergedInstructions } from '@taskly/core';

export function mergeInstructionLayers(layers: InstructionLayer[]): MergedInstructions {
  // Sort strategy: global first, then project, then ephemeral (stable within each)
  const ordered = [...layers].sort((a, b) => rank(a) - rank(b));
  const systemPrompt = ordered.map(l => formatLayer(l)).join('\n\n');
  return { systemPrompt, layers: ordered };
}

function rank(layer: InstructionLayer): number {
  if (layer.id === 'global') return 0;
  if (layer.id.startsWith('project:')) return 1;
  return 2; // ephemeral context
}

function formatLayer(layer: InstructionLayer): string {
  return `# ${layer.id}\n${layer.content.trim()}`;
}
