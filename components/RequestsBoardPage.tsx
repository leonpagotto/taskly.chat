import React, { useMemo, useState, useRef, useEffect } from 'react';
import Header from './Header';
import { Request, RequestPriority, RequestStatus } from '../types';
import UnifiedToolbar from './UnifiedToolbar';
import { Icon, ExpandMoreIcon, AddIcon, CloseIcon } from './icons';
import { useRequestsFilters } from '../utils/useRequestsFilters';
import EmptyState from './EmptyState';

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
          className="px-2 py-1 rounded-md bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white text-xs font-semibold"
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
    <div className="flex-1 min-w-[220px] bg-white dark:bg-gray-700/50 rounded-xl p-3"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-100">{title}</h3>
        <span className="text-xs text-gray-400">{items.length}</span>
      </div>
      <div className="space-y-2 min-h-[200px]">
        {items.map(r => (
          <RequestCard key={r.id} r={r} onSelect={onSelect} onGenerateStories={onGenerateStories} />
        ))}
        {items.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 dark:text-gray-500">No requests yet</p>
          </div>
        )}
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
  onToggleSidebar: () => void;
}> = ({ requests, onBack, onSelect, onMove, onNew, onGenerateStories, mode, onToggleMode, onToggleSidebar }) => {
  // Filters and search
  const [q, setQ] = useState('');
  const { status, setStatus, priority, setPriority, expertise, setExpertise, sortBy, setSortBy } = useRequestsFilters();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

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

  const hasVisibleRequests = grouped.some(col => col.items.length > 0);
  const hasRequests = requests.length > 0;
  const filtersActive = status !== 'all' || priority !== 'all' || expertise !== 'all' || q.trim().length > 0;
  const handleResetFilters = () => {
    setStatus('all');
    setPriority('all');
    setExpertise('all');
    setSortBy('updated');
    setQ('');
  };
  const emptyTitle = hasRequests ? 'No requests match these filters' : 'Capture your first request';
  const emptyDescription = hasRequests
    ? 'Try adjusting or clearing your filters to surface more requests.'
    : 'Use requests to triage inbound ideas and hand-offs. Create one to seed the pipeline.';

  return (
    <div className="flex-1 flex flex-col h-full">
      <Header title="Requests" onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm"
          title="New Request"
          aria-label="New Request"
        >
          <span className="material-symbols-outlined">concierge</span>
          <span className="hidden sm:inline">New Request</span>
        </button>
      </Header>

      {/* Unified toolbar section for filters, view toggle and sort */}
      <div className="border-b border-white/10">
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
              fluidControls
              inlineExtras={
                <>
                  {/* Mobile: Single Filters button */}
                  <div className="flex w-full lg:hidden">
                    <button
                      onClick={() => setMobileFiltersOpen(true)}
                      className="inline-flex w-full items-center justify-between gap-2 rounded-[12px] border border-white/10 bg-white/80 px-3 py-2 text-sm font-semibold text-gray-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur transition hover:bg-white dark:border-white/8 dark:bg-white/10 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                      aria-expanded={mobileFiltersOpen}
                      aria-haspopup="dialog"
                      aria-label="Open filters"
                    >
                      <span className="flex items-center gap-2">
                        <Icon name="filter_alt" className="text-base" />
                        <span>Filters</span>
                      </span>
                      {filtersActive ? <span className="h-2 w-2 rounded-full bg-[var(--color-primary-600)]" aria-hidden="true" /> : null}
                    </button>
                  </div>
                  
                  {/* Desktop: All controls aligned to the right */}
                  <div className="hidden lg:flex lg:items-center lg:justify-end lg:gap-3">
                    {/* Filter 1: Status */}
                    <StatusDropdown value={status} onChange={setStatus} />
                    
                    {/* Filter 2: Expertise */}
                    <ExpertiseDropdown
                      value={expertise}
                      onChange={setExpertise}
                      options={Array.from(new Set(requests.flatMap(r => r.requestedExpertise || [])))}
                    />
                    
                    {/* Control 1: List/Board Toggle */}
                    <div className="flex h-10 items-center rounded-[12px] border border-white/10 bg-white px-1 shadow-[0_14px_42px_rgba(10,12,34,0.18)] backdrop-blur dark:border-white/8 dark:bg-white/10">
                      <button 
                        onClick={() => onToggleMode('list')} 
                        className={`h-8 rounded-[12px] px-3 text-sm font-semibold transition-all ${mode === 'list' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}
                        aria-label="List view"
                        aria-pressed={mode === 'list'}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Icon name="view_list" className="text-base" />
                          <span>List</span>
                        </span>
                      </button>
                      <button 
                        onClick={() => onToggleMode('board')} 
                        className={`h-8 rounded-[12px] px-3 text-sm font-semibold transition-all ${mode === 'board' ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}
                        aria-label="Board view"
                        aria-pressed={mode === 'board'}
                      >
                        <span className="inline-flex items-center gap-1">
                          <Icon name="view_kanban" className="text-base" />
                          <span>Board</span>
                        </span>
                      </button>
                    </div>
                    
                    {/* Control 2: Sort */}
                    <RequestsSortDropdown value={sortBy} onChange={setSortBy} />
                  </div>
                </>
              }
            />
          </div>
        </div>
      </div>
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileFiltersOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-slate-950 p-5 shadow-[0_-20px_60px_rgba(15,0,40,0.55)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white hover:bg-white/10" aria-label="Close filters">
                <CloseIcon className="text-lg" />
              </button>
            </div>
            <div className="space-y-3">
              <StatusDropdown value={status} onChange={(value) => { setStatus(value); }} />
              <PriorityDropdown value={priority} onChange={(value) => { setPriority(value); }} />
              <ExpertiseDropdown
                value={expertise}
                onChange={(value) => { setExpertise(value); }}
                options={Array.from(new Set(requests.flatMap(r => r.requestedExpertise || [])))}
              />
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-between">
              <button
                onClick={() => { handleResetFilters(); setMobileFiltersOpen(false); }}
                className="inline-flex items-center justify-center rounded-[12px] border border-white/12 px-4 py-2 text-sm font-semibold text-white/80 backdrop-blur hover:text-white"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="inline-flex items-center justify-center rounded-[12px] bg-[var(--color-primary-600)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-primary-700)]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="mx-auto w-full max-w-[1400px]">
          {hasVisibleRequests ? (
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
          ) : (
            <EmptyState
              icon={<Icon name="concierge" />}
              title={emptyTitle}
              description={emptyDescription}
              primaryAction={{
                label: 'New Request',
                onClick: onNew,
                icon: <AddIcon className="text-base" />,
              }}
              secondaryAction={hasRequests && filtersActive ? {
                label: 'Reset filters',
                onClick: handleResetFilters,
                icon: <Icon name="filter_alt_off" className="text-base" />,
                variant: 'secondary',
              } : undefined}
              className="mx-auto my-16 w-full max-w-3xl"
              variant="minimal"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestsBoardPage;

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
    <div ref={ref} className="relative w-full">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-transform duration-150 resend-secondary hover:-translate-y-[1px]">
        <div className="flex items-center gap-2 truncate">
          <Icon name="flag" className="text-base flex-shrink-0" />
          <span className="truncate capitalize">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full rounded-xl border border-gray-700/60 bg-gray-900/85 backdrop-blur-lg shadow-2xl overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/80 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
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
    <div ref={ref} className="relative w-full">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-transform duration-150 resend-secondary hover:-translate-y-[1px]">
        <div className="flex items-center gap-2 truncate">
          <Icon name="priority" className="text-base flex-shrink-0" />
          <span className="truncate capitalize">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full rounded-xl border border-gray-700/60 bg-gray-900/85 backdrop-blur-lg shadow-2xl overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/80 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
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
    <div ref={ref} className="relative w-full">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-transform duration-150 resend-secondary hover:-translate-y-[1px]">
        <div className="flex items-center gap-2 truncate">
          <Icon name="psychology" className="text-base flex-shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full rounded-xl border border-gray-700/60 bg-gray-900/85 backdrop-blur-lg shadow-2xl overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt}>
                <button
                  onClick={() => { onChange(opt); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/80 truncate ${value === opt ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
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
    <div ref={ref} className="relative w-full">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-transform duration-150 resend-secondary hover:-translate-y-[1px]">
        <div className="flex items-center gap-2 truncate">
          <Icon name="sort" className="text-base flex-shrink-0" />
          <span className="truncate">{label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 top-full mt-1.5 w-full rounded-xl border border-gray-700/60 bg-gray-900/85 backdrop-blur-lg shadow-2xl overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt.value}>
                <button
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/80 truncate ${value === opt.value ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
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
