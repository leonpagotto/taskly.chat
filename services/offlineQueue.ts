// Minimal offline sync helper: mark dirty and reconcile on reconnect by pushing full app state

export type GetStateFn<T> = () => T;
export type SyncFn<T> = (state: T) => Promise<any>;

const LS_DIRTY_KEY = 'relational.sync.dirty.v1';

export const offlineSync = {
  isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  },
  markDirty() {
    try { localStorage.setItem(LS_DIRTY_KEY, 'true'); } catch {}
  },
  clearDirty() {
    try { localStorage.removeItem(LS_DIRTY_KEY); } catch {}
  },
  isDirty(): boolean {
    try { return localStorage.getItem(LS_DIRTY_KEY) === 'true'; } catch { return false; }
  },
  setup<T>(getState: GetStateFn<T>, sync: SyncFn<T>) {
    const handler = async () => {
      if (!this.isOnline()) return;
      if (!this.isDirty()) return;
      try {
        const state = getState();
        await sync(state);
        this.clearDirty();
      } catch {
        // keep dirty flag; will retry next time
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handler);
    }
    // Try once on setup in case we are already online
    handler();
    return () => { if (typeof window !== 'undefined') window.removeEventListener('online', handler); };
  }
};
