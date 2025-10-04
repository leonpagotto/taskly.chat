import React, { useState, useEffect, useRef } from 'react';
import { Habit, Task, UserCategory, RecurrenceRule, Project, Checklist } from '../types';
import { AddIcon, DeleteIcon, CheckCircleIcon, RadioButtonUncheckedIcon, CloseIcon, EditIcon, WarningIcon, AutorenewIcon, ExpandMoreIcon, CheckIcon, NewHabitIcon, FolderIcon, MoreVertIcon, CalendarTodayIcon, ListAltIcon, LocalFireDepartmentIcon, WidthNormalIcon } from './icons';
import Header from './Header';
import UnifiedToolbar from './UnifiedToolbar';
import EmptyStateIcon from './EmptyStateIcon';

// A generic Icon component for Material Symbols
const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

const FilterDropdown: React.FC<{
  items: (Project | UserCategory)[];
  selectedId: string;
  onSelect: (id: string) => void;
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
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const defaultLabel = type === 'project' ? 'All Projects' : 'All Categories';

    return (
        <div ref={dropdownRef} className="relative flex-1 sm:flex-initial sm:w-52 min-w-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            >
                <div className="flex items-center gap-2 truncate">
                    <Icon name={type === 'project' ? 'folder' : 'category'} className="text-base flex-shrink-0" />
                    <span className="truncate">{selectedItem ? selectedItem.name : defaultLabel}</span>
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
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

const getISODate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface HabitsViewProps {
  habits: Habit[];
  projects: Project[];
  userCategories: UserCategory[];
  onNewHabitRequest: () => void;
  onEditHabitRequest: (habit: Habit) => void;
  onUpdateHabit: (habitId: string, updatedData: Partial<Omit<Habit, 'id'>>) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabitCompletion: (habitId: string, date: string) => void;
  onToggleHabitTask: (habitId: string, taskId: string, date: string) => void;
  onToggleSidebar: () => void;
  recentlyCompletedItemId: string | null;
  t: (key: string) => string;
    onShareHabit?: (habit: Habit) => void;
}

const isHabitDueOnDate = (habit: Habit, date: Date): boolean => {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  const startDate = new Date(habit.recurrence.startDate + 'T00:00:00');
  startDate.setHours(0, 0, 0, 0);

  if (checkDate < startDate) {
    return false;
  }
  
  const dayMap: { [key: number]: (typeof habit.recurrence.daysOfWeek)[number] } = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };

  switch (habit.recurrence.type) {
    case 'daily':
      return true;
    case 'weekly':
      const todayDay = dayMap[checkDate.getDay()];
      return habit.recurrence.daysOfWeek?.includes(todayDay) ?? false;
    case 'interval':
      const diffTime = Math.abs(checkDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays % (habit.recurrence.interval || 1) === 0;
    default:
      return false;
  }
};


const HabitCard: React.FC<{
    habit: Habit;
    category?: UserCategory;
    onEdit: () => void;
    onToggleCompletion: (date: string) => void;
    project?: Project;
    onShare?: () => void;
}> = ({ habit, category, onEdit, onToggleCompletion, project, onShare }) => {
    const getRecurrenceText = (rule: RecurrenceRule): string => {
        switch (rule.type) {
            case 'daily':
                return 'Every day';
            case 'weekly':
                if (rule.daysOfWeek?.length === 7) return 'Every day';
                if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return 'Weekly';
                return `Weekly on ${rule.daysOfWeek.join(', ')}`;
            case 'interval':
                return `Every ${rule.interval || 1} days`;
            default:
                return 'Recurring';
        }
    };

    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleMenuAction = (action: () => void) => {
        action();
        setMenuOpen(false);
    };

    const calculateStreak = () => {
        let streak = 0;
        const today = new Date();
        const todayISO = getISODate(today);
        const startDayOffset = (isHabitDueOnDate(habit, today) && !habit.completionHistory.includes(todayISO)) ? 1 : 0;
        for (let i = startDayOffset; i < 365 * 5; i++) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            if (date < new Date(habit.recurrence.startDate)) break;
            if (isHabitDueOnDate(habit, date)) {
                if (habit.completionHistory.includes(getISODate(date))) streak++;
                else break;
            }
        }
        return streak;
    };

    const calculateCompletionRate = () => {
        const startDate = new Date(habit.recurrence.startDate);
        const today = new Date();
        let totalDueDays = 0;
        if (startDate > today) return 0;
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            if (isHabitDueOnDate(habit, new Date(d))) totalDueDays++;
        }
        if (totalDueDays === 0) return 100;
        const completedCount = habit.completionHistory.filter(d => new Date(d) >= startDate).length;
        return Math.round((completedCount / totalDueDays) * 100);
    };

    const streak = calculateStreak();
    const completionRate = calculateCompletionRate();

    const getLastSevenDays = () => {
        const dates: Date[] = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            dates.push(date);
        }
        return dates;
    };
    const lastSevenDays = getLastSevenDays();
    const startDateObj = new Date(habit.recurrence.startDate + 'T00:00:00');
    startDateObj.setHours(0, 0, 0, 0);

    return (
        <div className="bg-white dark:bg-gray-700/50 p-3 rounded-xl flex flex-col gap-0.5 group transition-all hover:shadow-md">
            <div className="flex items-center justify-between gap-3">
                {category ? (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: `${category.color}20` }}>
                        <Icon name={category.icon} style={{ color: category.color }} className="text-2xl" />
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-600">
                        <AutorenewIcon className="text-2xl text-gray-500" />
                    </div>
                )}

                <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">{habit.name}</h3>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{getRecurrenceText(habit.recurrence)}</span>
                        {project && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 max-w-[50%]">
                                <Icon name={project.icon || 'folder'} className="text-xs" style={{ color: project.color }} />
                                <span className="truncate">{project.name}</span>
                            </span>
                        )}
                        <div className="flex items-center gap-1.5" title="Current Streak">
                            <LocalFireDepartmentIcon className="text-base text-orange-400" />
                            <span className="font-semibold">{streak}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Overall Completion Rate">
                            <CheckCircleIcon className="text-base text-green-400" />
                            <span className="font-semibold">{completionRate}%</span>
                        </div>
                    </div>
                </div>

                <div ref={menuRef} className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setMenuOpen(p => !p)} className="p-2 -mr-2 -mt-1 text-gray-500 hover:text-blue-400 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertIcon />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-full right-0 mt-1 w-56 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl z-10 p-1">
                            <button onClick={() => handleMenuAction(onEdit)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><EditIcon className="text-base" /> Edit</button>
                            {onShare && (
                                <button onClick={() => handleMenuAction(onShare)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><WidthNormalIcon className="text-base" /> Share as link</button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-center">
                {lastSevenDays.map(day => {
                    const dayObj = new Date(day);
                    dayObj.setHours(0, 0, 0, 0);
                    const isBeforeStart = dayObj < startDateObj;
                    const isoDate = getISODate(day);
                    const isCompleted = habit.completionHistory.includes(isoDate);
                    const isDue = isHabitDueOnDate(habit, day);
                    const isToday = getISODate(day) === getISODate(new Date());

                    if (isBeforeStart) {
                        return (
                            <div key={day.toISOString()} className="flex flex-col items-center gap-1 text-center w-10 opacity-30 cursor-not-allowed">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center`}>
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{day.getDate()}</span>
                                </div>
                            </div>
                        );
                    }

                    let dayStyle = 'bg-gray-200 dark:bg-gray-600/60 text-gray-600 dark:text-gray-400';
                    if (isCompleted) dayStyle = 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white';
                    else if (isDue) dayStyle = 'hover:bg-gray-300 dark:hover:bg-gray-500';

                    let borderStyle = 'border-2 border-transparent';
                    if (isDue && !isCompleted) borderStyle = `border-2 ${isToday ? 'border-[var(--color-primary-600)]' : 'border-[var(--color-primary-600)]/50'}`;

                    if (!isDue) {
                        return (
                            <div key={day.toISOString()} className="flex flex-col items-center gap-1 text-center w-10 opacity-30">
                                <span className="text-xs text-gray-500 dark:text-gray-400">{day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center`}>
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-300">{day.getDate()}</span>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={day.toISOString()} className="flex flex-col items-center gap-1 text-center w-10">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{day.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</span>
                            <button onClick={(e) => { e.stopPropagation(); onToggleCompletion(isoDate); }} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${dayStyle} ${borderStyle}`}>
                                <span className="font-bold text-sm">{day.getDate()}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Sort dropdown for habits
const HabitsSortDropdown: React.FC<{ value: 'priority' | 'name' | 'streak'; onChange: (v: 'priority' | 'name' | 'streak') => void; }> = ({ value, onChange }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const onDocClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);
    const label = value === 'priority' ? 'Priority' : value === 'name' ? 'Name' : 'Streak';
    const opts: Array<{ value: 'priority' | 'name' | 'streak'; label: string }> = [
        { value: 'priority', label: 'Priority' },
        { value: 'name', label: 'Name' },
        { value: 'streak', label: 'Streak' },
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

const HabitsView: React.FC<HabitsViewProps> = (props) => {
    const { 
        habits, projects, userCategories, onToggleHabitCompletion,
        onToggleSidebar, t, onNewHabitRequest, onEditHabitRequest,
        onShareHabit
    } = props;
  
  // Persisted filter state
  const STORAGE_KEY = 'habits.filters.v1';
  type SortBy = 'priority' | 'name' | 'streak';
  type Persisted = { projectId: string | 'all'; categoryId: string | 'all'; sortBy: SortBy };

  const loadPersisted = (): Persisted => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { projectId: 'all', categoryId: 'all', sortBy: 'priority' };
      const data = JSON.parse(raw) as Partial<Persisted>;
      return {
        projectId: data.projectId ?? 'all',
        categoryId: data.categoryId ?? 'all',
        sortBy: (data.sortBy as SortBy) ?? 'priority',
      };
    } catch {
      return { projectId: 'all', categoryId: 'all', sortBy: 'priority' };
    }
  };

  const persisted = typeof window !== 'undefined' ? loadPersisted() : { projectId: 'all', categoryId: 'all', sortBy: 'priority' as SortBy };

  const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>(persisted.projectId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>(persisted.categoryId);
  const [sortBy, setSortBy] = useState<SortBy>(persisted.sortBy);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  useEffect(() => {
    try {
      const data: Persisted = { projectId: selectedProjectId, categoryId: selectedCategoryId, sortBy };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [selectedProjectId, selectedCategoryId, sortBy]);

  // Helper to calculate streak for sorting
  const calculateStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    const todayISO = getISODate(today);
    const startDayOffset = (isHabitDueOnDate(habit, today) && !habit.completionHistory.includes(todayISO)) ? 1 : 0;
    for (let i = startDayOffset; i < 365 * 5; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      if (date < new Date(habit.recurrence.startDate)) break;
      if (isHabitDueOnDate(habit, date)) {
        if (habit.completionHistory.includes(getISODate(date))) streak++;
        else break;
      }
    }
    return streak;
  };

  const sortedHabits = [...habits].sort((a, b) => {
    switch (sortBy) {
      case 'priority': {
        const priorityA = a.priority || 99;
        const priorityB = b.priority || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.name.localeCompare(b.name);
      }
      case 'name':
        return a.name.localeCompare(b.name);
      case 'streak': {
        const streakA = calculateStreak(a);
        const streakB = calculateStreak(b);
        return streakB - streakA; // Higher streak first
      }
      default:
        return 0;
    }
  });
  
  const filteredHabits = sortedHabits.filter(habit => {
      const projectMatch = selectedProjectId === 'all' || habit.projectId === selectedProjectId;
      const categoryMatch = selectedCategoryId === 'all' || habit.categoryId === selectedCategoryId;
      return projectMatch && categoryMatch;
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
            <Header title={t('habits')} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button onClick={onNewHabitRequest} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm">
            <NewHabitIcon />
            <span className="hidden sm:inline">{t('new_habit')}</span>
        </button>
      </Header>
            <div className="flex-1 overflow-y-auto">
                {/* Mobile: Compact filter button */}
                <div className="md:hidden bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-3">
                        <button
                            onClick={() => setFilterPanelOpen(true)}
                            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-[var(--radius-button)] bg-gray-200 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                        >
                            <div className="flex items-center gap-2">
                                <Icon name="tune" className="text-xl" />
                                <span className="font-semibold">Filters & Sort</span>
                            </div>
                            <Icon name="chevron_right" className="text-xl" />
                        </button>
                    </div>
                </div>

                {/* Desktop: Full toolbar */}
                <div className="hidden md:block bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="px-4 sm:px-6">
                        <div className="w-full py-4">
                            <UnifiedToolbar 
                                projects={projects} 
                                userCategories={userCategories} 
                                selectedProjectId={selectedProjectId} 
                                selectedCategoryId={selectedCategoryId} 
                                onChangeProject={setSelectedProjectId} 
                                onChangeCategory={setSelectedCategoryId}
                                showPeriod={false}
                                compactHeight="h10"
                                rightExtras={<HabitsSortDropdown value={sortBy} onChange={setSortBy} />}
                            />
                        </div>
                    </div>
                </div>

                {/* Sliding Filter Panel (Mobile) */}
                {filterPanelOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setFilterPanelOpen(false)} />
                        <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-800 shadow-2xl z-50 md:hidden transform transition-transform duration-300">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sort</h3>
                                    <button onClick={() => setFilterPanelOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project</label>
                                        <FilterDropdown items={projects} selectedId={selectedProjectId} onSelect={setSelectedProjectId} type="project" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <FilterDropdown items={userCategories} selectedId={selectedCategoryId} onSelect={setSelectedCategoryId} type="category" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                                        <div className="space-y-2">
                                            {[
                                                { value: 'priority' as const, label: 'Priority' },
                                                { value: 'name' as const, label: 'Name' },
                                                { value: 'streak' as const, label: 'Streak' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => setSortBy(opt.value)}
                                                    className={`w-full px-4 py-2.5 rounded-lg text-left font-medium transition-colors ${
                                                        sortBy === opt.value
                                                            ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white'
                                                            : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setFilterPanelOpen(false)}
                                        className="w-full px-4 py-2.5 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white font-semibold"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                <div className="px-4 sm:px-6">
                    <div className="mx-auto w-full max-w-[52rem]">
                        <main className="py-4 sm:py-6">
                                {filteredHabits.length > 0 ? (
                    <div className="space-y-4">
                        {filteredHabits.map((habit) => {
                            const category = userCategories.find(c => c.id === habit.categoryId);
                            const project = projects.find(p => p.id === habit.projectId);
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  category={category}
                                    project={project}
                  onEdit={() => onEditHabitRequest(habit)}
                  onToggleCompletion={(date) => onToggleHabitCompletion(habit.id, date)}
                                    onShare={onShareHabit ? () => onShareHabit(habit) : undefined}
                />
              )
            })}
          </div>
        ) : (
            <div className="text-center text-gray-500 flex flex-col items-center justify-center min-h-[50vh] p-6">
                <EmptyStateIcon icon={<NewHabitIcon />} size="lg" />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('no_habits_yet')}</h2>
                <p className="max-w-md mt-1 mb-6">{habits.length > 0 ? 'No habits match the current filters.' : t('no_habits_yet_subtitle')}</p>
                 <button onClick={onNewHabitRequest} className="mt-6 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all">
                    {t('create_habit')}
                </button>
            </div>
        )}
                        </main>
                    </div>
                </div>
            </div>
    </div>
  );
};

export default HabitsView;