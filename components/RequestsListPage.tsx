import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from './Header';
import { Request, RequestPriority, RequestStatus } from '../types';
import { ChevronRightIcon, AddIcon, PlaylistAddIcon, MoreVertIcon, Icon, ExpandMoreIcon } from './icons';
import UnifiedToolbar from './UnifiedToolbar';
import { parseRequestFromPrompt, isAIAvailable } from '../services/geminiService';
import { useRequestsFilters } from '../utils/useRequestsFilters';
import EmptyStateIcon from './EmptyStateIcon';

// Normalize legacy request statuses to the new expanded set
const normalizeStatus = (s: RequestStatus): RequestStatus => {
  const map: Partial<Record<RequestStatus, RequestStatus>> = {
    new: 'open',
    triage: 'in_review',
  blocked: 'in_review',
    done: 'closed',
    cancelled: 'closed',
  };
  return map[s] || s;
};

const PriorityBadge: React.FC<{ p: RequestPriority }> = ({ p }) => {
  const color = p === 'critical' ? 'bg-red-600/20 text-red-400' : p === 'high' ? 'bg-orange-500/20 text-orange-400' : p === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-600/20 text-green-400';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{p}</span>;
};
const StatusBadge: React.FC<{ s: RequestStatus }> = ({ s }) => {
  const n = normalizeStatus(s) as 'open' | 'in_review' | 'in_progress' | 'closed';
  const colorMap: Record<typeof n, string> = {
    open: 'bg-blue-600/20 text-blue-400',
    in_review: 'bg-purple-600/20 text-purple-400',
    in_progress: 'bg-amber-600/20 text-amber-400',
    closed: 'bg-gray-600/30 text-gray-400',
  } as const;
  const label = String(n).replace('_', ' ');
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorMap[n]}`}>{label}</span>;
};

type Mode = 'list' | 'board';

const RequestsListPage: React.FC<{
  requests: Request[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  mode: Mode;
  onToggleMode: (mode: Mode) => void;
}> = ({ requests, onBack, onSelect, onNew, mode, onToggleMode }) => {
  const [q, setQ] = useState('');
  const { status, setStatus, priority, setPriority, expertise, setExpertise, sortBy, setSortBy } = useRequestsFilters();

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return requests.filter(r => {
      if (status !== 'all' && normalizeStatus(r.status) !== status) return false;
      if (priority !== 'all' && r.priority !== priority) return false;
      if (expertise !== 'all') {
        const set = new Set(r.requestedExpertise || []);
        if (!set.has(expertise)) return false;
      }
      if (ql) {
        const s = `${r.product} ${r.requester} ${r.problem} ${r.outcome}`.toLowerCase();
        if (!s.includes(ql)) return false;
      }
      return true;
    });
  }, [requests, q, status, priority, expertise]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
  switch (sortBy) {
      case 'updated':
        return arr.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      case 'created':
        return arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      case 'priority': {
        const order: Record<RequestPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 } as any;
        return arr.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
      }
      case 'name':
        return arr.sort((a, b) => (a.product || '').localeCompare(b.product || ''));
      default:
        return arr;
    }
  }, [filtered, sortBy]);

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
      <Header title="Requests" onToggleSidebar={() => {}} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm"
          title="New Request"
          aria-label="New Request"
        >
          <span className="material-symbols-outlined">concierge</span>
          <span className="hidden sm:inline">New Request</span>
        </button>
      </Header>

      {/* Unified toolbar section for filters, view toggle and sort */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6">
          <div className="w-full py-4">
            <UnifiedToolbar
              projects={[]}
              userCategories={[]}
              selectedProjectId={'all'}
              selectedCategoryId={'all'}
              onChangeProject={() => {}}
              onChangeCategory={() => {}}
              hideProject
              hideCategory
              compactHeight="h10"
              inlineExtras={
                <div className="flex items-center gap-2 w-full">
                  <StatusDropdown value={status} onChange={setStatus} />
                  <PriorityDropdown value={priority} onChange={setPriority} />
                  <ExpertiseDropdown
                    value={expertise}
                    onChange={setExpertise}
                    options={Array.from(new Set(requests.flatMap(r => r.requestedExpertise || [])))}
                  />
                  {/* Per spec: remove inline search box; header search icon remains */}
                </div>
              }
              rightExtras={
                <>
                  <div className="bg-gray-200 dark:bg-gray-700/50 flex items-center h-10 px-1 rounded-[12px]">
                    <button onClick={() => onToggleMode('list')} className={`h-8 px-3 rounded-[12px] text-sm font-semibold ${mode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>
                      <span className="inline-flex items-center gap-1"><Icon name="view_list" className="text-base" /> <span className="hidden sm:inline">List</span></span>
                    </button>
                    <button onClick={() => onToggleMode('board')} className={`h-8 px-3 rounded-[12px] text-sm font-semibold ${mode === 'board' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>
                      <span className="inline-flex items-center gap-1"><Icon name="view_kanban" className="text-base" /> <span className="hidden sm:inline">Board</span></span>
                    </button>
                  </div>
                  <div className="ml-2"><RequestsSortDropdown value={sortBy} onChange={setSortBy} /></div>
                </>
              }
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto w-full max-w-6xl space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-gray-700/60">
              {sorted.map(r => (
                <RequestCard key={r.id} r={r} onSelect={onSelect} />
              ))}
              {sorted.length === 0 && (
                <div className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                  <div className="mx-auto max-w-md flex flex-col items-center">
                    <EmptyStateIcon icon={<Icon name="concierge" />} size="lg" />
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                      {requests.length === 0 ? 'No requests yet' : 'No requests match filters'}
                    </h3>
                    <p className="max-w-md mt-1 mb-6">
                      {requests.length === 0 
                        ? 'Create your first request using the button in the top right.' 
                        : 'Try adjusting your filters or create a new request.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomPromptBar />
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
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTimeout(() => window.dispatchEvent(new CustomEvent('taskly.createStoryFromRequest', { detail: { id: r.id } })), 0); }}
              className="w-9 h-9 rounded-[var(--radius-button)] text-white bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 hover:shadow transition-all inline-flex items-center justify-center"
              title="Create Story from Request"
              aria-label="Create Story"
            >
              <AddIcon className="text-sm" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTimeout(() => window.dispatchEvent(new CustomEvent('taskly.createTasksForRequest', { detail: { id: r.id } })), 0); }}
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
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setTimeout(() => window.dispatchEvent(new CustomEvent('taskly.createStoryFromRequest', { detail: { id: r.id } })), 0); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            <AddIcon className="text-base" /> Create Story
          </button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); setTimeout(() => window.dispatchEvent(new CustomEvent('taskly.createTasksForRequest', { detail: { id: r.id } })), 0); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
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

// Bottom input for creating a request from a single message
const BottomPromptBar: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const handleCreate = async () => {
    const t = text.trim();
    if (!t) return;
    setLoading(true);
    try {
      if (!isAIAvailable()) {
        window.dispatchEvent(new CustomEvent('taskly.toast', { detail: 'AI not configured. Using a simple fallback to seed your request.' }));
      }
      const draft = await parseRequestFromPrompt(t);
      window.dispatchEvent(new CustomEvent('taskly.newRequest', { detail: draft }));
      setText('');
    } catch (e) {
      console.warn('Failed to parse request draft', e);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-xl px-2 py-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Paste a request in one message…"
            className="flex-1 bg-transparent text-sm text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none px-2"
          />
          <button onClick={handleCreate} disabled={!text.trim() || loading} className="px-3 py-2 text-sm font-semibold rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white disabled:opacity-50">
            AI Draft
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact dropdowns used in toolbar
const useOutsideClose = (ref: React.RefObject<HTMLElement>, onClose: () => void) => {
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [ref, onClose]);
};

const StatusDropdown: React.FC<{ value: RequestStatus | 'all'; onChange: (v: RequestStatus | 'all') => void; }> = ({ value, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOutsideClose(ref, () => setOpen(false));
  const label = value === 'all' ? 'All status' : String(value).replace('_',' ');
  const opts: (RequestStatus | 'all')[] = ['all','open','in_review','in_progress','closed'];
  return (
    <div ref={ref} className="relative flex-1 sm:flex-initial sm:w-48 min-w-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
        <div className="flex items-center gap-2 truncate">
          <Icon name="flag" className="text-base flex-shrink-0" />
          <span className="truncate capitalize">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt}>
                <button onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}>
                  {opt === 'all' ? 'All status' : String(opt).replace('_',' ')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const PriorityDropdown: React.FC<{ value: RequestPriority | 'all'; onChange: (v: RequestPriority | 'all') => void; }> = ({ value, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOutsideClose(ref, () => setOpen(false));
  const label = value === 'all' ? 'All priorities' : String(value);
  const opts: (RequestPriority | 'all')[] = ['all','critical','high','medium','low'];
  return (
    <div ref={ref} className="relative flex-1 sm:flex-initial sm:w-48 min-w-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
        <div className="flex items-center gap-2 truncate">
          <Icon name="priority" className="text-base flex-shrink-0" />
          <span className="truncate capitalize">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt}>
                <button onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}>
                  {opt === 'all' ? 'All priorities' : String(opt)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const ExpertiseDropdown: React.FC<{ value: string; onChange: (v: string) => void; options: string[]; }> = ({ value, onChange, options }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOutsideClose(ref, () => setOpen(false));
  const label = value === 'all' ? 'All expertise' : value;
  const opts = ['all', ...options];
  return (
    <div ref={ref} className="relative flex-1 sm:flex-initial sm:w-56 min-w-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
        <div className="flex items-center gap-2 truncate">
          <Icon name="psychology" className="text-base flex-shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt}>
                <button onClick={() => { onChange(opt); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}>
                  {opt === 'all' ? 'All expertise' : opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const RequestsSortDropdown: React.FC<{ value: 'updated' | 'created' | 'priority' | 'name'; onChange: (v: 'updated' | 'created' | 'priority' | 'name') => void; }> = ({ value, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOutsideClose(ref, () => setOpen(false));
  const label = value === 'updated' ? 'Latest updated' : value === 'created' ? 'Latest created' : value === 'priority' ? 'Priority' : 'Name';
  const opts: Array<{ value: 'updated' | 'created' | 'priority' | 'name'; label: string }> = [
    { value: 'updated', label: 'Latest updated' },
    { value: 'created', label: 'Latest created' },
    { value: 'priority', label: 'Priority' },
    { value: 'name', label: 'Name' },
  ];
  return (
    <div ref={ref} className="relative sm:w-52 w-full">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
        <div className="flex items-center gap-2 truncate">
          <Icon name="sort" className="text-base flex-shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt.value}>
                <button onClick={() => { onChange(opt.value); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt.value ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}>
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
