import { describe, it, expect } from 'vitest';
import { adaptInstructionLayers } from './instructionAdapter';
import type { InstructionLayer } from '@taskly/core';

function layer(id: string, content: string): InstructionLayer {
  if (id === 'global') return { id: 'global', content };
  if (id.startsWith('project:')) return { id: id as any, projectId: 'p1', content };
  return { id: id as any, content };
}

describe('adaptInstructionLayers', () => {
  it('returns empty array for no layers', () => {
    expect(adaptInstructionLayers([])).toEqual([]);
  });

  it('orders layers global -> project -> context', () => {
    const layers: InstructionLayer[] = [
      layer('context:session', 'ctx'),
      layer('global', 'glob'),
      layer('project:alpha', 'proj')
    ];
    const adapted = adaptInstructionLayers(layers);
    expect(adapted.map(a => a.content.startsWith('# global') ? 'global' : a.content.startsWith('# project:alpha') ? 'project' : 'context')).toEqual(['global','project','context']);
  });

  it('formats each layer with heading and trimmed content', () => {
    const layers: InstructionLayer[] = [layer('global', '  hello world  ')];
    const [seg] = adaptInstructionLayers(layers);
    expect(seg.content).toBe('# global\nhello world');
  });
});
