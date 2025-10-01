import React, { useEffect, useRef, useState } from 'react';
import { Project, UserCategory } from '../types';
import { Icon, ExpandMoreIcon, CalendarTodayIcon } from './icons';

type Period = 'today' | 'week' | 'month';
type TimeFilterKey = 'all' | 'year' | 'month' | 'week' | 'next30' | 'next7' | 'today' | 'custom';

export interface ToolbarChip {
  key: string;
  label: string;
}

interface UnifiedToolbarProps {
  projects: Project[];
  userCategories: UserCategory[];
  selectedProjectId: string | 'all';
  selectedCategoryId: string | 'all';
  onChangeProject: (id: string | 'all') => void;
  onChangeCategory: (id: string | 'all') => void;
  // Hide category filter (e.g., for Stories page)
  hideCategory?: boolean;
  // Hide project filter (for narrow clones like period-only rows)
  hideProject?: boolean;

  // Compact uniform control height (40px) and 12px radius for this row
  compactHeight?: 'default' | 'h10';

  // Period toggle (optional)
  period?: Period;
  onChangePeriod?: (p: Period) => void;
  showPeriod?: boolean; // default true if period provided

  // Time filter (preferred over period)
  timeFilter?: TimeFilterKey;
  onChangeTimeFilter?: (k: TimeFilterKey) => void;
  customDateRange?: { start: string | null; end: string | null };
  onChangeCustomDateRange?: (range: { start: string | null; end: string | null }) => void;
  // Generic chips (optional), e.g., status filters
  chips?: ToolbarChip[];
  activeChipKey?: string;
  onChangeChip?: (key: string) => void;

  // Right aligned extras (e.g., view mode toggle, extra buttons)
  rightExtras?: React.ReactNode;
  // Inline middle extras (e.g., compact selects like Status)
  inlineExtras?: React.ReactNode;

  // Sort control (optional)
  sortBy?: 'time' | 'priority' | 'name';
  onChangeSortBy?: (v: 'time' | 'priority' | 'name') => void;
  sortOptions?: { value: 'time' | 'priority' | 'name'; label: string }[];

  // Make controls expand to take full row width and allow wrapping
  fluidControls?: boolean;
}

const FilterDropdown: React.FC<{
  items: (Project | UserCategory)[];
  selectedId: string | 'all';
  onSelect: (id: string | 'all') => void;
  type: 'project' | 'category';
  buttonClassName?: string;
  containerClassName?: string;
}> = ({ items, selectedId, onSelect, type, buttonClassName, containerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find(p => p.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultLabel = type === 'project' ? 'All Projects' : 'All Categories';

  const wrapperClass = containerClassName || "relative flex-1 sm:flex-initial sm:w-52 min-w-0";
  return (
    <div ref={dropdownRef} className={wrapperClass}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"}
      >
        <div className="flex items-center gap-2 truncate">
          <Icon name={type === 'project' ? 'folder' : 'category'} className="text-base flex-shrink-0" />
          <span className="truncate">{selectedItem ? (selectedItem as any).name : defaultLabel}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            <li>
              <button onClick={() => { onSelect('all'); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600">
                {defaultLabel}
              </button>
            </li>
            {items.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => { onSelect(item.id); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${selectedId === item.id ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
                  {(item as any).name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const SortDropdown: React.FC<{
  value: 'time' | 'priority' | 'name';
  onChange: (v: 'time' | 'priority' | 'name') => void;
  options?: { value: 'time' | 'priority' | 'name'; label: string }[];
  buttonClassName?: string;
  containerClassName?: string;
}> = ({ value, onChange, options, buttonClassName, containerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const opts = options ?? [
    { value: 'time', label: 'Time' },
    { value: 'priority', label: 'Priority' },
    { value: 'name', label: 'Name' },
  ];
  const selected = opts.find(o => o.value === value) || opts[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const wrapperClass = containerClassName || "relative flex-1 sm:flex-initial sm:w-40 min-w-0";
  return (
    <div ref={dropdownRef} className={wrapperClass}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"}
      >
        <div className="flex items-center gap-2 truncate">
          <Icon name="swap_vert" className="text-base flex-shrink-0" />
          <span className="truncate">Sort: {selected.label}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            {opts.map(opt => (
              <li key={opt.value}>
                <button
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === opt.value ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
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

const TimeDropdown: React.FC<{
  value: TimeFilterKey;
  onChange: (k: TimeFilterKey) => void;
  customRange?: { start: string | null; end: string | null };
  onChangeCustomRange?: (r: { start: string | null; end: string | null }) => void;
  buttonClassName?: string;
  containerClassName?: string;
}> = ({ value, onChange, customRange, onChangeCustomRange, buttonClassName, containerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const labelFor = (k: TimeFilterKey) => {
    switch (k) {
      case 'all': return 'All time';
      case 'year': return 'This year';
      case 'month': return 'This month';
      case 'week': return 'This week';
      case 'next30': return 'Next 30 days';
      case 'next7': return 'Next 7 days';
      case 'today': return 'Today';
      case 'custom': return customRange?.start && customRange?.end ? `${customRange.start} → ${customRange.end}` : 'Custom range';
    }
  };

  const wrapperClass = containerClassName || 'relative flex-1 sm:flex-initial sm:w-56 min-w-0';
  const selectedLabel = labelFor(value);
  return (
    <div ref={dropdownRef} className={wrapperClass}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || 'w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarTodayIcon className="text-base flex-shrink-0" />
          <span className="truncate">{selectedLabel}</span>
        </div>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          {!showPicker ? (
            <ul className="max-h-80 overflow-y-auto">
              {(['all','year','month','week','next30','next7','today'] as TimeFilterKey[]).map(k => (
                <li key={k}>
                  <button
                    onClick={() => { onChange(k); setIsOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === k ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                  >
                    {labelFor(k)}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => { onChange('custom'); setShowPicker(true); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${value === 'custom' ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
                  Custom range…
                </button>
              </li>
            </ul>
          ) : (
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customRange?.start || ''}
                  onChange={(e) => onChangeCustomRange && onChangeCustomRange({ start: e.target.value || null, end: customRange?.end || null })}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={customRange?.end || ''}
                  onChange={(e) => onChangeCustomRange && onChangeCustomRange({ start: customRange?.start || null, end: e.target.value || null })}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button onClick={() => { onChangeCustomRange && onChangeCustomRange({ start: null, end: null }); onChange('custom'); setIsOpen(false); setShowPicker(false); }} className="px-3 py-1.5 text-sm rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500">Clear</button>
                <button onClick={() => { onChange('custom'); setIsOpen(false); setShowPicker(false); }} className="px-3 py-1.5 text-sm rounded-md bg-[var(--color-primary-600)] text-white hover:opacity-90">Apply</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UnifiedToolbar: React.FC<UnifiedToolbarProps> = (props) => {
  const {
    projects, userCategories,
    selectedProjectId, selectedCategoryId,
    onChangeProject, onChangeCategory,
    hideCategory = false,
    hideProject = false,
    compactHeight = 'default',
    period, onChangePeriod, showPeriod = true,
    chips, activeChipKey, onChangeChip,
    rightExtras, inlineExtras,
    sortBy, onChangeSortBy, sortOptions,
    fluidControls = false
  } = props;

  const controlButtonClass = compactHeight === 'h10'
    ? "w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
    : "w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700";

  const containerClass = fluidControls
    ? "flex items-center gap-2 sm:gap-3 flex-wrap"
    : "flex items-center gap-2 sm:gap-3 flex-nowrap overflow-x-auto scrollbar-hide";
  const filterWrap = fluidControls ? "relative flex-1 min-w-0" : undefined;
  const sortWrap = fluidControls ? "relative flex-1 min-w-0" : undefined;
  const timeWrap = fluidControls ? "relative flex-1 min-w-0" : undefined;

  return (
    <div className={containerClass}>
      {!hideProject && (
        <FilterDropdown items={projects} selectedId={selectedProjectId} onSelect={onChangeProject} type="project" buttonClassName={controlButtonClass} containerClassName={filterWrap} />
      )}
      {!hideCategory && (
        <FilterDropdown items={userCategories} selectedId={selectedCategoryId} onSelect={onChangeCategory} type="category" buttonClassName={controlButtonClass} containerClassName={filterWrap} />
      )}

      {(props.timeFilter && props.onChangeTimeFilter) && (
        <TimeDropdown value={props.timeFilter} onChange={props.onChangeTimeFilter} customRange={props.customDateRange} onChangeCustomRange={props.onChangeCustomDateRange} buttonClassName={controlButtonClass} containerClassName={timeWrap} />
      )}

      {(sortBy && onChangeSortBy) && (
        <SortDropdown value={sortBy} onChange={onChangeSortBy} options={sortOptions} buttonClassName={controlButtonClass} containerClassName={sortWrap} />
      )}

      {(period && onChangePeriod && showPeriod) && (
        <div className="flex items-center gap-2 ml-0 sm:ml-auto w-full sm:w-auto">
          <div className={`flex w-full sm:inline-flex sm:w-auto ${compactHeight==='h10' ? 'h-10 px-1 rounded-[12px]' : 'rounded-full p-1'} bg-gray-200 dark:bg-gray-700/50 text-sm font-semibold items-center`}>
            <button onClick={() => onChangePeriod('today')} className={`${compactHeight==='h10' ? 'h-8' : ''} px-3 ${compactHeight==='h10' ? 'rounded-[12px]' : 'rounded-full'} text-center flex-1 sm:flex-none ${period==='today' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>Today</button>
            <button onClick={() => onChangePeriod('week')} className={`${compactHeight==='h10' ? 'h-8' : ''} px-3 ${compactHeight==='h10' ? 'rounded-[12px]' : 'rounded-full'} text-center flex-1 sm:flex-none ${period==='week' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>This Week</button>
            <button onClick={() => onChangePeriod('month')} className={`${compactHeight==='h10' ? 'h-8' : ''} px-3 ${compactHeight==='h10' ? 'rounded-[12px]' : 'rounded-full'} text-center flex-1 sm:flex-none ${period==='month' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>This Month</button>
          </div>
        </div>
      )}

      {chips && chips.length > 0 && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="p-1 bg-gray-200 dark:bg-gray-700/50 rounded-full flex">
            {chips.map(ch => (
              <button key={ch.key} onClick={() => onChangeChip && onChangeChip(ch.key)} className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${activeChipKey === ch.key ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/70 dark:hover:bg-gray-600/40'}`}>{ch.label}</button>
            ))}
          </div>
        </div>
      )}

      {inlineExtras && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {inlineExtras}
        </div>
      )}

      {rightExtras && (
        <div className="ml-auto flex items-center gap-2">
          {rightExtras}
        </div>
      )}
    </div>
  );
};

export default UnifiedToolbar;
