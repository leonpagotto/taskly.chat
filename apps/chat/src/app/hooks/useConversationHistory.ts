import { useCallback, useEffect, useRef, useState } from 'react';

export interface ConversationMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string; // ISO
}

interface PageMeta {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}

interface FetchState {
  messages: ConversationMessage[];
  loading: boolean;
  error: string | null;
  page: PageMeta | null;
}

export function useConversationHistory(initialLimit = 30, filters?: { start?: string | null; end?: string | null }) {
  const [state, setState] = useState<FetchState>({ messages: [], loading: false, error: null, page: null });
  const fetchingRef = useRef(false);
  const filterRef = useRef(filters);

  // Reset when filters change (shallow compare)
  if (filterRef.current?.start !== filters?.start || filterRef.current?.end !== filters?.end) {
    filterRef.current = filters;
    if (!fetchingRef.current) {
      // reset state so next effect triggers fetch
      if (state.messages.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve().then(() => setState({ messages: [], loading: false, error: null, page: null }));
      }
    }
  }

  const fetchPage = useCallback(async () => {
    if (fetchingRef.current) return;
    if (state.page && !state.page.hasMore) return;
    fetchingRef.current = true;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const params = new URLSearchParams();
      params.set('limit', String(initialLimit));
      if (state.page?.nextCursor) params.set('cursor', state.page.nextCursor);
      if (filters?.start) params.set('start', filters.start);
      if (filters?.end) params.set('end', filters.end);
      const res = await fetch(`/api/conversations?${params.toString()}`);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json() as { messages: ConversationMessage[]; page: PageMeta };
      setState(s => ({
        messages: [...s.messages, ...data.messages],
        loading: false,
        error: null,
        page: data.page,
      }));
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message || 'Unknown error' }));
    } finally {
      fetchingRef.current = false;
    }
  }, [state.page, initialLimit, filters?.start, filters?.end]);

  // initial load
  useEffect(() => {
    if (state.messages.length === 0 && !state.loading) {
      fetchPage();
    }
  }, [state.messages.length, state.loading, fetchPage]);

  return {
    messages: state.messages,
    loading: state.loading,
    error: state.error,
    hasMore: state.page?.hasMore ?? false,
    loadMore: fetchPage,
    filters,
  };
}
