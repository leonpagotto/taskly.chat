import { ParsedTaskHeader } from './parser';

export interface BoardColumn {
  id: string;              // status key
  title: string;           // human label
  tasks: string[];         // ordered task IDs
}

export interface BoardModel {
  columns: BoardColumn[];
  tasks: Record<string, ParsedTaskHeader>;
  version: string; // hash or timestamp baseline
}

export interface BoardDiff {
  moved: { id: string; from: string; to: string; position: number }[];
  reordered: { id: string; column: string; from: number; to: number }[];
  added: string[];
  removed: string[];
  unchanged: string[];
}

const STATUS_ORDER = ['backlog','todo','in-progress','review','done'];

export function buildBoardModel(tasks: ParsedTaskHeader[], previous?: BoardModel): BoardModel {
  const tasksByStatus: Record<string,string[]> = {};
  for (const st of STATUS_ORDER) tasksByStatus[st] = [];
  for (const t of tasks) {
    const st = STATUS_ORDER.includes(t.status) ? t.status : 'backlog';
    tasksByStatus[st].push(t.id);
  }
  // Preserve ordering where possible from previous model
  if (previous) {
    for (const col of previous.columns) {
      const nextSet = new Set(tasksByStatus[col.id]);
      const preserved = col.tasks.filter(id => nextSet.has(id));
      // Append any new tasks at end
      const remaining = tasksByStatus[col.id].filter(id => !preserved.includes(id));
      tasksByStatus[col.id] = [...preserved, ...remaining];
    }
  } else {
    // Deterministic initial ordering: lexical by ID
    for (const st of STATUS_ORDER) tasksByStatus[st].sort();
  }
  const tasksMap: Record<string, ParsedTaskHeader> = {};
  for (const t of tasks) tasksMap[t.id] = t;
  return {
    columns: STATUS_ORDER.map(st => ({ id: st, title: st.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()), tasks: tasksByStatus[st] })),
    tasks: tasksMap,
    version: new Date().toISOString()
  };
}

export function diffBoards(prev: BoardModel, next: BoardModel): BoardDiff {
  const prevLoc: Record<string,{col:string; idx:number}> = {};
  for (const c of prev.columns) c.tasks.forEach((id,i)=>prevLoc[id]={col:c.id,idx:i});
  const moved: BoardDiff['moved'] = [];
  const reordered: BoardDiff['reordered'] = [];
  const added: string[] = [];
  const removed: string[] = [];
  const seen = new Set<string>();
  const nextIds = new Set<string>();
  for (const c of next.columns) {
    c.tasks.forEach(id=>nextIds.add(id));
  }
  for (const c of prev.columns) {
    for (const id of c.tasks) if (!nextIds.has(id)) removed.push(id);
  }
  for (const c of next.columns) {
    c.tasks.forEach((id,i)=>{
      seen.add(id);
      const prevInfo = prevLoc[id];
      if (!prevInfo) { added.push(id); return; }
      if (prevInfo.col !== c.id) {
        moved.push({ id, from: prevInfo.col, to: c.id, position: i });
      } else if (prevInfo.idx !== i) {
        reordered.push({ id, column: c.id, from: prevInfo.idx, to: i });
      }
    });
  }
  const unchanged = Array.from(seen).filter(id=>!moved.some(m=>m.id===id) && !reordered.some(r=>r.id===id) && !added.includes(id));
  return { moved, reordered, added, removed, unchanged };
}
