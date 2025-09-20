import React from 'react';
import { useBoardModel } from './useBoardModel';
import { useToast } from '../Toast';
import { ErrorBoundary } from '../ErrorBoundary';
import { TaskCard } from './TaskCard';

function BoardInner() {
  const { push } = useToast();
  const { loading, error, model, diff, refresh, moveTask, saveChanges, dirty, undo, canUndo } = useBoardModel((ok, changed, conflict)=>{
    if (conflict) {
      push('Save aborted: tasks changed remotely. Refresh first.', { type: 'error' });
    } else if (changed === 0) {
      push('No changes to save', { type: 'info' });
    } else if (ok) {
      push(`Saved ${changed} change${changed>1?'s':''}`, { type: 'success' });
    } else {
      push('Failed to save changes', { type: 'error' });
    }
  });
  function onDragStart(e: React.DragEvent, id: string, from: string) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, from }));
    e.dataTransfer.effectAllowed = 'move';
  }
  function onDrop(e: React.DragEvent, toStatus: string) {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      moveTask(data.id, toStatus);
    } catch {}
  }
  function allow(e: React.DragEvent) { e.preventDefault(); }
  return (
    <div className="flex h-full flex-col" role="application" aria-label="Task board">
      <div className="flex items-center gap-2 border-b p-2 bg-white shadow-sm" role="toolbar" aria-label="Board actions">
        <h1 className="text-lg font-semibold">Task Board</h1>
  <button onClick={()=>refresh()} className="rounded bg-blue-600 px-2 py-1 text-white text-sm" aria-label="Refresh board">Refresh</button>
  <button disabled={!canUndo} onClick={()=>undo()} className={`rounded px-2 py-1 text-sm text-white ${canUndo? 'bg-yellow-600 hover:bg-yellow-700':'bg-gray-400 cursor-not-allowed'}`} aria-disabled={!canUndo} aria-label="Undo last move">Undo</button>
  <button disabled={!dirty?.length} onClick={()=>saveChanges()} className={`rounded px-2 py-1 text-sm text-white ${dirty?.length? 'bg-green-600 hover:bg-green-700':'bg-gray-400 cursor-not-allowed'}`} aria-disabled={!dirty?.length} aria-label="Save moved tasks">Save Changes{dirty?.length?` (${dirty.length})`:''}</button>
        {diff && ( <span className="text-xs text-gray-500">Δ +{diff.added.length} -{diff.removed.length} moved:{diff.moved.length} reorder:{diff.reordered.length}</span> )}
      </div>
      {loading && <div className="p-4 text-sm">Loading…</div>}
      {error && <div className="p-4 text-sm text-red-600">{error}</div>}
      <div className="flex flex-1 overflow-x-auto gap-4 p-4 bg-gray-100" aria-label="Board columns">
        {model?.columns.map((col: any)=>{
          const cards = col.tasks.map((id:string)=>({ id, status: col.id as string, story: (model.tasks as any)[id]?.story||'NONE' }));
          return (
            <div key={col.id} className="flex flex-col min-w-64 max-w-72" role="list" aria-label={`Column ${col.title}`}
                 onDragOver={allow}
                 onDrop={(e)=>onDrop(e, col.id)}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-600">{col.title}</div>
                <div className="text-[10px] text-gray-400">{cards.length}</div>
              </div>
              <div className="flex flex-col gap-2" role="none">
                {cards.map((c: any)=> <div key={c.id} role="listitem" draggable aria-grabbed="false" onDragStart={(e)=>onDragStart(e,c.id,col.id)}>
                  <TaskCard id={c.id} status={c.status} story={c.story} dirty={dirty?.includes(c.id)} />
                </div>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Board() {
  return (
    <ErrorBoundary>
      <BoardInner />
    </ErrorBoundary>
  );
}
