import React, { useState, useRef, useEffect } from 'react';
import { Checklist, Task, UserCategory, Reminder, Project, Note, RecurrenceRule } from '../types';
import { AddIcon, DeleteIcon, CheckCircleIcon, RadioButtonUncheckedIcon, CalendarTodayIcon, NotificationsIcon, CloseIcon, EditIcon, WarningIcon, ListAltIcon, /* ExpandMoreIcon */ CheckIcon, TabDuplicateIcon, DescriptionIcon, FolderIcon, NewTaskIcon, AutorenewIcon, MoreVertIcon, WidthNormalIcon } from './icons';
import Header from './Header';
import UnifiedToolbar from './UnifiedToolbar';
import EmptyStateIcon from './EmptyStateIcon';

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
  onToggleSingleTaskCompletion: (checklistId: string) => void;
  onToggleSidebar: () => void;
  onSelectNote: (noteId: string) => void;
  recentlyCompletedItemId: string | null;
  t: (key: string) => string;
  onCreateTask: (checklistId: string, text: string) => void;
  onUpdateTask: (checklistId: string, taskId: string, newText: string) => void;
  onDeleteTask: (checklistId: string, taskId: string) => void;
  onDuplicateChecklist: (checklist: Checklist) => void;
  completingItemIds: Set<string>;
  modalToClose: string | null;
  onModalClosed: () => void;
}

const TaskItem: React.FC<{
  task: Task; onToggle: () => void; onUpdate: (newText: string) => void; onDelete: () => void;
}> = ({ task, onToggle, onUpdate, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/60 group">
      <StaticName
          text={task.text}
          Tag="span"
          className={`flex-1 truncate ${task.completedAt ? 'line-through text-gray-500' : 'text-gray-200'}`}
      />
      <div className="flex items-center flex-shrink-0 ml-2">
        <button onClick={onDelete} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" aria-label={`Delete task: ${task.text}`}><DeleteIcon className="w-5 h-5"/></button>
        <button onClick={onToggle} className="w-8 h-8 flex items-center justify-center flex-shrink-0" aria-label={`Toggle task: ${task.text}`}>
          {task.completedAt ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
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
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-1 bg-gray-700/50 rounded-full">
        <input type="text" value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add a new item..." className="flex-1 bg-transparent px-3 py-1 text-sm text-gray-200 placeholder-gray-400 focus:outline-none"/>
        <button type="submit" className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors" disabled={!taskText.trim()}><AddIcon className="text-xl text-white" /></button>
    </form>
  );
};

const ChecklistCard: React.FC<{
  checklist: Checklist;
  category?: UserCategory;
  onUpdateChecklist: (checklistId: string, updatedData: Partial<Omit<Checklist, 'id'>>) => void;
  onToggleTask: (checklistId: string, taskId: string) => void;
  onToggleSingleTaskCompletion: (checklistId: string) => void;
  onCreateTask: (checklistId: string, text: string) => void;
  onUpdateTask: (checklistId: string, taskId: string, newText: string) => void;
  onDeleteTask: (checklistId: string, taskId: string) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  isRecentlyCompleted: boolean;
  completingItemIds: Set<string>;
}> = ({
  checklist,
  category,
  onUpdateChecklist,
  onToggleTask,
  onToggleSingleTaskCompletion,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onEdit,
  onDuplicate,
  isRecentlyCompleted,
  completingItemIds
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAnimatingOut = completingItemIds.has(checklist.id);

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
    return (
      <div className={`relative ${isAnimatingOut ? 'animate-slide-out-down' : ''}`}>
        <div className={`flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl group transition-all hover:shadow-md ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}>
          <div className="flex items-center min-w-0 flex-1 gap-3">
            <button onClick={() => onToggleSingleTaskCompletion(checklist.id)} className="w-8 h-8 flex items-center justify-center flex-shrink-0" aria-label={`Toggle task: ${checklist.name}`}>
              {isCompleted ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
            </button>
            <div className="flex items-center min-w-0 flex-1 gap-3">
              {category && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                  <Icon name={category.icon} style={{ color: category.color }} className="text-xl" />
                </div>
              )}
              <StaticName
                text={checklist.name}
                Tag="span"
                className={`flex-1 truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
              />
            </div>
          </div>
          <div ref={menuRef} className="relative flex-shrink-0 ml-2">
            <button onClick={() => setMenuOpen(p => !p)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"><MoreVertIcon /></button>
            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl z-10 p-1">
                <button onClick={() => handleMenuAction(onEdit)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><EditIcon className="text-base"/> Edit</button>
                <button onClick={() => handleMenuAction(onDuplicate)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><TabDuplicateIcon className="text-base"/> Duplicate</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Multi-task list
  const totalTasks = checklist.tasks.length;
  const completedTasks = checklist.tasks.filter(t => t.completedAt).length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isCompleted = totalTasks > 0 && completedTasks === totalTasks;
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl group transition-all hover:shadow-md ${isRecentlyCompleted ? 'animate-check-reveal' : ''} ${isAnimatingOut ? 'animate-slide-out-down' : ''}`}>
      <div className="flex items-center justify-between p-3 gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center min-w-0 flex-1 gap-3">
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {isCompleted ? <GradientCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
            </div>
            {category && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                    <Icon name={category.icon} style={{ color: category.color }} className="text-xl" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <StaticName
                    text={checklist.name}
                    Tag="span"
                    className={`truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
                />
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-2 -mt-1">
                    <span>{completedTasks}/{totalTasks}</span>
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--color-primary-600)] transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                    {/* FIX: Pass title prop to AutorenewIcon for tooltip display. */}
                    {checklist.recurrence && <AutorenewIcon className="text-base" title={getRecurrenceText(checklist.recurrence)} />}
                </div>
            </div>
        </div>
        <div className="flex items-center">
            <div ref={menuRef} className="relative flex-shrink-0">
              <button onClick={(e) => { e.stopPropagation(); setMenuOpen(p => !p); }} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"><MoreVertIcon /></button>
              {isMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-xl z-10 p-1">
                  <button onClick={() => handleMenuAction(onEdit)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><EditIcon className="text-base"/> Edit</button>
                  <button onClick={() => handleMenuAction(onDuplicate)} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><TabDuplicateIcon className="text-base"/> Duplicate</button>
                </div>
              )}
            </div>
            {/* Chevron removed; collapse behavior retained via onClick */}
        </div>
      </div>
      {isExpanded && (
        <div className="pl-[88px] pr-3 pb-3">
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
    completingItemIds, modalToClose, onModalClosed
  } = props;
  
  // Persisted filter state keys
  const STORAGE_KEY = 'tasks.filters.v1';
  type Period = 'today' | 'week' | 'month';
  type Status = 'all' | 'completed' | 'overdue' | 'todo';
  type Persisted = { projectId: string | 'all'; categoryId: string | 'all'; period: Period; status: Status };

  const loadPersisted = (): Persisted => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { projectId: 'all', categoryId: 'all', period: 'today', status: 'all' } as Persisted;
      const data = JSON.parse(raw) as Partial<Persisted>;
      return {
        projectId: data.projectId ?? 'all',
        categoryId: data.categoryId ?? 'all',
        period: (data.period as Period) ?? 'today',
        status: (data.status as Status) ?? 'all',
      };
    } catch {
      return { projectId: 'all', categoryId: 'all', period: 'today', status: 'all' } as Persisted;
    }
  };

  const persisted = typeof window !== 'undefined' ? loadPersisted() : { projectId: 'all', categoryId: 'all', period: 'today', status: 'all' } as Persisted;

  const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>(persisted.projectId);
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>(persisted.categoryId);
  const [period, setPeriod] = useState<Period>(persisted.period);
  const [statusFilter, setStatusFilter] = useState<Status>(persisted.status);
  // Always include undated as per spec; no state needed

  useEffect(() => {
    try {
      const data: Persisted = { projectId: selectedProjectId, categoryId: selectedCategoryId, period, status: statusFilter };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, [selectedProjectId, selectedCategoryId, period, statusFilter]);

  const today = new Date();
  const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const startOfWeek = (() => { const d = new Date(today); const day = (d.getDay()+6)%7; d.setDate(d.getDate()-day); d.setHours(0,0,0,0); return d; })();
  const endOfWeek = (() => { const d = new Date(startOfWeek); d.setDate(d.getDate()+6); return d; })();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);

  const inPeriod = (cl: Checklist) => {
  if (!cl.dueDate) return true; // always include undated
    const due = new Date(cl.dueDate + 'T00:00:00');
    if (period === 'today') return due.toDateString() === today.toDateString();
    if (period === 'week') return due >= startOfWeek && due <= endOfWeek;
    return due >= startOfMonth && due <= endOfMonth;
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
  
  const sortedChecklists = [...checklists].sort((a, b) => (a.priority || 99) - (b.priority || 99));

  const filteredChecklists = sortedChecklists.filter(cl => {
    const projectMatch = selectedProjectId === 'all' || cl.projectId === selectedProjectId;
    const categoryMatch = selectedCategoryId === 'all' || cl.categoryId === selectedCategoryId;
    const periodMatch = inPeriod(cl);
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
          ${active ? 'border-[var(--color-primary-600)] bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700/50 bg-white/90 dark:bg-gray-800/80 hover:shadow-sm'}`}
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

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
      <Header title={t('tasks')} onToggleSidebar={onToggleSidebar}>
        <button onClick={onNewChecklistRequest} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all text-sm">
          <NewTaskIcon />
          <span className="hidden sm:inline">{t('new_task')}</span>
        </button>
      </Header>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="py-4 border-b border-gray-200 dark:border-gray-700">
              <UnifiedToolbar
                projects={projects}
                userCategories={userCategories}
                selectedProjectId={selectedProjectId}
                selectedCategoryId={selectedCategoryId}
                onChangeProject={(id) => setSelectedProjectId(id)}
                onChangeCategory={(id) => setSelectedCategoryId(id)}
                period={period}
                onChangePeriod={(p) => setPeriod(p)}
              />
            </div>
            <main className="py-4 sm:py-6">
              {/* KPI row */}
        {checklists.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
            <KPI label="Completed" value={completed} icon={<CheckCircleIcon className="text-xl text-green-600 dark:text-green-400" />} active={statusFilter==='completed'} onClick={() => setStatusFilter(statusFilter==='completed'?'all':'completed')} />
            <KPI label="Overdue" value={overdue} icon={<WarningIcon className="text-xl text-red-600 dark:text-red-400" />} active={statusFilter==='overdue'} onClick={() => setStatusFilter(statusFilter==='overdue'?'all':'overdue')} />
            <KPI label="To do" value={todo} icon={<Icon name="not_started" className="text-xl text-amber-600 dark:text-amber-400" />} active={statusFilter==='todo'} onClick={() => setStatusFilter(statusFilter==='todo'?'all':'todo')} />
            <KPI label="Total" value={total} icon={<Icon name="list_alt_check" className="text-xl text-blue-600 dark:text-blue-400" />} active={statusFilter==='all'} onClick={() => setStatusFilter('all')} />
          </div>
        )}
        {checklists.length === 0 ? (
          <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full p-6">
            <EmptyStateIcon icon={<ListAltIcon />} size="lg" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('no_tasks_yet')}</h2>
            <p className="max-w-md mt-1 mb-6">{t('no_tasks_yet_subtitle')}</p>
            <button onClick={onNewChecklistRequest} className="mt-6 px-6 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transition-all">
              {t('create_task')}
            </button>
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="text-center text-gray-500 p-6">No tasks match the current filters.</div>
        ) : (
          <div className="space-y-4">
            {filteredChecklists.map(list => (
              <ChecklistCard
                key={list.id}
                checklist={list}
                category={userCategories.find(c => c.id === list.categoryId)}
                onUpdateChecklist={onUpdateChecklist}
                onToggleTask={onToggleTask}
                onCreateTask={onCreateTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onEdit={() => onEditChecklistRequest(list)}
                onDuplicate={() => onDuplicateChecklist(list)}
                isRecentlyCompleted={recentlyCompletedItemId === list.id}
                completingItemIds={completingItemIds}
                onToggleSingleTaskCompletion={onToggleSingleTaskCompletion}
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