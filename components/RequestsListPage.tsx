import React, { useEffect, useMemo, useState } from 'react';
import Header from './Header';
import { Request, RequestPriority, RequestStatus } from '../types';
import { ChevronRightIcon, AddIcon, PlaylistAddIcon, MoreVertIcon } from './icons';

const PriorityBadge: React.FC<{ p: RequestPriority }> = ({ p }) => {
  const color = p === 'critical' ? 'bg-red-600/20 text-red-400' : p === 'high' ? 'bg-orange-500/20 text-orange-400' : p === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-600/20 text-green-400';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{p}</span>;
};
const StatusBadge: React.FC<{ s: RequestStatus }> = ({ s }) => {
  const map: Record<RequestStatus, string> = {
    new: 'bg-blue-600/20 text-blue-400',
    triage: 'bg-purple-600/20 text-purple-400',
    in_progress: 'bg-amber-600/20 text-amber-400',
    blocked: 'bg-red-600/20 text-red-400',
    done: 'bg-green-600/20 text-green-400',
    cancelled: 'bg-gray-600/30 text-gray-400',
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s]}`}>{s.replace('_',' ')}</span>;
};

const RequestsListPage: React.FC<{
  requests: Request[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
}> = ({ requests, onBack, onSelect, onNew }) => {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [priority, setPriority] = useState<RequestPriority | 'all'>('all');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (status !== 'all' && r.status !== status) return false;
      if (priority !== 'all' && r.priority !== priority) return false;
      if (expertiseFilter !== 'all') {
        const set = new Set(r.requestedExpertise || []);
        if (!set.has(expertiseFilter)) return false;
      }
      const s = `${r.product} ${r.requester} ${r.problem} ${r.outcome}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  }, [requests, q, status, priority, expertiseFilter]);

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
  <Header title="Requests" onToggleSidebar={() => {}} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button
          onClick={onNew}
          className="w-10 h-10 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center justify-center"
          title="New Request"
          aria-label="New Request"
        >
          <span className="material-symbols-outlined">contact_support</span>
        </button>
      </Header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 flex flex-wrap gap-2 items-center">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="flex-1 min-w-[200px] bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            <div className="relative">
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="triage">Triage</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={priority} onChange={e => setPriority(e.target.value as any)} className="appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={expertiseFilter} onChange={e => setExpertiseFilter(e.target.value)} className="appearance-none bg-gray-100 dark:bg-gray-700 rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none">
                <option value="all">All expertise</option>
                {/* Build options from data */}
                {Array.from(new Set(requests.flatMap(r => r.requestedExpertise || []))).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <ChevronRightIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700/60">
              {filtered.map(r => (
                <RequestCard key={r.id} r={r} onSelect={onSelect} />
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="mx-auto max-w-md">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700/70 flex items-center justify-center mx-auto mb-3">
                      <span className="material-symbols-outlined text-3xl">contact_support</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No requests yet</h3>
                    <p className="text-sm mt-1">Create your first request using the button in the top right.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestsListPage;

// Inline component for cleaner card rendering
const RequestCard: React.FC<{ r: Request; onSelect: (id: string) => void; }> = ({ r, onSelect }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onDoc = () => setMenuOpen(false);
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);
  const onCardClick = () => onSelect(r.id);
  const stop = (e: React.MouseEvent) => e.stopPropagation();
  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer relative" onClick={onCardClick}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-gray-900 dark:text-white truncate">{r.product || 'Untitled request'}</div>
            <div className="text-xs text-gray-500 truncate">{r.requester}</div>
          </div>
          <div className="mt-1 text-sm text-gray-700 dark:text-gray-200 line-clamp-2" title={r.problem}>{r.problem}</div>
          {Boolean(r.requestedExpertise && r.requestedExpertise.length) && (
            <div className="mt-2 flex flex-wrap gap-1">
              {(r.requestedExpertise || []).slice(0, 6).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[11px] text-gray-800 dark:text-gray-200">{tag}</span>
              ))}
              {(r.requestedExpertise!.length > 6) && <span className="text-[11px] text-gray-500">+{r.requestedExpertise!.length - 6} more</span>}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <PriorityBadge p={r.priority} />
            <StatusBadge s={r.status} />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { stop(e); window.dispatchEvent(new CustomEvent('taskly.createStoryFromRequest', { detail: { id: r.id } })); }}
              className="w-9 h-9 rounded-[var(--radius-button)] text-white bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 hover:shadow transition-all inline-flex items-center justify-center"
              title="Create Story from Request"
              aria-label="Create Story"
            >
              <AddIcon className="text-sm" />
            </button>
            <button
              onClick={(e) => { stop(e); window.dispatchEvent(new CustomEvent('taskly.createTasksForRequest', { detail: { id: r.id } })); }}
              className="w-9 h-9 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 inline-flex items-center justify-center"
              title="Create Tasks for Request"
              aria-label="Create Tasks"
            >
              <PlaylistAddIcon className="text-sm" />
            </button>
            <button
              onClick={(e) => { stop(e); setMenuOpen(v => !v); }}
              className="w-9 h-9 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 inline-flex items-center justify-center"
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertIcon />
            </button>
          </div>
        </div>
      </div>
      {menuOpen && (
        <div className="absolute right-2 top-12 z-10 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-1" onClick={stop}>
          <button onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('taskly.createStoryFromRequest', { detail: { id: r.id } })); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            <AddIcon className="text-base" /> Create Story
          </button>
          <button onClick={() => { setMenuOpen(false); window.dispatchEvent(new CustomEvent('taskly.createTasksForRequest', { detail: { id: r.id } })); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            <PlaylistAddIcon className="text-base" /> Create Tasks
          </button>
          <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
          <button onClick={() => { setMenuOpen(false); onSelect(r.id); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            <span className="material-symbols-outlined text-base">edit</span> View / Edit
          </button>
        </div>
      )}
    </div>
  );
};
