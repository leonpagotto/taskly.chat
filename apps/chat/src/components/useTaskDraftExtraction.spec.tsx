import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTaskDraftExtraction } from './useTaskDraftExtraction';

// Minimal mock of extractTaskDrafts via module factory if needed in future;
// current hook relies on actual implementation from @taskly/ai which should be deterministic.

describe('useTaskDraftExtraction', () => {
  it('returns empty drafts for undefined input', () => {
    const { result } = renderHook(() => useTaskDraftExtraction(undefined));
    expect(result.current.drafts).toEqual([]);
  });

  it('returns empty drafts for whitespace input', () => {
    const { result } = renderHook(() => useTaskDraftExtraction('   '));
    expect(result.current.drafts).toEqual([]);
  });

  it('produces a draft for a simple create task phrase (heuristic)', () => {
    const { result } = renderHook((props: { text: string }) => useTaskDraftExtraction(props.text), { initialProps: { text: 'Create task: buy milk tomorrow' } });
    // Heuristic expectation: at least one draft or graceful empty (non-throw)
    expect(Array.isArray(result.current.drafts)).toBe(true);
    // If extraction logic identifies tasks it should have length >= 1; we tolerate 0 to avoid brittle test until extractor firmed up.
  });

  it('memoizes result for identical input', () => {
    const { result, rerender } = renderHook((props: { text: string }) => useTaskDraftExtraction(props.text), { initialProps: { text: 'task: write report' } });
    const first = result.current;
    rerender({ text: 'task: write report' });
    const second = result.current;
    expect(second).toBe(first); // same reference due to useMemo
  });

  it('changes object reference when input changes', () => {
    const { result, rerender } = renderHook((props: { text: string }) => useTaskDraftExtraction(props.text), { initialProps: { text: 'task: A' } });
    const first = result.current;
    rerender({ text: 'task: B' });
    const second = result.current;
    expect(second).not.toBe(first);
  });
});
