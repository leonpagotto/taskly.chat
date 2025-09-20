import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBoardModel } from './useBoardModel';

// Minimal mock board data helper
const makeTasks = (overrides: any[] = []) => ({
  tasks: [
    { id: 'T1', status: 'backlog', story: 'S1', file: 'f1' },
    { id: 'T2', status: 'in-progress', story: 'S1', file: 'f2' }
  , ...overrides]
});

describe('useBoardModel conflict detection', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    let call = 0;
    // First fetch: initial load baseline; second fetch: conflict check remote state; third fetch: refresh after save (if no conflict)
    global.fetch = vi.fn(async (url: any, opts?: any) => {
      if (url === '/api/tasks' && (!opts || opts.method === 'GET')) {
        call++;
        if (call === 1) return new Response(JSON.stringify(makeTasks()), { status: 200 });
        if (call === 2) { // remote changed T1 status to done to force conflict
          return new Response(JSON.stringify(makeTasks([{ id: 'T1', status: 'done', story: 'S1', file: 'f1' }])), { status: 200 });
        }
        return new Response(JSON.stringify(makeTasks()), { status: 200 });
      }
      if (url === '/api/tasks/update/batch') {
        return new Response('{}', { status: 200 });
      }
      return new Response('{}', { status: 404 });
    }) as any;
  });

  it('aborts save and reports conflict when remote status differs from baseline', async () => {
    let resultPayload: any = null;
    const { result, rerender } = renderHook(() => useBoardModel((ok, changed, conflict) => {
      resultPayload = { ok, changed, conflict };
    }));

    // Wait for initial fetch tick
    await new Promise(r => setTimeout(r, 0));

    // Move T1 to in-progress locally triggering dirty
    act(() => {
      result.current.moveTask('T1', 'in-progress');
    });

    await act(async () => {
      await result.current.saveChanges();
    });

    expect(resultPayload).toEqual({ ok: false, changed: 1, conflict: true });
  });
});
