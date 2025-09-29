import React, { useEffect, useRef, useState } from 'react';
import { Project, UserCategory } from '../types';
import { Icon, ExpandMoreIcon } from './icons';

type Period = 'today' | 'week' | 'month';

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

  // Period toggle (optional)
  period?: Period;
  onChangePeriod?: (p: Period) => void;
  showPeriod?: boolean; // default true if period provided

  // Generic chips (optional), e.g., status filters
  chips?: ToolbarChip[];
  activeChipKey?: string;
  onChangeChip?: (key: string) => void;

  // Right aligned extras (e.g., view mode toggle, extra buttons)
  rightExtras?: React.ReactNode;
}

const FilterDropdown: React.FC<{
  items: (Project | UserCategory)[];
  selectedId: string | 'all';
  onSelect: (id: string | 'all') => void;
  type: 'project' | 'category';
}> = ({ items, selectedId, onSelect, type }) => {
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

  return (
    <div ref={dropdownRef} className="relative flex-1 sm:flex-initial sm:w-52 min-w-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
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

const UnifiedToolbar: React.FC<UnifiedToolbarProps> = (props) => {
  const {
    projects, userCategories,
    selectedProjectId, selectedCategoryId,
    onChangeProject, onChangeCategory,
    period, onChangePeriod, showPeriod = true,
    chips, activeChipKey, onChangeChip,
    rightExtras
  } = props;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
      <FilterDropdown items={projects} selectedId={selectedProjectId} onSelect={onChangeProject} type="project" />
      <FilterDropdown items={userCategories} selectedId={selectedCategoryId} onSelect={onChangeCategory} type="category" />

      {(period && onChangePeriod && showPeriod) && (
        <div className="flex items-center gap-2 ml-0 sm:ml-auto w-full sm:w-auto">
          <div className="flex w-full sm:inline-flex sm:w-auto rounded-full bg-gray-200 dark:bg-gray-700/50 p-1 text-sm font-semibold">
            <button onClick={() => onChangePeriod('today')} className={`px-3 py-1.5 rounded-full text-center flex-1 sm:flex-none ${period==='today' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>Today</button>
            <button onClick={() => onChangePeriod('week')} className={`px-3 py-1.5 rounded-full text-center flex-1 sm:flex-none ${period==='week' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>This Week</button>
            <button onClick={() => onChangePeriod('month')} className={`px-3 py-1.5 rounded-full text-center flex-1 sm:flex-none ${period==='month' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>This Month</button>
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

      {rightExtras && (
        <div className="ml-auto flex items-center gap-2">
          {rightExtras}
        </div>
      )}
    </div>
  );
};

export default UnifiedToolbar;
