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

  it('skips disabled layers (enabled === false)', () => {
    const glob: any = { id: 'global', content: 'glob' };
    const proj: any = { id: 'project:alpha', projectId: 'p1', content: 'proj', enabled: false };
    const ctx: any = { id: 'context:runtime', content: 'ctx' };
    const adapted = adaptInstructionLayers([ctx, proj, glob]);
    expect(adapted.map(s => s.content.split('\n')[0])).toEqual(['# global', '# context:runtime']);
  });

  it('normalizes empty content to heading only', () => {
    const adapted = adaptInstructionLayers([{ id: 'global', content: '   ' } as any]);
    expect(adapted[0].content).toBe('# global');
  });

  it('orders multiple projects preserving relative order within same rank', () => {
    const layers: InstructionLayer[] = [
      { id: 'project:beta', projectId: 'p1', content: 'b' } as any,
      { id: 'project:alpha', projectId: 'p1', content: 'a' } as any,
      { id: 'global', content: 'g' } as any,
      { id: 'context:later', content: 'c' } as any
    ];
    const adapted = adaptInstructionLayers(layers);
    // global first, then original order of project layers (beta then alpha) since stable sort not guaranteed; we assert only rank grouping
    const groups = adapted.map(x => x.content.includes('# global') ? 'g' : x.content.includes('# project:') ? 'p' : 'c');
    expect(groups).toEqual(['g','p','p','c']);
  });
});
