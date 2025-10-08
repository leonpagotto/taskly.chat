import React, { useState, useRef, useEffect } from 'react';
import { Checklist, Task, UserCategory, Reminder, Project, Note, RecurrenceRule } from '../types';
import { AddIcon, DeleteIcon, CheckCircleIcon, RadioButtonUncheckedIcon, CalendarTodayIcon, NotificationsIcon, CloseIcon, EditIcon, WarningIcon, ListAltIcon, ExpandMoreIcon, CheckIcon, TabDuplicateIcon, DescriptionIcon, FolderIcon, NewTaskIcon, AutorenewIcon, MoreVertIcon, WidthNormalIcon } from './icons';
import Header from './Header';
import UnifiedToolbar from './UnifiedToolbar';
import EmptyState from './EmptyState';
import { emptyStateSecondaryButtonClass } from './buttonStyles';

// A generic Icon component for Material Symbols
const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

const getRecurrenceText = (rule: RecurrenceRule): string => {
    switch(rule.type) {
        case 'daily': return 'Daily';
        case 'weekly':
            if (rule.daysOfWeek?.length === 7) return 'Daily';
            if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return 'Weekly';
            return `Weekly on ${rule.daysOfWeek.join(', ')}`;
        case 'interval':
            return `Every ${rule.interval || 1} days`;
        default: return 'Recurring';
    }
};

// Short recurrence label for compact header
const getRecurrenceShort = (rule: RecurrenceRule): string => {
  switch (rule.type) {
    case 'daily':
      return 'Daily';
    case 'weekly': {
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return 'Weekly';
      if (rule.daysOfWeek.length === 7) return 'Daily';
      // Shorten to 3-letter day names joined by commas
      return rule.daysOfWeek.map(d => d.slice(0, 3)).join(',');
    }
    case 'interval':
      return `${rule.interval || 1}d`;
    default:
      return '';
  }
};

// Replaced local FilterDropdown with shared UnifiedToolbar

// Inline title editing is disabled per design; keeping non-editable display helper
const StaticName: React.FC<{ text: string; className?: string; Tag?: 'h3' | 'span' }> = ({ text, className, Tag = 'span' }) => (
  <Tag className={className}>{text}</Tag>
);


const GradientCheckCircle: React.FC<{className?: string}> = ({ className }) => (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center ${className}`}>
        <CheckIcon className="text-white text-base" />
    </div>
);

// Removed unused getISODate helper

interface ListsViewProps {
  projects: Project[];
  checklists: Checklist[];
  userCategories: UserCategory[];
  onNewChecklistRequest: () => void;
  onEditChecklistRequest: (checklist: Checklist) => void;
  onUpdateChecklist: (checklistId: string, updatedData: Partial<Omit<Checklist, 'id'>>) => void;
  onDeleteChecklist: (checklistId: string) => void;
  onToggleTask: (checklistId: string, taskId: string) => void;
  onToggleSingleTaskCompletion: (checklistId: string, date: string) => void;
  onToggleSidebar: () => void;
  onSelectNote: (noteId: string) => void;
  recentlyCompletedItemId: string | null;
  t: (key: string) => string;
  onCreateTask: (checklistId: string, text: string) => void;
  onUpdateTask: (checklistId: string, taskId: string, newText: string) => void;
  onDeleteTask: (checklistId: string, taskId: string) => void;
  onDuplicateChecklist: (checklist: Checklist) => void;
  onShareChecklist: (checklist: Checklist) => void;
  completingItemIds: Set<string>;
  modalToClose: string | null;
  onModalClosed: () => void;
}

const TaskItem: React.FC<{
  task: Task; onToggle: () => void; onUpdate: (newText: string) => void; onDelete: () => void;
}> = ({ task, onToggle, onUpdate, onDelete }) => {
  const [justChecked, setJustChecked] = useState(false);
  const visualCompleted = !!task.completedAt || justChecked;
  const handleToggle = () => {
    if (!task.completedAt) {
      setJustChecked(true);
      window.setTimeout(() => {
        onToggle();
        // let parent state take over; reset local once it reflects
      }, 700);
    } else {
      // When unchecking, reset justChecked immediately
      setJustChecked(false);
      onToggle();
    }
  };
  useEffect(() => {
    // Reset justChecked when the actual state changes
    if (task.completedAt && justChecked) {
      setJustChecked(false);
    } else if (!task.completedAt && justChecked) {
      setJustChecked(false);
    }
  }, [task.completedAt, justChecked]);
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/60 group">
      <StaticName
          text={task.text}
          Tag="span"
          className={`flex-1 truncate ${visualCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}
      />
      <div className="flex items-center flex-shrink-0 ml-2">
        <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" aria-label={`Delete task: ${task.text}`}><DeleteIcon className="w-5 h-5"/></button>
        <button onClick={handleToggle} className="w-8 h-8 flex items-center justify-center flex-shrink-0" aria-label={`Toggle task: ${task.text}`}>
          {visualCompleted ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
        </button>
      </div>
    </div>
  );
};


const AddTaskForm: React.FC<{ onAddTask: (text: string) => void }> = ({ onAddTask }) => {
  const [taskText, setTaskText] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) { onAddTask(taskText.trim()); setTaskText(''); }
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1 bg-gray-700/50 rounded-xl">
        <input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add a new item..." className="flex-1 bg-transparent px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:outline-none"/>
        <button type="submit" className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-[var(--radius-button)] hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors" disabled={!taskText.trim()}><AddIcon className="text-xl text-white" /></button>
    </form>
  );
};

const ChecklistCard: React.FC<{
  checklist: Checklist;
  category?: UserCategory;
  project?: Project;
  onUpdateChecklist: (checklistId: string, updatedData: Partial<Omit<Checklist, 'id'>>) => void;
  onToggleTask: (checklistId: string, taskId: string) => void;
  onToggleSingleTaskCompletion: (checklistId: string, date: string) => void;
  onCreateTask: (checklistId: string, text: string) => void;
  onUpdateTask: (checklistId: string, taskId: string, newText: string) => void;
  onDeleteTask: (checklistId: string, taskId: string) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onShare: () => void;
  isRecentlyCompleted: boolean;
  completingItemIds: Set<string>;
  period?: 'today' | 'week' | 'month';
}> = ({
  checklist,
  category,
  project,
  onUpdateChecklist,
  onToggleTask,
  onToggleSingleTaskCompletion,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onEdit,
  onDuplicate,
  onShare,
  isRecentlyCompleted,
  completingItemIds,
  period
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAnimatingOut = completingItemIds.has(checklist.id);
  const [justChecked, setJustChecked] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = (action: () => void) => {
    action();
    setMenuOpen(false);
  };

  const isSingleTask = checklist.tasks.length === 0;
  
  if (isSingleTask) {
    const isCompleted = checklist.completionHistory.length > 0;
    const visualCompleted = isCompleted || justChecked;
    return (
      <div className={`relative`}>
        <button className={`w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700/50 rounded-xl group transition-all hover:shadow-md ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}
                onClick={() => {
                  if (!isCompleted) {
                    setJustChecked(true);
                    window.setTimeout(() => onToggleSingleTaskCompletion(checklist.id, new Date().toISOString().split('T')[0]), 700);
                  } else {
                    onToggleSingleTaskCompletion(checklist.id, new Date().toISOString().split('T')[0]);
                  }
                }}
                aria-label={`Toggle task: ${checklist.name}`}>
          <div className="flex items-center min-w-0 flex-1 gap-3">
            {category ? (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                <Icon name={category.icon} style={{ color: category.color }} className="text-xl" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                <ListAltIcon className="text-xl text-gray-500" />
              </div>
            )}
            <StaticName
              text={checklist.name}
              Tag="span"
              className={`flex-1 truncate text-left ${visualCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
            />
          </div>
          <div className="flex items-center flex-shrink-0 ml-2">
            <div ref={menuRef} className="relative" onClick={(e)=>e.stopPropagation()}>
              <button onClick={() => setMenuOpen(p => !p)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"><MoreVertIcon /></button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl z-10 p-1">
                  <button onClick={() => handleMenuAction(onEdit)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><EditIcon className="text-base"/> Edit</button>
                  <button onClick={() => handleMenuAction(onDuplicate)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><TabDuplicateIcon className="text-base"/> Duplicate</button>
                  <button onClick={() => handleMenuAction(onShare)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><WidthNormalIcon className="text-base"/> Share as link</button>
                </div>
              )}
            </div>
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              {visualCompleted ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
            </div>
          </div>
        </button>
      </div>
    );
  }

  // Multi-task list
  const totalTasks = checklist.tasks.length;
  const completedTasks = checklist.tasks.filter(t => t.completedAt).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isCompleted = totalTasks > 0 && completedTasks === totalTasks;
  
  return (
  <div className={`bg-white dark:bg-gray-700/50 rounded-xl group transition-all hover:shadow-md ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}>
    <div
      className="grid md:grid-cols-[minmax(0,1fr)_12rem_auto_auto_auto_auto] grid-cols-[minmax(0,1fr)_auto] items-center p-3 gap-3 cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Col 1: icon + title */}
      <div className="flex items-center min-w-0 gap-3">
        {category ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color}20` }}>
            <Icon name={category.icon} style={{ color: category.color }} className="text-xl" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700">
            <ListAltIcon className="text-xl text-gray-500" />
          </div>
        )}
        <StaticName
          text={checklist.name}
          Tag="span"
          className={`truncate text-left ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
        />
      </div>

      {/* Col 2: Project pill (placeholder when missing to preserve column alignment) */}
      <div className="hidden md:block">
        {project ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-xs max-w-[16rem]">
            <Icon name={project.icon || 'folder'} className="text-xs" style={{ color: project.color }} />
            <span className="truncate">{project.name}</span>
          </span>
        ) : (
          <span className="block h-5" aria-hidden="true"></span>
        )}
      </div>

      {/* Col 3: Recurrence */}
      <div className="hidden md:flex items-center justify-end">
        {checklist.recurrence ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200 text-xs">
            <AutorenewIcon className="text-xs" />
            <span>{getRecurrenceShort(checklist.recurrence)}</span>
          </span>
        ) : (
          <span className="block h-5" aria-hidden="true"></span>
        )}
      </div>

      {/* Col 4: Progress badge */}
      <div className="hidden md:flex items-center justify-end">
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200">
          {completedTasks}/{totalTasks}
        </span>
      </div>

      {/* Col 5: Time pill */}
      <div className="hidden md:flex items-center justify-end">
        {checklist.dueTime && (
          <span className="ml-2 text-xs font-mono bg-gray-200 dark:bg-gray-700/80 px-1.5 py-0.5 rounded">{checklist.dueTime}</span>
        )}
      </div>

      {/* Col 6: Controls */}
      <div className="flex items-center gap-1 justify-end">
        <div ref={menuRef} className="relative" onClick={(e)=>e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Open menu"
          >
            <MoreVertIcon />
          </button>
          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl z-10 p-1">
              <button onClick={() => handleMenuAction(onEdit)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><EditIcon className="text-base"/> Edit</button>
              <button onClick={() => handleMenuAction(onDuplicate)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><TabDuplicateIcon className="text-base"/> Duplicate</button>
              <button onClick={() => handleMenuAction(onShare)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><WidthNormalIcon className="text-base"/> Share as link</button>
            </div>
          )}
        </div>
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 ml-1">
          {isCompleted ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
        </div>
      </div>
    </div>
      {isExpanded && (
        <div className="pl-[56px] pr-3 pb-3">
            <main className="space-y-1">
                {checklist.tasks.map(task => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => onToggleTask(checklist.id, task.id)}
                    onUpdate={(newText) => onUpdateTask(checklist.id, task.id, newText)}
                    onDelete={() => onDeleteTask(checklist.id, task.id)}
                />
                ))}
            </main>
            <footer className="mt-2">
                <AddTaskForm onAddTask={(text) => onCreateTask(checklist.id, text)} />
            </footer>
        </div>
      )}
    </div>
  );
};


const ListsView: React.FC<ListsViewProps> = (props) => {
  const {
    projects, checklists, userCategories, onNewChecklistRequest, onEditChecklistRequest, onUpdateChecklist,
    onDeleteChecklist, onToggleTask, onToggleSingleTaskCompletion, onToggleSidebar, onSelectNote,
    recentlyCompletedItemId, t, onCreateTask, onUpdateTask, onDeleteTask, onDuplicateChecklist,
    onShareChecklist,
    completingItemIds, modalToClose, onModalClosed
  } = props;
  
  // Persisted filter state keys
  const STORAGE_KEY = 'tasks.filters.v1';
  type Period = 'today' | 'week' | 'month';
  type TimeFilterKey = 'all' | 'year' | 'month' | 'week' | 'next30' | 'next7' | 'today' | 'custom';
  type Status = 'all' | 'completed' | 'overdue' | 'todo';
  type SortBy = 'time' | 'priority' | 'name';
  type Persisted = { projectId: string | 'all'; categoryId: string | 'all'; period?: Period; status: Status; sortBy: SortBy; timeFilter?: TimeFilterKey; customStart?: string | null; customEnd?: string | null };

  const loadPersisted = (): Persisted => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { projectId: 'all', categoryId: 'all', period: 'today', status: 'all', sortBy: 'time', timeFilter: 'all', customStart: null, customEnd: null } as Persisted;
      const data = JSON.parse(raw) as Partial<Persisted>;
      return {
        projectId: data.projectId ?? 'all',
        categoryId: data.categoryId ?? 'all',
        period: (data.period as Period) ?? 'today',
        status: (data.status as Status) ?? 'all',
        sortBy: (data.sortBy as SortBy) ?? 'time',
        timeFilter: (data.timeFilter as TimeFilterKey) ?? 'all',
        customStart: data.customStart ?? null,
        customEnd: data.customEnd ?? null,
      };
    } catch {
      return { projectId: 'all', categoryId: 'all', period: 'today', status: 'all', sortBy: 'time', timeFilter: 'all', customStart: null, customEnd: null } as Persisted;
    }
  };

  const persisted = typeof window !== 'undefined' ? loadPersisted() : { projectId: 'all', categoryId: 'all', period: 'today', status: 'all', sortBy: 'time' } as Persisted;

  const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>(persisted.projectId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>(persisted.categoryId);
  const [period, setPeriod] = useState<Period>(persisted.period ?? 'today');
  const [sortBy, setSortBy] = useState<SortBy>(persisted.sortBy);
  const [statusFilter, setStatusFilter] = useState<Status>(persisted.status);
  const [timeFilter, setTimeFilter] = useState<TimeFilterKey>(persisted.timeFilter ?? 'all');
  const [customRange, setCustomRange] = useState<{ start: string | null; end: string | null }>({ start: persisted.customStart ?? null, end: persisted.customEnd ?? null });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  // Always include undated as per spec; no state needed

  useEffect(() => {
    try {
      const data: Persisted = { projectId: selectedProjectId, categoryId: selectedCategoryId, period, status: statusFilter, sortBy, timeFilter, customStart: customRange.start, customEnd: customRange.end };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [selectedProjectId, selectedCategoryId, period, statusFilter, sortBy, timeFilter, customRange]);

  const today = new Date();
  const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const startOfWeek = (() => { const d = new Date(today); const day = (d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d; })();
  const endOfWeek = (() => { const d = new Date(startOfWeek); d.setDate(d.getDate()+6); return d; })();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  const inTimeFilter = (cl: Checklist) => {
    // Always include undated
    if (!cl.dueDate) return true;
    const due = new Date(cl.dueDate + 'T00:00:00');
    switch (timeFilter) {
      case 'all':
        return true;
      case 'today':
        return due.toDateString() === today.toDateString();
      case 'week':
        return due >= startOfWeek && due <= endOfWeek;
      case 'month':
        return due >= startOfMonth && due <= endOfMonth;
      case 'year':
        return due >= startOfYear && due <= endOfYear;
      case 'next7': {
        const end = new Date(today); end.setDate(end.getDate()+7);
        return due >= today && due <= end;
      }
      case 'next30': {
        const end = new Date(today); end.setDate(end.getDate()+30);
        return due >= today && due <= end;
      }
      case 'custom': {
        if (!customRange.start && !customRange.end) return true;
        const start = customRange.start ? new Date(customRange.start + 'T00:00:00') : new Date('1970-01-01T00:00:00');
        const end = customRange.end ? new Date(customRange.end + 'T23:59:59') : new Date('2999-12-31T23:59:59');
        return due >= start && due <= end;
      }
      default:
        return true;
    }
  };

  const isCompletedOverall = (cl: Checklist) => {
    if (cl.tasks.length === 0) return cl.completionHistory.length > 0;
    return cl.tasks.every(t => !!t.completedAt);
  };

  const isOverdue = (cl: Checklist) => {
    if (!cl.dueDate) return false;
    const dueISO = cl.dueDate;
    const todayISO = toISO(today);
    return dueISO < todayISO && !isCompletedOverall(cl);
  };
  
  const byTime = (a: Checklist, b: Checklist) => {
    // sort by dueTime then name; missing times last
    const ta = a.dueTime || '';
    const tb = b.dueTime || '';
    if (ta && tb) return ta.localeCompare(tb) || a.name.localeCompare(b.name);
    if (ta) return -1;
    if (tb) return 1;
    return a.name.localeCompare(b.name);
  };
  const byPriority = (a: Checklist, b: Checklist) => (a.priority || 99) - (b.priority || 99) || a.name.localeCompare(b.name);
  const byName = (a: Checklist, b: Checklist) => a.name.localeCompare(b.name);
  const sorter = sortBy === 'time' ? byTime : sortBy === 'priority' ? byPriority : byName;
  const sortedChecklists = [...checklists].sort(sorter);

  const filteredChecklists = sortedChecklists.filter(cl => {
    const projectMatch = selectedProjectId === 'all' || cl.projectId === selectedProjectId;
    const categoryMatch = selectedCategoryId === 'all' || cl.categoryId === selectedCategoryId;
    const periodMatch = inTimeFilter(cl);
    let statusMatch = true;
    if (statusFilter === 'completed') statusMatch = isCompletedOverall(cl);
    else if (statusFilter === 'overdue') statusMatch = isOverdue(cl);
    else if (statusFilter === 'todo') statusMatch = !isCompletedOverall(cl);
    return projectMatch && categoryMatch && periodMatch && statusMatch;
  });

  const total = sortedChecklists.length;
  const completed = sortedChecklists.filter(isCompletedOverall).length;
  const overdue = sortedChecklists.filter(isOverdue).length;
  const todo = total - completed;

  const KPI: React.FC<{ label: string; value: number; icon: React.ReactNode; active: boolean; onClick: () => void }>
    = ({ label, value, icon, active, onClick }) => (
      <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all w-full min-h-[84px]
          ${active ? 'border-[var(--color-primary-600)] bg-white dark:bg-gray-700/50' : 'border-gray-200 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/80 hover:shadow-sm'}`}
      >
        <div className="text-[var(--color-primary-600)] flex items-center justify-center">
          {icon}
        </div>
        <div className="text-center">
          <div className="text-xl font-bold leading-none">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
        </div>
      </button>
    );

  /**
   * Dropdown mirrors the compact controls used in Habits/Stories toolbars so the tasks toolbar
   * matches their 40px height, typography, and rounded geometry.
   */
  const TaskSortDropdown: React.FC<{ value: SortBy; onChange: (v: SortBy) => void }> = ({ value, onChange }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const handleClick = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const options: Array<{ value: SortBy; label: string }> = [
      { value: 'time', label: 'Due time' },
      { value: 'priority', label: 'Priority' },
      { value: 'name', label: 'Name' },
    ];
    const active = options.find(opt => opt.value === value) ?? options[0];

    return (
      <div ref={wrapperRef} className="relative w-full sm:w-52">
        <button
          onClick={() => setOpen(prev => !prev)}
          className="w-full flex items-center justify-between gap-2 px-3 h-10 rounded-[12px] text-sm font-semibold transition-transform duration-150 resend-secondary hover:-translate-y-[1px]"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <div className="flex items-center gap-2 truncate">
            <Icon name="sort" className="text-base flex-shrink-0" />
            <span className="truncate">Sort: {active.label}</span>
          </div>
          <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-20 top-full mt-1.5 w-full rounded-xl border border-gray-700/60 bg-gray-900/85 backdrop-blur-lg shadow-2xl overflow-hidden">
            <ul role="listbox" className="max-h-72 overflow-y-auto">
              {options.map(opt => (
                <li key={opt.value}>
                  <button
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/80 truncate ${value === opt.value ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                    role="option"
                    aria-selected={value === opt.value}
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

  return (
    <div className="flex-1 flex flex-col h-full">
  <Header title={t('tasks')} onToggleSidebar={onToggleSidebar} onOpenSearch={() => window.dispatchEvent(new Event('taskly.openSearch'))}>
        <button onClick={onNewChecklistRequest} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all text-sm" style={{ color: '#FFFFFF' }}>
          <NewTaskIcon />
          <span className="hidden sm:inline">{t('new_task')}</span>
        </button>
      </Header>
      <div className="flex-1 overflow-y-auto">
        {/* Mobile: Compact filter button */}
        <div className="md:hidden border-b border-white/10">
          <div className="px-4 py-3">
            <button
              onClick={() => setFilterPanelOpen(true)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-[var(--radius-button)] resend-secondary transition-transform duration-150 hover:-translate-y-[1px]"
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
        <div className="hidden md:block border-b border-white/10">
          <div className="px-4 sm:px-6">
              <div className="w-full py-4">
                {/* Row: Filters + Sort (styled like other controls) */}
                <UnifiedToolbar
                  projects={projects}
                  userCategories={userCategories}
                  selectedProjectId={selectedProjectId}
                  selectedCategoryId={selectedCategoryId}
                  onChangeProject={(id) => setSelectedProjectId(id)}
                  onChangeCategory={(id) => setSelectedCategoryId(id)}
                  compactHeight="h10"
                  timeFilter={timeFilter}
                  onChangeTimeFilter={(k) => setTimeFilter(k as TimeFilterKey)}
                  customDateRange={customRange}
                  onChangeCustomDateRange={(r) => setCustomRange(r)}
                  rightExtras={<TaskSortDropdown value={sortBy} onChange={setSortBy} />}
                />
              </div>
          </div>
        </div>

        {/* Sliding Filter Panel (Mobile) */}
        {filterPanelOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setFilterPanelOpen(false)} />
            <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-[rgba(31,41,55,0.95)] shadow-2xl z-50 md:hidden transform transition-transform duration-300 overflow-y-auto backdrop-blur-lg">
              <div className="flex flex-col min-h-full">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-[rgba(31,41,55,0.95)] z-10 backdrop-blur-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Sort</h3>
                  <button onClick={() => setFilterPanelOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <CloseIcon />
                  </button>
                </div>
                <div className="flex-1 p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project</label>
                    <select 
                      value={selectedProjectId} 
                      onChange={e => setSelectedProjectId(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:24px_24px] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="all">All Projects</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                    <select 
                      value={selectedCategoryId} 
                      onChange={e => setSelectedCategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:24px_24px] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="all">All Categories</option>
                      {userCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Period</label>
                    <select 
                      value={timeFilter} 
                      onChange={e => setTimeFilter(e.target.value as any)}
                      className="w-full px-4 py-2.5 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M7%2010l5%205%205-5z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:24px_24px] bg-[right_0.5rem_center] bg-no-repeat"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="next7">Next 7 Days</option>
                      <option value="next30">Next 30 Days</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                    <div className="space-y-2">
                      {[
                        { value: 'time' as const, label: 'Time' },
                        { value: 'priority' as const, label: 'Priority' },
                        { value: 'name' as const, label: 'Name' }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value)}
                          className={`w-full px-4 py-2.5 rounded-lg text-left font-medium transition-colors ${
                            sortBy === opt.value
                              ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white'
                              : 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                  <button
                    onClick={() => setFilterPanelOpen(false)}
                    className="w-full px-4 py-2.5 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white font-semibold"
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
              {/* KPI row */}
        {checklists.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
            <KPI label="Total" value={total} icon={<Icon name="list_alt_check" className="text-xl text-blue-600 dark:text-blue-400" />} active={statusFilter==='all'} onClick={() => setStatusFilter('all')} />
            <KPI label="To do" value={todo} icon={<Icon name="not_started" className="text-xl text-amber-600 dark:text-amber-400" />} active={statusFilter==='todo'} onClick={() => setStatusFilter(statusFilter==='todo'?'all':'todo')} />
            <KPI label="Overdue" value={overdue} icon={<WarningIcon className="text-xl text-red-600 dark:text-red-400" />} active={statusFilter==='overdue'} onClick={() => setStatusFilter(statusFilter==='overdue'?'all':'overdue')} />
            <KPI label="Completed" value={completed} icon={<CheckCircleIcon className="text-xl text-green-600 dark:text-green-400" />} active={statusFilter==='completed'} onClick={() => setStatusFilter(statusFilter==='completed'?'all':'completed')} />
          </div>
        )}
        {checklists.length === 0 ? (
          <EmptyState
            icon={<ListAltIcon />}
            title={t('no_tasks_yet')}
            description={t('no_tasks_yet_subtitle')}
            primaryAction={{
              label: t('create_task'),
              onClick: onNewChecklistRequest,
              icon: <NewTaskIcon className="text-base" />,
            }}
            variant="minimal"
            className="mx-auto my-16 w-full max-w-3xl"
          />
        ) : filteredChecklists.length === 0 ? (
          <EmptyState
            icon={<Icon name="filter_alt_off" />}
            title="No tasks match the current filters"
            description="Try adjusting your filters to see more results, or create a new task."
            secondaryAction={{
              label: 'Reset filters',
              onClick: () => {
                setStatusFilter('all');
                setSelectedCategoryId('all');
                setSelectedProjectId('all');
                setTimeFilter('all');
              },
              icon: <Icon name="filter_alt_off" className="text-base" />,
              variant: 'secondary',
            }}
            variant="minimal"
            className="mx-auto my-16 w-full max-w-3xl"
          />
        ) : (
          <div className="space-y-4">
            {filteredChecklists.map(list => (
              <ChecklistCard
                key={list.id}
                checklist={list}
                category={userCategories.find(c => c.id === list.categoryId)}
                project={projects.find(p => p.id === list.projectId)}
                onUpdateChecklist={onUpdateChecklist}
                onToggleTask={onToggleTask}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onEdit={() => onEditChecklistRequest(list)}
                onDuplicate={() => onDuplicateChecklist(list)}
                onShare={() => onShareChecklist(list)}
                isRecentlyCompleted={recentlyCompletedItemId === list.id}
                completingItemIds={completingItemIds}
                onToggleSingleTaskCompletion={onToggleSingleTaskCompletion}
                period={period}
              />
            ))}
          </div>
        )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListsView;