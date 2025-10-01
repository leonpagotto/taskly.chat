import React, { useMemo, useState, useRef, useEffect } from 'react';
import Header from './Header';
import { Request, RequestPriority, RequestStatus } from '../types';
import { parseRequestFromPrompt, isAIAvailable } from '../services/geminiService';
import UnifiedToolbar from './UnifiedToolbar';
import { Icon, ExpandMoreIcon } from './icons';
import { useRequestsFilters } from '../utils/useRequestsFilters';

type Mode = 'list' | 'board';

const normalizeStatus = (s: RequestStatus): Exclude<RequestStatus, 'new'|'triage'|'blocked'|'done'|'cancelled'> => {
  const map: Partial<Record<RequestStatus, RequestStatus>> = {
    new: 'open',
    triage: 'in_review',
    blocked: 'in_review',
    done: 'closed',
    cancelled: 'closed',
  };
  return (map[s] || s) as any;
};

const columns: { key: Exclude<RequestStatus, 'new'|'triage'|'blocked'|'done'|'cancelled'>; title: string }[] = [
  { key: 'open', title: 'Open' },
  { key: 'in_review', title: 'In Review' },
  { key: 'in_progress', title: 'In Progress' },
  { key: 'closed', title: 'Closed' },
];

const PriorityDot: React.FC<{ p: RequestPriority }> = ({ p }) => {
  const color = p === 'critical' ? 'bg-red-500' : p === 'high' ? 'bg-orange-500' : p === 'medium' ? 'bg-yellow-400' : 'bg-green-500';
  return <span className={`inline-block w-2 h-2 rounded-full ${color}`} />;
};

const RequestCard: React.FC<{
  r: Request;
  onSelect: (id: string) => void;
  onGenerateStories: (id: string) => void;
}> = ({ r, onSelect, onGenerateStories }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', r.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing select-none"
      onClick={() => onSelect(r.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{r.product || 'Untitled'}</div>
        <PriorityDot p={r.priority} />
      </div>
      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2" title={r.problem}>{r.problem}</div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onGenerateStories(r.id); }}
          className="px-2 py-1 rounded-md bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white text-xs font-semibold"
          title="Generate Stories with AI"
        >
          <span className="material-symbols-outlined text-sm align-middle mr-1">auto_stories</span>
          Stories
        </button>
      </div>
    </div>
  );
};

const Column: React.FC<{
  title: string;
  status: Exclude<RequestStatus, 'new'|'triage'|'blocked'|'done'|'cancelled'>;
  items: Request[];
  onDrop: (id: string, to: RequestStatus) => void;
  onSelect: (id: string) => void;
  onGenerateStories: (id: string) => void;
}> = ({ title, status, items, onDrop, onSelect, onGenerateStories }) => {
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) onDrop(id, status);
  };
  return (
    <div className="flex-1 min-w-[220px]">
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
        <span className="text-xs text-gray-500">{items.length}</span>
      </div>
      <div onDragOver={handleDragOver} onDrop={handleDrop} className="p-2 space-y-2 rounded-lg min-h-[200px] bg-gray-100/70 dark:bg-gray-700/40 border border-dashed border-gray-300 dark:border-gray-600">
        {items.map(r => (
          <RequestCard key={r.id} r={r} onSelect={onSelect} onGenerateStories={onGenerateStories} />
        ))}
      </div>
    </div>
  );
};

const RequestsBoardPage: React.FC<{
  requests: Request[];
  onBack: () => void;
  onSelect: (id: string) => void;
  onMove: (id: string, to: RequestStatus) => void;
  onNew: () => void;
  onGenerateStories: (id: string) => void;
  mode: Mode;
  onToggleMode: (mode: Mode) => void;
}> = ({ requests, onBack, onSelect, onMove, onNew, onGenerateStories, mode, onToggleMode }) => {
  // Filters and search
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

  const sortRequests = (arr: Request[]) => {
    const copy = [...arr];
    switch (sortBy) {
      case 'updated':
        return copy.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      case 'created':
        return copy.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      case 'priority': {
        const order: Record<RequestPriority, number> = { critical: 4, high: 3, medium: 2, low: 1 } as any;
        return copy.sort((a, b) => (order[b.priority] || 0) - (order[a.priority] || 0));
      }
      case 'name':
        return copy.sort((a, b) => (a.product || '').localeCompare(b.product || ''));
      default:
        return copy;
    }
  };

  const grouped = columns.map(c => ({
    ...c,
    items: sortRequests(filtered.filter(r => normalizeStatus(r.status) === c.key))
  }));

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
      <main className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto">
            {grouped.map(col => (
              <Column
                key={col.key}
                title={col.title}
                status={col.key}
                items={col.items}
                onDrop={onMove}
                onSelect={onSelect}
                onGenerateStories={onGenerateStories}
              />
            ))}
          </div>
        </div>
      </main>
      {/* Bottom prompt bar to create request from a single message */}
      <BottomPromptBar />
    </div>
  );
};

export default RequestsBoardPage;

// Lightweight bottom prompt bar component
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
      <div className="mx-auto w-full max-w-[1400px]">
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

// Compact dropdown helpers reused from list page
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
