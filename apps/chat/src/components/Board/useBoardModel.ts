import { useEffect, useState, useMemo } from 'react';
import { buildBoardModel, diffBoards } from '@taskly/integration';

interface ApiTask { id: string; status: string; story: string; file: string }

export function useBoardModel(onSaveResult?: (ok: boolean, changed: number, conflict?: boolean) => void) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [tasks, setTasks] = useState<ApiTask[]>([]);
  const [baseline, setBaseline] = useState<any>(null);
  const [model, setModel] = useState<any>(null);
  const [diff, setDiff] = useState<any>(null);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<any[]>([]);
  const [future, setFuture] = useState<any[]>([]); // reserved for redo if desired later

  // key helpers for localStorage ordering persistence
  const ORDER_KEY = 'taskly.board.order.v1';

  function loadStoredOrdering(): Record<string,string[]> | null {
    if (typeof window === 'undefined') return null;
    try { const raw = localStorage.getItem(ORDER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
  }

  function saveOrdering(map: Record<string,string[]>) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(ORDER_KEY, JSON.stringify(map)); } catch {}
  }

  useEffect(()=>{
    let cancelled = false;
    (async()=>{
      try {
        setLoading(true);
        const res = await fetch('/api/tasks');
        const json = await res.json();
        if (cancelled) return;
        setTasks(json.tasks);
      } catch(e:any) {
        if (!cancelled) setError(e.message||'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return ()=>{ cancelled = true; };
  },[]);

  useEffect(()=>{
    // Build model when tasks change
    const parsedLike = tasks.map(t=>({ kind:'task', id: t.id, status: t.status, story: t.story, created:'', type:'', raw:'', warnings:[], filePath: t.file }));
    const next = buildBoardModel(parsedLike as any, baseline || undefined);
    // apply stored ordering per column if present
    const stored = loadStoredOrdering();
    if (stored) {
      for (const col of next.columns) {
        const desired = stored[col.id];
        if (desired && Array.isArray(desired)) {
          // filter to tasks still in this column & order
            const presentSet = new Set(col.tasks);
            const ordered = desired.filter(id=>presentSet.has(id));
            const remainder = col.tasks.filter((id:string)=> !ordered.includes(id));
            col.tasks = [...ordered, ...remainder];
        }
      }
    }
    if (!baseline) setBaseline(next);
    setModel(next);
    if (baseline) setDiff(diffBoards(baseline, next));
  },[tasks]);

  const moveTask = (id: string, toStatus: string, toIndex?: number) => {
    if (!model) return;
    const prev = JSON.parse(JSON.stringify(model));
    const clone = JSON.parse(JSON.stringify(model));
    // Find current column
    let fromCol = clone.columns.find((c: any)=> c.tasks.includes(id));
    if (!fromCol) return;
    fromCol.tasks = fromCol.tasks.filter((t: string)=> t !== id);
    let toCol = clone.columns.find((c: any)=> c.id === toStatus);
    if (!toCol) {
      // create column placeholder if missing (should not happen with known statuses)
      toCol = { id: toStatus, title: toStatus, tasks: [] };
      clone.columns.push(toCol);
    }
    if (toIndex != null && toIndex >=0 && toIndex <= toCol.tasks.length) toCol.tasks.splice(toIndex,0,id); else toCol.tasks.push(id);
    // Update task status record
    if (clone.tasks[id]) clone.tasks[id].status = toStatus;
  setModel(clone);
  setHistory(h => [...h.slice(-24), prev]); // cap history at 25 entries
  setFuture([]);
    // persist ordering snapshot
    try {
      const ordering: Record<string,string[]> = {};
      for (const col of clone.columns) ordering[col.id] = [...col.tasks];
      saveOrdering(ordering);
    } catch {}
    // Mark dirty if status changed from baseline
    const baseTask = baseline?.tasks?.[id];
    if (baseTask && baseTask.status !== toStatus) {
      setDirty(prev => new Set([...prev, id]));
    } else if (baseTask && baseTask.status === toStatus) {
      setDirty(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const undo = () => {
    setHistory(h => {
      if (!h.length) return h;
      const prev = h[h.length -1];
      setModel(prev);
      // recompute dirty relative to baseline
      const newDirty = new Set<string>();
      for (const col of prev.columns) {
        for (const id of col.tasks) {
          const baseStatus = baseline?.tasks?.[id]?.status;
          if (baseStatus && baseStatus !== col.id) newDirty.add(id);
        }
      }
      setDirty(newDirty);
      return h.slice(0, -1);
    });
  };

  const saveChanges = async () => {
    if (!model) return;
    // diff with baseline to find moved tasks
    const changed: { id: string; status: string }[] = [];
    for (const col of model.columns) {
      for (const id of col.tasks) {
        const baseTask = baseline?.tasks?.[id];
        if (baseTask && baseTask.status !== col.id) {
          changed.push({ id, status: col.id });
        }
      }
    }
    // conflict detection: fetch current and compare baseline status for moved tasks
    let conflict = false;
    try {
      if (changed.length) {
        const currentRes = await fetch('/api/tasks');
        const currentJson = await currentRes.json();
        const currentMap: Record<string,string> = {};
        for (const t of currentJson.tasks) currentMap[t.id] = t.status;
        for (const c of changed) {
          const baseStatus = baseline?.tasks?.[c.id]?.status;
          const remoteStatus = currentMap[c.id];
          if (baseStatus && remoteStatus && remoteStatus !== baseStatus) {
            conflict = true; break;
          }
        }
      }
    } catch { /* ignore conflict fetch errors */ }
    if (conflict) {
      if (onSaveResult) onSaveResult(false, changed.length, true);
      return;
    }
    let ok = true;
    if (changed.length) {
      try {
        const res = await fetch('/api/tasks/update/batch', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ moves: changed.map(c=>({ id: c.id, toStatus: c.status })) }) });
        ok = res.ok;
      } catch {
        ok = false;
      }
    }
    // Refresh baseline & tasks
    try {
      const res = await fetch('/api/tasks');
      const json = await res.json();
      setTasks(json.tasks);
      setDirty(new Set());
    } finally {
      if (onSaveResult) onSaveResult(ok, changed.length, false);
    }
  };

  return { loading, error, model, diff, dirty: Array.from(dirty), moveTask, saveChanges, undo, canUndo: history.length>0, refresh: async ()=>{
    const res = await fetch('/api/tasks');
    const json = await res.json();
    setTasks(json.tasks);
  } };
}
