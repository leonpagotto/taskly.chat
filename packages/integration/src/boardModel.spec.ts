import { describe, it, expect } from 'vitest';
import { buildBoardModel, diffBoards } from './boardModel';
import { ParsedTaskHeader } from './parser';

function task(id: string, status: string): ParsedTaskHeader {
  return { kind:'task', id, status, story:'story', created:'2025-09-20', type:'feature', raw:'', warnings:[] };
}

describe('buildBoardModel', () => {
  it('groups tasks by status with deterministic ordering', () => {
    const model = buildBoardModel([
      task('IMP-003','todo'),
      task('IMP-001','todo'),
      task('IMP-002','in-progress')
    ]);
    const todoCol = model.columns.find(c=>c.id==='todo')!;
    expect(todoCol.tasks).toEqual(['IMP-001','IMP-003']);
  });
  it('preserves ordering from previous model', () => {
    const first = buildBoardModel([task('A-001','todo'), task('A-002','todo')]);
    // simulate user reordering to [A-002, A-001]
    first.columns.find(c=>c.id==='todo')!.tasks = ['A-002','A-001'];
    const second = buildBoardModel([
      task('A-001','todo'), task('A-002','todo'), task('A-003','todo')
    ], first);
    expect(second.columns.find(c=>c.id==='todo')!.tasks).toEqual(['A-002','A-001','A-003']);
  });
});

describe('diffBoards', () => {
  it('detects moves and reorder and additions/removals', () => {
    const base = buildBoardModel([
      task('T-001','todo'),
      task('T-002','todo'),
      task('T-003','in-progress')
    ]);
    const next = buildBoardModel([
      task('T-001','in-progress'), // moved
      task('T-002','todo'),
      task('T-004','todo') // added
    ], base);
    const diff = diffBoards(base, next);
    expect(diff.moved.some(m=>m.id==='T-001' && m.to==='in-progress')).toBe(true);
    expect(diff.added).toContain('T-004');
    expect(diff.removed).toContain('T-003');
  });
});
