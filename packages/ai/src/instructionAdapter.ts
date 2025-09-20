import { InstructionLayer } from '@taskly/core';

export interface AdaptedInstructionSegment { role: 'system'; content: string }

/**
 * adaptInstructionLayers
 * Transforms internal InstructionLayer array into a simple ordered list of
 * system prompt segments suitable for downstream chat frameworks.
 */
export function adaptInstructionLayers(layers: InstructionLayer[]): AdaptedInstructionSegment[] {
  if (!layers || layers.length === 0) return [];
  // Reuse ordering logic: global -> project -> ephemeral (context)
  const ordered = [...layers]
    .filter(l => (l as any).enabled !== false) // skip disabled layers when flag present
    .sort((a, b) => rank(a) - rank(b));
  return ordered.map(l => ({ role: 'system', content: formatLayerContent(l) }));
}

function rank(layer: InstructionLayer): number {
  if (layer.id === 'global') return 0;
  if (layer.id.startsWith('project:')) return 1;
  return 2;
}

function formatLayerContent(layer: InstructionLayer): string {
  const body = (layer.content ?? '').trim();
  if (!body) return `# ${layer.id}`; // allow empty heading-only layer
  return `# ${layer.id}\n${body}`.trim();
}
