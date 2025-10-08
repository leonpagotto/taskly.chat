import React, { useState, useEffect, useRef } from 'react'
import type {
  Task,
  Habit,
  UserCategory,
  Checklist,
} from '../types'
import { AppView, UserPreferences, Project, Note, RecurrenceRule, SearchableItem, ProjectFile, Event as CalendarEvent } from '../types'
import {
  CheckCircleIcon,
  RadioButtonUncheckedIcon,
  MoreVertIcon,
  LocalFireDepartmentIcon,
  TodayIcon,
  AutorenewIcon,
  ExpandMoreIcon,
  DescriptionIcon,
  ListAltIcon,
  CloseIcon,
  CalendarTodayIcon,
  ChevronLeftIcon,
  CheckIcon,
  AddIcon,
  EditIcon,
  NoteAddIcon,
  NewTaskIcon,
  CalendarAddOnIcon,
  WidthNormalIcon,
  SearchIcon,
  HelpOutlineIcon,
  DragPanIcon,
  SwipeIcon,
  MicIcon,
  ChevronLeftIcon as BackIcon,
  ChevronRightIcon as NextIcon,
  FilePresentIcon,
  EventNoteIcon,
  NewHabitIcon,
} from './icons'
import PulseWidget from './PulseWidget';
import Header from './Header';
import EmptyStateIcon from './EmptyStateIcon';
import { emptyStateSecondaryButtonBaseClass } from './buttonStyles';
import OnboardingModal from './OnboardingModal';
import ModalOverlay from './ModalOverlay';


const Icon: React.FC<{
  name: string
  className?: string
  style?: React.CSSProperties
}> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
)

// Replaced inline onboarding with shared OnboardingModal component

// Search moved to GlobalSearch at App level


const HabitCheckCircle: React.FC<{className?: string}> = ({ className }) => (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center ${className}`}>
        <CheckIcon className="text-white text-base" />
    </div>
);


const getISODate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isRecurrentItemDue = (
  recurrence: RecurrenceRule,
  date: Date,
): boolean => {
  const checkDate = new Date(date)
  checkDate.setHours(0, 0, 0, 0)
  const startDate = new Date(recurrence.startDate + 'T00:00:00')
  startDate.setHours(0, 0, 0, 0)

  if (checkDate < startDate) {
    return false
  }

  const dayMap: { [key: number]: (typeof recurrence.daysOfWeek)[number] } = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  }

  switch (recurrence.type) {
    case 'daily':
      return true
    case 'weekly':
      const todayDay = dayMap[checkDate.getDay()]
      return recurrence.daysOfWeek?.includes(todayDay) ?? false
    case 'interval':
      const diffTime = Math.abs(checkDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays % (recurrence.interval || 1) === 0
    default:
      return false
  }
}

const isHabitDueOnDate = (habit: Habit, date: Date): boolean => {
    return isRecurrentItemDue(habit.recurrence, date);
};

const isTaskDueOnDate = (task: Checklist, date: Date): boolean => {
    if (task.recurrence) {
        return isRecurrentItemDue(task.recurrence, date);
    }
    // For non-recurring tasks, check due date
    const isoDate = getISODate(date);
    return !task.dueDate || task.dueDate <= isoDate;
}

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

// Short recurrence label for compact headers
const getRecurrenceShort = (rule: RecurrenceRule): string => {
  switch (rule.type) {
    case 'daily':
      return 'Daily';
    case 'weekly': {
      if (!rule.daysOfWeek || rule.daysOfWeek.length === 0) return 'Weekly';
      if (rule.daysOfWeek.length === 7) return 'Daily';
      return rule.daysOfWeek.map(d => d.slice(0, 3)).join(',');
    }
    case 'interval':
      return `${rule.interval || 1}d`;
    default:
      return '';
  }
};

const DetailItem: React.FC<{ icon: string; label: string; children: React.ReactNode }> = ({ icon, label, children }) => {
    if (!children) return null;
    return (
        <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">{label}</h4>
            <div className="flex items-center gap-2 text-gray-200">
                <Icon name={icon} className="text-xl text-gray-500" />
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
};


interface DashboardProps {
  preferences: UserPreferences
  checklists: Checklist[]
  habits: Habit[]
  events: CalendarEvent[]
  userCategories: UserCategory[]
  projects: Project[]
  notes: Note[]
  projectFiles: ProjectFile[];
  onToggleSidebar: () => void
  onToggleTask: (checklistId: string, taskId: string) => void
  onToggleSingleTaskCompletion: (checklistId: string, date: string) => void
  onToggleHabitTask: (habitId: string, taskId: string, date: string) => void
  onToggleHabitCompletion: (habitId: string, date: string) => void
  onSelectView: (view: AppView, tab?: string) => void
  onSelectProject: (projectId: string) => void
  onSelectNote: (noteId: string) => void
  onNewTask: (date: string) => void;
  onNewHabit: () => void;
  onNewEvent: (date: string) => void;
  onNewEventAt?: (date: string, startTime: string, endTime: string) => void; // optional precise time creation
  onNewNote: (details: {}) => void;
  onNewProject: () => void;
  onEditItem: (item: Checklist | Habit | CalendarEvent) => void;
  onUpdateItemPriority: (itemId: string, newPriority: number, itemType: 'task' | 'habit') => void;
  recentlyCompletedItemId: string | null;
  t: (key: string) => string;
  onCreateTask: (checklistId: string, text: string) => void;
  onAddTaskToHabit: (habitId: string, text: string) => void;
  completingItemIds: Set<string>;
  modalToClose: string | null;
  onModalClosed: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

interface DailyItemWrapper {
  item: Checklist | Habit | CalendarEvent;
  type: 'task' | 'habit' | 'event';
  id: string;
}

type EventLiveStatus = 'upcoming' | 'live' | 'done';

const isSameDayDate = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const parseEventDateTime = (date: string | null, time: string | null) => {
  if (!date) return null;
  if (time === null || time === undefined) return new Date(`${date}T00:00:00`);
  return new Date(`${date}T${time}`);
};

const formatHM = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getEventStatusForNow = (event: CalendarEvent, now: Date): EventLiveStatus => {
  // All-day events are considered live for the selected date
  if (event.isAllDay) return 'live';
  const start = parseEventDateTime(event.startDate, event.startTime);
  const end = parseEventDateTime(event.endDate, event.endTime) || start;
  if (!start) return 'upcoming';
  if (now < start) return 'upcoming';
  if (end && now > end) return 'done';
  return 'live';
};

const getCountdownLabel = (target: Date, now: Date) => {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'now';
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
};

const MonthlyCalendar: React.FC<{
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClose: () => void;
}> = ({ selectedDate, onDateSelect, onClose }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => (new Date(year, month, 1).getDay() + 6) % 7; // Monday is 0

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const calendarDays = Array(startDay).fill(null).concat(Array.from({ length: numDays }, (_, i) => i + 1));
  
  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const handlePrevMonth = () => setDisplayDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setDisplayDate(new Date(year, month + 1, 1));

  return (
  <ModalOverlay onClick={onClose} className="flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm p-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700"><ChevronLeftIcon /></button>
          <h3 className="font-semibold text-lg">{displayDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700"><Icon name="chevron_right" /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`}></div>;
            const date = new Date(year, month, day);
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={day}
                onClick={() => { onDateSelect(date); onClose(); }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors text-sm
                  ${isSelected ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white' : ''}
                  ${!isSelected && isToday ? 'border border-gray-500' : ''}
                  ${!isSelected ? 'hover:bg-gray-700' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </ModalOverlay>
  );
};

const PriorityModal: React.FC<{
  item: Checklist | Habit;
  onClose: () => void;
  onSave: (newPriority: number) => void;
}> = ({ item, onClose, onSave }) => {
    const [priority, setPriority] = useState(item.priority || 10);
    const handleSave = () => { onSave(priority); onClose(); };
    const updatePriority = (amount: number) => {
        setPriority(p => Math.max(1, Math.min(99, p + amount)));
    }
    return (
  <ModalOverlay onClick={onClose} className="flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-xs p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-semibold text-center mb-4">Set a priority</h2>
                <div className="flex items-center justify-center gap-4 mb-4">
                    <button onClick={() => updatePriority(-1)} className="w-10 h-10 rounded-[var(--radius-button)] bg-gray-700 hover:bg-gray-600 text-2xl">-</button>
                    <span className="text-4xl font-bold w-16 text-center">{priority}</span>
                    <button onClick={() => updatePriority(1)} className="w-10 h-10 rounded-[var(--radius-button)] bg-gray-700 hover:bg-gray-600 text-2xl">+</button>
                </div>
                <button onClick={() => setPriority(10)} className="w-full text-center py-2 rounded-[var(--radius-button)] bg-gray-700 hover:bg-gray-600 text-sm mb-4">Default - 10</button>
                <p className="text-xs text-gray-400 text-center mb-6">Higher priority activities will be displayed higher in the list.</p>
                <div className="flex items-center gap-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-[var(--radius-button)] bg-gray-600 hover:bg-gray-500 font-semibold">Close</button>
          <button onClick={handleSave} className="flex-1 py-2 rounded-[var(--radius-button)] bg-blue-600 hover:bg-blue-500 font-semibold">OK</button>
                </div>
        </div>
      </ModalOverlay>
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


const DashboardItemsModal: React.FC<{
  item: Checklist | Habit | null;
  onClose: () => void;
  onToggleTask?: (listId: string, taskId: string) => void;
  onToggleHabitTask?: (habitId: string, taskId: string, date: string) => void;
  onEditRequest: (item: Checklist | Habit) => void;
  category?: UserCategory;
  project?: Project;
  selectedISODate: string;
  onCreateTask?: (listId: string, text: string) => void;
  onAddTaskToHabit?: (habitId: string, text: string) => void;
}> = ({ item, onClose, onToggleTask, onToggleHabitTask, onEditRequest, category, project, selectedISODate, onCreateTask, onAddTaskToHabit }) => {
  if (!item) return null;

  const isHabit = 'type' in item;
  const isSingleTask = !isHabit && (item as Checklist).tasks.length === 0;
  const isDailyCheckOff = isHabit && (item as Habit).type === 'daily_check_off';
  const hasSubtasks = !isSingleTask && !isDailyCheckOff;

  const getSubtasks = () => {
    if (isHabit) {
        const habit = item as Habit;
        // For recurring habits, we need to determine the status for the selected date.
        return (habit.tasks || []).map(task => ({
            ...task,
            completedAt: task.completedAt === selectedISODate ? task.completedAt : null,
        }));
    } else {
        const checklist = item as Checklist;
        const tasks = checklist.tasks || [];
        if (checklist.recurrence) {
            // For recurring tasks, also check against selected date.
            return tasks.map(task => ({
                ...task,
                completedAt: task.completedAt === selectedISODate ? task.completedAt : null,
            }));
        }
        // For non-recurring tasks, completion is permanent.
        return tasks;
    }
  };

  const tasksToShow = getSubtasks();

  const DueBadge = !isHabit && (item as Checklist).dueDate ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-gray-200 text-xs">
      <CalendarTodayIcon className="text-xs text-gray-200" />
      {new Date((item as Checklist).dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
    </span>
  ) : null;

  const ProjectBadge = project ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-gray-200 text-xs max-w-[40%]">
      <Icon name={project.icon || 'folder'} className="text-xs" style={{ color: project.color }} />
      <span className="truncate">{project.name}</span>
    </span>
  ) : null;

  const CategoryBadge = category ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-gray-200 text-xs">
      <Icon name={category.icon} className="text-xs" style={{ color: category.color }} />
      {category.name}
    </span>
  ) : null;

  const RepeatBadge = item.recurrence ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-gray-200 text-xs" title={getRecurrenceText(item.recurrence)}>
      <AutorenewIcon className="text-xs text-gray-200" />
      {getRecurrenceShort(item.recurrence)}
    </span>
  ) : null;

  return (
  <ModalOverlay onClick={onClose} className="flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm md:max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex items-center justify-between border-b border-gray-700/50 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{item.name}</h2>
            <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-gray-300">
              {CategoryBadge}
              {ProjectBadge}
              {RepeatBadge}
              {DueBadge}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { onEditRequest(item); onClose(); }}
              className="p-2 rounded-[var(--radius-button)] hover:bg-gray-700"
              aria-label="Edit"
              title="Edit"
            >
              <EditIcon />
            </button>
            <button onClick={onClose} className="p-2 rounded-[var(--radius-button)] hover:bg-gray-700" aria-label="Close"><CloseIcon /></button>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          <main className="p-4 overflow-y-auto space-y-2 flex-1">
            {!hasSubtasks ? (
              <div className="text-center text-gray-400 py-8">
                <p className="mb-4">This is a single item. Add more items to turn it into a checklist.</p>
                <button onClick={() => { onEditRequest(item); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded-[var(--radius-button)] font-semibold hover:bg-blue-500 transition-colors">
                  Add Items
                </button>
              </div>
            ) : tasksToShow.length > 0 ? tasksToShow.map(task => {
              const handleToggle = () => {
                if (isHabit) { onToggleHabitTask?.(item.id, task.id, selectedISODate); }
                else { onToggleTask?.(item.id, task.id); }
              };
              return (
                <div key={task.id} onClick={handleToggle} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-700/60 cursor-pointer transition-colors">
                  <span className={`text-sm ${task.completedAt ? 'line-through text-gray-500' : 'text-gray-200'}`}>{task.text}</span>
                  <div className="w-6 h-6 flex items-center justify-center">
                    {task.completedAt ? <HabitCheckCircle className="w-full h-full" /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-500" />}
                  </div>
                </div>
              );
            }) : (
              <p className="text-center text-gray-400 dark:text-gray-500 py-8 text-sm">No sub-items in this list.</p>
            )}
          </main>
          {hasSubtasks && (
            <footer className="p-4 border-t border-gray-700/50 flex-shrink-0">
              <AddTaskForm
                onAddTask={(text) => {
                  if (isHabit) { onAddTaskToHabit?.(item.id, text); }
                  else { onCreateTask?.(item.id, text); }
                }}
              />
            </footer>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
}

const useSwipeAndHold = (
    onEdit: () => void,
    onOpenPriorityModal: () => void
) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const holdTimeoutRef = useRef<number | null>(null);
    const [touchState, setTouchState] = useState<{ startX: number | null; currentX: number | null; isSwiping: boolean }>({ startX: null, currentX: null, isSwiping: false });
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const translation = touchState.startX !== null && touchState.currentX !== null ? touchState.currentX - touchState.startX : 0;
    const clampedTranslation = Math.max(-100, Math.min(100, translation));

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!isMobile) return;
        setTouchState({ startX: e.touches[0].clientX, currentX: e.touches[0].clientX, isSwiping: false });
        if (itemRef.current) itemRef.current.style.transition = 'none';

        holdTimeoutRef.current = window.setTimeout(() => {
            onEdit();
            if (navigator.vibrate) navigator.vibrate(50);
            handleTouchEnd(true);
        }, 700);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isMobile || touchState.startX === null) return;
        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }
        const currentX = e.touches[0].clientX;
        setTouchState(prev => ({ ...prev, currentX, isSwiping: Math.abs(currentX - (prev.startX ?? 0)) > 10 }));
    };

    const handleTouchEnd = (isHold = false) => {
        if (!isMobile || touchState.startX === null) return;

        if (holdTimeoutRef.current) {
            clearTimeout(holdTimeoutRef.current);
            holdTimeoutRef.current = null;
        }

        if (itemRef.current) {
            itemRef.current.style.transition = 'transform 0.3s ease';
            itemRef.current.style.transform = 'translateX(0px)';
        }
        
        if (!isHold) {
            if (translation < -60) {
                onEdit();
            } else if (translation > 60) {
                onOpenPriorityModal();
            }
        }

        setTimeout(() => {
            setTouchState({ startX: null, currentX: null, isSwiping: false });
        }, 300);
    };

    return {
        itemRef,
        touchHandlers: {
            onTouchStart: handleTouchStart,
            onTouchMove: handleTouchMove,
            onTouchEnd: () => handleTouchEnd(false),
        },
        translation: clampedTranslation,
        isSwiping: touchState.isSwiping,
    };
};

const DashboardSingleTask: React.FC<{
  task: Checklist;
  category?: UserCategory;
  onToggleCompletion: () => void;
  onEdit: () => void;
  onOpenModal: () => void;
  isCompleted: boolean;
  isRecentlyCompleted: boolean;
  onOpenPriorityModal: () => void;
  isCompleting: boolean;
}> = ({ task, category, onToggleCompletion, onEdit, onOpenModal, isCompleted, isRecentlyCompleted, onOpenPriorityModal, isCompleting }) => {
  const { itemRef, touchHandlers, translation, isSwiping } = useSwipeAndHold(onEdit, onOpenPriorityModal);
  const [justChecked, setJustChecked] = useState(false);
  const visualCompleted = isCompleted || justChecked;
  const handleRowClick = () => { if (!isSwiping) onOpenModal(); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleRowClick(); }
  };
  useEffect(() => {
    // Reset optimistic state when parent state reflects
    if (isCompleted && justChecked) setJustChecked(false);
    if (!isCompleted && justChecked) {
      // If unchecking after having justChecked, also clear local state
      setJustChecked(false);
    }
  }, [isCompleted, justChecked]);
  return (
    <div className={`relative overflow-hidden rounded-lg ${isCompleting ? 'animate-slide-out-down' : ''}`} {...touchHandlers}>
      <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6" style={{ opacity: Math.max(0, -translation / 60), zIndex: 1 }}>
        <EditIcon className="text-white text-2xl" />
      </div>
      <div className="absolute inset-0 bg-purple-500 flex items-center justify-end px-6" style={{ opacity: Math.max(0, translation / 60), zIndex: 1 }}>
        <Icon name="flag" className="text-white text-2xl" />
      </div>
      <div ref={itemRef} style={{ transform: `translateX(${translation}px)` }} className="relative z-10">
        <div
          onClick={handleRowClick}
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className={`flex items-center justify-between p-2 rounded-lg transition-all group hover:bg-gray-200 dark:hover:bg-gray-700/50 relative overflow-hidden cursor-pointer min-h-[48px] ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}
        >
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
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`truncate ${visualCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{task.name}</span>
                </div>
                {task.dueTime && (
                  <span className="ml-2 text-xs font-mono bg-gray-200 dark:bg-gray-700/80 px-1.5 py-0.5 rounded flex-shrink-0">{task.dueTime}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center ml-3 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isCompleted) {
                  setJustChecked(true);
                  window.setTimeout(() => onToggleCompletion(), 700);
                } else {
                  onToggleCompletion();
                }
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-300/50 dark:hover:bg-gray-700/50"
              aria-label={`Toggle ${task.name}`}
            >
              {visualCompleted ? <HabitCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-400 dark:text-gray-400" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const DashboardMultiTaskList: React.FC<{
  list: Checklist
  category?: UserCategory
  project?: Project
  onOpenModal: (list: Checklist) => void
  onEdit: () => void
  selectedDate: Date
  isRecentlyCompleted: boolean;
  onOpenPriorityModal: () => void;
  isCompleting: boolean;
  isFlashing?: boolean;
}> = ({ list, category, project, onOpenModal, onEdit, selectedDate, isRecentlyCompleted, onOpenPriorityModal, isCompleting, isFlashing }) => {
  const selectedISODate = getISODate(selectedDate);
  const { itemRef, touchHandlers, translation, isSwiping } = useSwipeAndHold(onEdit, onOpenPriorityModal);

  const tasks = list.tasks || [];
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => {
      if (!t.completedAt) return false;
      if (list.recurrence) {
          return t.completedAt === selectedISODate;
      }
      return true; // Non-recurring, any completion counts.
  }).length;
  // Consider a list completed when all subtasks are completed for the selected date (or overall for non-recurring)
  const isCompletedForDate = totalTasks > 0
    ? (list.recurrence ? completedTasks === totalTasks : tasks.every(t => !!t.completedAt))
    : list.completionHistory.includes(selectedISODate);
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : (isCompletedForDate ? 100 : 0);

  const handleClick = () => {
    if (!isSwiping) onOpenModal(list);
  };

  return (
  <div className={`relative overflow-hidden rounded-lg ${isCompleting ? 'animate-slide-out-down' : ''} ${isFlashing ? 'ring-2 ring-[var(--color-primary-600)] ring-offset-2 ring-offset-gray-200 dark:ring-offset-gray-900 animate-pulse' : ''}`} {...touchHandlers}>
        <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6" style={{ opacity: Math.max(0, -translation / 60), zIndex: 1 }}><EditIcon className="text-white text-2xl" /></div>
        <div className="absolute inset-0 bg-purple-500 flex items-center justify-end px-6" style={{ opacity: Math.max(0, translation / 60), zIndex: 1 }}><Icon name="flag" className="text-white text-2xl" /></div>
        <div ref={itemRef} style={{ transform: `translateX(${translation}px)` }} className="relative z-10">
            <div
              onClick={handleClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
              className={`p-2 rounded-lg transition-colors group hover:bg-gray-200 dark:hover:bg-gray-700/50 relative overflow-hidden cursor-pointer min-h-[48px] ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0 flex-1 gap-3">
                     
                    <div className="flex items-center min-w-0 flex-1 gap-3">
                      {category ? (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                          <Icon name={category.icon} style={{ color: category.color }} className="text-xl" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700"><ListAltIcon className="text-xl text-gray-500" /></div>
                      )}
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className={`font-medium truncate ${isCompletedForDate ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{list.name}</p>
                          </div>
                          {list.dueTime && <span className="ml-2 text-xs font-mono bg-gray-200 dark:bg-gray-700/80 px-1.5 py-0.5 rounded flex-shrink-0">{list.dueTime}</span>}
                        </div>
                        {/* Removed project and recurrence badges from the item card */}
                      </div>
                    </div>
                </div>
        <div className="flex items-center ml-3 gap-2 flex-shrink-0">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono bg-gray-900/10 dark:bg-white/10 text-gray-800 dark:text-gray-200">{completedTasks}/{totalTasks}</span>
                    <div className="w-8 h-8 flex items-center justify-center" aria-label={`View tasks for ${list.name}`}> 
                       {isCompletedForDate ? <HabitCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-400 dark:text-gray-400" />}
                    </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

const DashboardHabitCard: React.FC<{
  habit: Habit
  category?: UserCategory
  project?: Project
  selectedDate: Date
  onToggleHabitCompletion: (habitId: string, date: string) => void
  onOpenSubtaskModal: (habit: Habit) => void
  onEdit: () => void
  isRecentlyCompleted: boolean;
  onOpenPriorityModal: () => void;
  isCompleting: boolean;
  isFlashing?: boolean;
}> = ({ habit, category, project, selectedDate, onToggleHabitCompletion, onOpenSubtaskModal, onEdit, isRecentlyCompleted, onOpenPriorityModal, isCompleting, isFlashing }) => {
  const selectedISODate = getISODate(selectedDate)
  const isCompletedOnSelectedDate = habit.completionHistory.includes(selectedISODate)
  const isSingleCheckOff = habit.type === 'daily_check_off';
  const { itemRef, touchHandlers, translation, isSwiping } = useSwipeAndHold(onEdit, onOpenPriorityModal);
  const [justChecked, setJustChecked] = useState(false);
  const totalTasks = habit.tasks?.length || 0
  const completedTasks = habit.tasks?.filter(t => t.completedAt === selectedISODate).length || 0;
  const isCompletedForSelectedDate = totalTasks > 0 ? (completedTasks === totalTasks) : isCompletedOnSelectedDate;
  const visualCompleted = isCompletedForSelectedDate || justChecked;

  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : isCompletedForSelectedDate ? 100 : 0

  const handleClick = () => {
    if (!isSwiping) {
      onOpenSubtaskModal(habit);
    }
  };

  return (
  <div className={`relative overflow-hidden rounded-lg ${isCompleting ? 'animate-slide-out-down' : ''} ${isFlashing ? 'ring-2 ring-[var(--color-primary-600)] ring-offset-2 ring-offset-gray-200 dark:ring-offset-gray-900 animate-pulse' : ''}`} {...touchHandlers}>
        <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6" style={{ opacity: Math.max(0, -translation / 60), zIndex: 1 }}><EditIcon className="text-white text-2xl" /></div>
        <div className="absolute inset-0 bg-purple-500 flex items-center justify-end px-6" style={{ opacity: Math.max(0, translation / 60), zIndex: 1 }}><Icon name="flag" className="text-white text-2xl" /></div>
        <div ref={itemRef} style={{ transform: `translateX(${translation}px)` }} className="relative z-10">
            <div
              onClick={handleClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
              className={`p-2 rounded-lg transition-colors group hover:bg-gray-200 dark:hover:bg-gray-700/50 relative overflow-hidden cursor-pointer min-h-[48px] ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}
            >
              <div className={`flex items-center justify-between`}>
                <div className="flex items-center flex-1 min-w-0 gap-3">
                   
                    <div className="flex items-center flex-1 min-w-0 gap-3">
                      {category ? (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${category.color}20` }}>
                          <Icon name={category.icon} style={{ color: category.color }} className="text-xl"/>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-200 dark:bg-gray-700"><AutorenewIcon className="text-xl text-gray-500" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className={`font-medium truncate ${visualCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{habit.name}</p>
                        </div>
                        {/* Removed project and recurrence badges from the item card */}
                      </div>
                    </div>
                </div>
        <div className="flex items-center ml-3 gap-2 flex-shrink-0">
          {habit.type === 'checklist' && totalTasks > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200">{completedTasks}/{totalTasks}</span>
          )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isSingleCheckOff) {
                          if (!isCompletedOnSelectedDate) {
                            setJustChecked(true);
                            window.setTimeout(() => onToggleHabitCompletion(habit.id, selectedISODate), 700);
                          } else {
                            onToggleHabitCompletion(habit.id, selectedISODate);
                          }
                        } else {
                          // For multi-item habits, clicking the circle opens the subtask modal
                          onOpenSubtaskModal(habit);
                        }
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${isSingleCheckOff ? 'hover:bg-gray-300/50 dark:hover:bg-gray-700/50' : 'hover:bg-gray-300/30 dark:hover:bg-gray-700/30'}`}
                      aria-label={`Open ${habit.name}`}
                    >
                      {visualCompleted ? <HabitCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-400 dark:text-gray-400" />}
                    </button>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

const DashboardEventCard: React.FC<{
  event: CalendarEvent;
  color?: string;
  onEdit: () => void;
}> = ({ event, color, onEdit }) => {
  const now = new Date();
  const isToday = isSameDayDate(now, new Date(event.startDate + 'T00:00:00'));
  const start = parseEventDateTime(event.startDate, event.startTime) || new Date(event.startDate + 'T00:00:00');
  const end = parseEventDateTime(event.endDate, event.endTime) || start;
  const status: EventLiveStatus = event.isAllDay ? 'live' : getEventStatusForNow(event, now);

  const withinAnHour = !event.isAllDay && status === 'upcoming' && start.getTime() - now.getTime() <= 60 * 60 * 1000;
  const countdown = withinAnHour ? getCountdownLabel(start, now) : null;
  const timeText = event.isAllDay ? 'All-day' : `${event.startTime || formatHM(start)}${event.endTime ? ` - ${event.endTime}` : ''}`;
    // Only keep an 'Ongoing' badge when event is live; remove all other badges
    const statusBadge = (() => {
      if (!isToday) return null;
      if (status === 'live') return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-600/20 text-green-300">Ongoing</span>;
      return null;
    })();
    const isDone = status === 'done';
    
  return (
    <div
      onClick={onEdit}
      className={`relative overflow-hidden rounded-lg transition-colors group cursor-pointer min-h-[56px] ${isDone ? 'opacity-60' : ''} bg-gray-200 dark:bg-gray-900 hover:bg-gray-300 dark:hover:bg-gray-800`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: color || 'var(--color-primary-600)' }} />
      <div className="flex items-center justify-between p-2.5 h-full">
        <div className="flex items-center min-w-0 flex-1 gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`truncate ${isDone ? 'text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{event.title}</span>
                {statusBadge}
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 md:hidden" aria-label={`Edit ${event.title}`}>
                  <EditIcon className="text-base"/>
                </button>
              </div>
              <span className={`ml-2 text-xs font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${isDone ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400' : 'bg-gray-200 dark:bg-gray-700/80'}`}>{timeText}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Desktop-only day grid timeline for events
const DayEventsTimeline: React.FC<{
  events: CalendarEvent[];
  projects: Project[];
  selectedDate: Date;
  onEditItem: (ev: CalendarEvent) => void;
  onNewEventAt?: (date: string, startTime: string, endTime: string) => void;
}> = ({ events, projects, selectedDate, onEditItem, onNewEventAt }) => {
  // Zoom density state (persisted)
  const HOUR_MIN = 28;
  const HOUR_MAX = 112;
  const HOUR_STEP = 8;
  const LS_KEY = 'today.timeline.hourPx.v1';
  const [hourPx, setHourPx] = useState<number>(() => {
    if (typeof window === 'undefined') return 56;
    const v = Number(localStorage.getItem(LS_KEY));
    return Number.isFinite(v) && v >= HOUR_MIN && v <= HOUR_MAX ? v : 56;
  });
  const MIN_PX = hourPx / 60; // pixels per minute
  const gapX = 6; // px gap between overlapping columns
  const containerRef = useRef<HTMLDivElement>(null);
  const [jumpHour, setJumpHour] = useState<number>(7);
  const [isDragging, setIsDragging] = useState<{
    id: string;
    mode: 'move' | 'resize';
    originY: number;
    baseStart: number; // minutes at drag start
    baseEnd: number;   // minutes at drag start
    start: number;     // preview current
    end: number;       // preview current
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS_KEY, String(hourPx));
  }, [hourPx]);

  const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

  const toMinutes = (dateStr: string, timeStr: string | null | undefined) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const minutesToHM = (mins: number) => {
    const clamped = Math.max(0, Math.min(24 * 60, Math.round(mins)));
    const h = Math.floor(clamped / 60);
    const m = clamped % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const dayStart = new Date(selectedDate);
  dayStart.setHours(0, 0, 0, 0);

  const allDay = events.filter(e => e.isAllDay);
  const timedRaw = events.filter(e => !e.isAllDay).map(e => {
    const startMin = toMinutes(e.startDate, e.startTime);
    let endMin: number;
    if (e.endDate && e.endTime) {
      endMin = toMinutes(e.endDate, e.endTime);
      // If event spans multiple days and selected day is start or middle/end, clamp to the day bounds
      const startDate = new Date(e.startDate + 'T00:00:00');
      const endDate = new Date((e.endDate) + 'T00:00:00');
      if (startDate < dayStart && endDate > dayStart) {
        // spans over this day without explicit times -> use full day
        endMin = 24 * 60;
      }
    } else {
      endMin = startMin + 60; // default 1h if no end specified
    }
    const s = clamp(startMin, 0, 24 * 60);
    const eMin = clamp(endMin, 0, 24 * 60);
    return { ev: e, start: s, end: Math.max(eMin, s + 15) }; // min 15m duration
  });

  // Build clusters of overlapping events
  type TimedItem = { ev: CalendarEvent; start: number; end: number; col?: number; cols?: number };
  const timedSorted: TimedItem[] = timedRaw.sort((a, b) => a.start - b.start || a.end - b.end);

  let i = 0;
  const output: TimedItem[] = [];
  while (i < timedSorted.length) {
    // find cluster where events overlap
    let cluster: TimedItem[] = [];
    let clusterEnd = -1;
    let j = i;
    while (j < timedSorted.length) {
      const item = timedSorted[j];
      if (cluster.length === 0 || item.start < clusterEnd) {
        cluster.push(item);
        clusterEnd = Math.max(clusterEnd, item.end);
        j++;
      } else {
        break;
      }
      // Extend cluster if subsequent events start before current clusterEnd
      while (j < timedSorted.length && timedSorted[j].start < clusterEnd) {
        cluster.push(timedSorted[j]);
        clusterEnd = Math.max(clusterEnd, timedSorted[j].end);
        j++;
      }
    }

    // Assign columns greedily
    const columns: TimedItem[][] = [];
    const MAX_COLS = 3;
    for (const item of cluster) {
      let placed = false;
      for (let c = 0; c < Math.min(columns.length, MAX_COLS); c++) {
        const last = columns[c][columns[c].length - 1];
        if (last.end <= item.start) {
          columns[c].push(item);
          item.col = c;
          placed = true;
          break;
        }
      }
      if (!placed) {
        if (columns.length < MAX_COLS) {
          columns.push([item]);
          item.col = columns.length - 1;
        } else {
          // Stack into last column if exceeding MAX_COLS
          columns[columns.length - 1].push(item);
          item.col = MAX_COLS - 1;
        }
      }
    }
    const usedCols = Math.min(columns.length, MAX_COLS);
    for (const item of cluster) {
      item.cols = usedCols;
      output.push(item);
    }
    i = j;
  }

  const isToday = isSameDayDate(new Date(), selectedDate);

  const scrollToHour = (hour: number, behavior: ScrollBehavior = 'smooth') => {
    const y = hour * 60 * MIN_PX;
    containerRef.current?.scrollTo({ top: Math.max(0, y - 20), behavior });
  };

  const scrollToNow = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const y = minutes * MIN_PX;
    containerRef.current?.scrollTo({ top: Math.max(0, y - 40), behavior: 'smooth' });
  };

  useEffect(() => {
    // Auto-scroll to 07:00 when date/timeline renders
    scrollToHour(7, 'auto');
  }, [hourPx, selectedDate]);

  return (
  <div ref={containerRef} className="p-2 pb-20 overflow-y-auto min-h-0 h-full" style={{ maxHeight: '100%' }}>
      {/* Sticky tiny controls */}
  <div className="sticky top-0 z-10 flex justify-end items-center p-1 rounded-t-xl">
        {/* Zoom controls only */}
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
          <button
            onClick={() => setHourPx(h => Math.max(HOUR_MIN, h - HOUR_STEP))}
            className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700/60 hover:bg-gray-300 dark:hover:bg-gray-700"
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setHourPx(h => Math.min(HOUR_MAX, h + HOUR_STEP))}
            className="px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700/60 hover:bg-gray-300 dark:hover:bg-gray-700"
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>
        </div>
      </div>
      {/* All-day row: events only (untimed habits are not plotted here) */}
      {allDay.length > 0 && (
        <div className="mb-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1">All Day</div>
          <div className="flex flex-wrap gap-2">
            {allDay.map(ev => {
              const project = ev.projectId ? projects.find(p => p.id === ev.projectId) : undefined;
              const color = project?.color;
              return (
                <button key={ev.id} onClick={() => onEditItem(ev)} className="relative px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-700/60 hover:bg-gray-300 dark:hover:bg-gray-700 text-sm flex items-center gap-2">
                  <span className="block w-1 h-4 rounded" style={{ backgroundColor: color || 'var(--color-primary-600)' }} />
                  <span className="truncate max-w-[16rem]">{ev.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
  <div className="grid grid-cols-[36px_1fr] gap-2.5">
        {/* Hour labels */}
        <div className="relative" style={{ height: hourPx * 24 }}>
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="absolute left-0 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pr-0.5 text-right w-full" style={{ top: h * hourPx }}>
              {String(h).padStart(2, '0')}
            </div>
          ))}
        </div>
        {/* Events track */}
        <div
          className="relative events-track"
          style={{ height: hourPx * 24 }}
          onClick={(e) => {
            if (!onNewEventAt) return;
            const el = (e.target instanceof Element) ? e.target : null;
            const isInEvent = !!el?.closest('.event-card');
            const isInHandle = !!el?.closest('.resize-handle');
            if (isInEvent || isInHandle) return;
            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
            const y = e.clientY - rect.top; // px from top of track
            let minutes = y / MIN_PX;
            const SNAP = 5;
            minutes = Math.round(minutes / SNAP) * SNAP;
            // Avoid creating events ending at 24:00 which some time inputs don't accept
            const MAX_MINUTE = 24 * 60 - SNAP; // 23:55 for SNAP=5
            minutes = Math.max(0, Math.min(MAX_MINUTE, minutes));
            const startH = Math.floor(minutes / 60);
            const startM = Math.round(minutes % 60);
            const startHM = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
            const duration = 30; // default 30m
            let endMin = Math.min(MAX_MINUTE + SNAP, minutes + duration); // allow end to reach 24:00 equivalent but clamp to 23:55
            const endH = Math.floor(endMin / 60);
            const endM = Math.round(endMin % 60);
            const endHM = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
            onNewEventAt(getISODate(selectedDate), startHM, endHM);
          }}
        >
          {/* Hour grid lines */}
          {Array.from({ length: 25 }, (_, h) => (
            <div key={h} className="absolute left-0 right-0 border-t border-dashed border-gray-300 dark:border-gray-700" style={{ top: h * hourPx }} />
          ))}
          {/* Half-hour lines */}
          {Array.from({ length: 24 }, (_, h) => (
            <div key={`half-${h}`} className="absolute left-0 right-0 border-t border-dashed border-gray-300/60 dark:border-gray-700/60" style={{ top: h * hourPx + hourPx / 2 }} />
          ))}

          {/* Now marker - highlighted with primary gradient */}
          {isToday && (() => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            const top = minutes * MIN_PX;
            return (
              <div className="absolute left-0 right-0 pointer-events-none z-20" style={{ top }}>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-primary-end)]" />
                <div className="h-0.5 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] opacity-80" />
              </div>
            )
          })()}

          {/* Timed events */}
          {output.map(item => {
            const { ev, start, end, col = 0, cols = 1 } = item;
            const project = ev.projectId ? projects.find(p => p.id === ev.projectId) : undefined;
            const leftPct = (100 / cols) * col;
            const widthPct = 100 / cols;
            const top = start * MIN_PX;
            const height = Math.max(28, (end - start) * MIN_PX);
            const status = getEventStatusForNow(ev, new Date());
            const isDone = status === 'done' && isToday;
            const startHM = ev.startTime || '00:00';
            const endHM = ev.endTime || '';
            const attendees = ev.attendees && ev.attendees.length > 0 ? (() => {
              const [first, second, ...rest] = ev.attendees as string[];
              if (!second) return first;
              const extra = rest.length > 0 ? ` +${rest.length}` : '';
              return `${first}, ${second}${extra}`;
            })() : null;

            // Apply dragging preview if this item is being dragged
            const isThisDragging = isDragging && isDragging.id === ev.id;
            const dragTop = isThisDragging ? (isDragging.start * MIN_PX) : top;
            const dragHeight = isThisDragging ? Math.max(28, (isDragging.end - isDragging.start) * MIN_PX) : height;
            return (
              <div
                key={ev.id}
                onMouseDown={(e) => {
                  // start move unless target is resize handle
                  const target = e.target as HTMLElement;
                  const isHandle = target.closest?.('.resize-handle');
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const offsetY = e.clientY - rect.top; // in px inside card
                  const originY = e.clientY;
                  if (isHandle) {
                    setIsDragging({ id: ev.id, mode: 'resize', originY, baseStart: start, baseEnd: end, start, end });
                  } else {
                    setIsDragging({ id: ev.id, mode: 'move', originY, baseStart: start, baseEnd: end, start, end });
                  }
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  // Always stop propagation to avoid container click creating a new event
                  e.stopPropagation();
                  if (isDragging) { e.preventDefault(); return; }
                  onEditItem(ev);
                }}
                className={`event-card absolute rounded-lg overflow-hidden cursor-pointer ${isDone ? 'opacity-60' : ''} hover:shadow-sm transition-shadow`}
                style={{
                  top: dragTop,
                  height: dragHeight,
                  left: `calc(${leftPct}% + ${col * (gapX / 2)}px)`,
                  width: `calc(${widthPct}% - ${gapX}px)`,
                  background: 'transparent',
                }}
              >
                {/* Card background - increase opacity for better legibility */}
                <div className="w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: project?.color || 'var(--color-primary-600)' }} />
                  <div className="h-full flex items-start justify-between gap-2 pr-2.5 pl-2 py-1">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm leading-tight">{ev.title}</p>
                      {(ev.location || attendees) && (
                        <p className="truncate text-[11px] text-gray-600 dark:text-gray-300 leading-tight">{[ev.location, attendees].filter(Boolean).join(' • ')}</p>
                      )}
                    </div>
                  </div>
                  {/* Resize handle */}
                  <div className="resize-handle absolute left-1 right-1 bottom-0 h-2 cursor-ns-resize opacity-60 hover:opacity-100">
                    <div className="mx-auto w-8 h-0.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Global mouse listeners for drag/resize */}
      {isDragging && (
        <DragHandlers
          isDragging={isDragging}
          minPx={MIN_PX}
          onUpdate={(next) => setIsDragging(cur => cur && cur.id === next.id ? next : cur)}
          onCancel={() => setIsDragging(null)}
          onCommit={() => {
            if (!isDragging) return;
            const { id, start, end } = isDragging;
            const ev = events.find(e => e.id === id);
            if (!ev) { setIsDragging(null); return; }
            const newStart = clamp(start, 0, 24 * 60);
            const newEnd = clamp(Math.max(end, newStart + 5), 0, 24 * 60);
            const updated: CalendarEvent = {
              ...ev,
              startTime: minutesToHM(newStart),
              endTime: minutesToHM(newEnd),
              // keep dates the same; multi-day edits are out-of-scope here
            };
            setIsDragging(null);
            onEditItem(updated);
          }}
        />
      )}
    </div>
  );
};

// Helper component for handling mousemove/mouseup during drag/resize
const DragHandlers: React.FC<{
  isDragging: { id: string; mode: 'move' | 'resize'; originY: number; baseStart: number; baseEnd: number; start: number; end: number };
  minPx: number; // pixels per minute
  onUpdate: (next: { id: string; mode: 'move' | 'resize'; originY: number; baseStart: number; baseEnd: number; start: number; end: number }) => void;
  onCancel: () => void;
  onCommit: () => void;
}> = ({ isDragging, minPx, onUpdate, onCancel, onCommit }) => {
  useEffect(() => {
    const SNAP_MIN = 5; // snap to 5-minute increments
    const handleMove = (e: MouseEvent) => {
      const dyPx = e.clientY - isDragging.originY;
      const deltaMinRaw = dyPx / minPx;
      const deltaMin = Math.round(deltaMinRaw / SNAP_MIN) * SNAP_MIN;
      if (isDragging.mode === 'move') {
        const dur = isDragging.baseEnd - isDragging.baseStart;
        let nextStart = isDragging.baseStart + deltaMin;
        nextStart = Math.max(0, Math.min(24 * 60 - 5, nextStart));
        onUpdate({ ...isDragging, start: nextStart, end: nextStart + dur });
      } else {
        let nextEnd = isDragging.baseEnd + deltaMin;
        nextEnd = Math.max(isDragging.baseStart + 5, Math.min(24 * 60, nextEnd));
        onUpdate({ ...isDragging, end: nextEnd });
      }
    };
    const handleUp = () => {
      onCommit();
      cleanup();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        cleanup();
      }
    };
    const cleanup = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('keydown', handleKey);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('keydown', handleKey);
    return cleanup;
  }, [isDragging, minPx, onUpdate, onCancel, onCommit]);
  return null;
};

const DateScroller: React.FC<{
  selectedDate: Date
  onDateSelect: (date: Date) => void
}> = ({ selectedDate, onDateSelect }) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [allDates, setAllDates] = useState<Date[]>([])
  
  useEffect(() => {
    const today = new Date()
    today.setHours(0,0,0,0);
    const generatedDates: Date[] = []
    for (let i = -365; i <= 365; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      generatedDates.push(date)
    }
    setAllDates(generatedDates);
  }, []);

  useEffect(() => {
    const selectedItem = scrollerRef.current?.querySelector('.date-item-selected');
    if (selectedItem) {
        selectedItem.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        });
    }
  }, [selectedDate, allDates]);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="-mx-2 sm:-mx-3 px-2 sm:px-3">
      <div
        ref={scrollerRef}
        className="flex items-center gap-2 overflow-x-auto overflow-y-visible py-3 scrollbar-hide px-4 sm:px-6"
      >
      {allDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today);
          return (
    <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
  className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-16 rounded-[18px] relative transition-transform duration-150 ${isSelected ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white shadow-[0_18px_45px_rgba(124,58,237,0.45)] date-item-selected' : 'resend-secondary hover:-translate-y-[2px]'} ${!isSelected ? 'text-slate-100' : ''} ${isToday ? 'date-item-today' : ''}`}
          >
              <span className="text-[10px] uppercase">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-base font-bold">{date.getDate()}</span>
        {isToday && !isSelected && (
          <div className="absolute bottom-1.5 left-3 right-3 h-[3px] rounded-full bg-[rgba(139,92,246,0.55)]"></div>
              )}
          </button>
          )
      })}
      </div>
    </div>
  )
}

const ProjectFilterDropdown: React.FC<{
  projects: Project[];
  selectedProjectId: string | 'all';
  onSelectProject: (projectId: string | 'all') => void;
  className?: string;
}> = ({ projects, selectedProjectId, onSelectProject, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (projects.length === 0) return null;

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full h-9 flex items-center gap-2 px-2.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        <Icon name="folder" className="text-base flex-shrink-0" />
        <span className="truncate flex-1 text-left">{selectedProject ? selectedProject.name : 'All Projects'}</span>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-1.5 w-60 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            <li>
              <button
                onClick={() => { onSelectProject('all'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                All Projects
              </button>
            </li>
            {projects.map(p => (
              <li key={p.id}>
                <button
                  onClick={() => { onSelectProject(p.id); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${selectedProjectId === p.id ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
                  {p.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const CategoryFilterDropdown: React.FC<{
  categories: UserCategory[];
  selectedCategoryId: string | 'all';
  onSelectCategory: (categoryId: string | 'all') => void;
  className?: string;
}> = ({ categories, selectedCategoryId, onSelectCategory, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div ref={dropdownRef} className={`relative ${className || ''}`}>
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full h-9 flex items-center gap-2 px-2.5 rounded-[var(--radius-button)] text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        <Icon name="category" className="text-base flex-shrink-0" />
        <span className="truncate flex-1 text-left">{selectedCategory ? selectedCategory.name : 'All Categories'}</span>
        <ExpandMoreIcon className={`text-base transition-transform transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 top-full mt-1.5 w-60 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-xl border border-gray-300 dark:border-gray-600 overflow-hidden">
          <ul className="max-h-72 overflow-y-auto">
            <li>
              <button
                onClick={() => { onSelectCategory('all'); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                All Categories
              </button>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => { onSelectCategory(c.id); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 truncate ${selectedCategoryId === c.id ? 'font-semibold text-[var(--color-primary-600)]' : ''}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name={c.icon} style={{ color: c.color }} className="text-base" />
                    <span className="truncate">{c.name}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
  const {
    preferences,
    checklists,
    habits,
    events,
    userCategories,
    projects,
    notes,
    projectFiles,
    onToggleSidebar,
    onToggleTask,
    onToggleSingleTaskCompletion,
    onToggleHabitTask,
    onToggleHabitCompletion,
    onSelectView,
    onSelectNote,
    onNewTask,
    onNewHabit,
    onNewEvent,
    onNewEventAt,
    onNewNote,
    onEditItem,
    onUpdateItemPriority,
    recentlyCompletedItemId,
    onCreateTask,
    onAddTaskToHabit,
    completingItemIds,
    modalToClose,
    onModalClosed,
    selectedDate,
    onDateSelect,
    t,
  } = props
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [orderedDailyItems, setOrderedDailyItems] = useState<DailyItemWrapper[]>([]);
  const [eventsForDay, setEventsForDay] = useState<CalendarEvent[]>([]);
  const [eventsSorted, setEventsSorted] = useState<CalendarEvent[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>('all');
  const [priorityModalItem, setPriorityModalItem] = useState<Checklist | Habit | null>(null);
  // Use App-level global search
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  // Category filter
  const [selectedCategoryId, setSelectedCategoryId] = useState<'all' | string>('all');
  // Flash map for completion transitions keyed by item id
  const [flashCompleted, setFlashCompleted] = useState<Record<string, number>>({});
  // Onboarding is now controlled by preferences.onboardingCompleted at App level
  const [mobileTab, setMobileTab] = useState<'events' | 'tasks'>('tasks');

  const formatNoteDate = (isoDate: string) => {
    const noteDate = new Date(isoDate);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Compare dates without time
    noteDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (noteDate.getTime() === today.getTime()) return 'Today';
    if (noteDate.getTime() === yesterday.getTime()) return 'Yesterday';

    return noteDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
    });
  };

  const getContentPreview = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const titleElement = tempDiv.querySelector('h1, h2, h3');
    if (titleElement) {
        titleElement.remove(); // Remove the title so it's not repeated in the preview
    }
    return tempDiv.textContent?.trim().replace(/\s+/g, ' ') || '';
  };

  const noteColors = [
      { bg: 'bg-white', darkBg: 'dark:bg-gray-700/50', border: 'border-blue-400' },
      { bg: 'bg-white', darkBg: 'dark:bg-gray-700/50', border: 'border-green-400' },
      { bg: 'bg-white', darkBg: 'dark:bg-gray-700/50', border: 'border-yellow-400' },
      { bg: 'bg-white', darkBg: 'dark:bg-gray-700/50', border: 'border-pink-400' },
  ];

  const formatDateForHeader = (date: Date) => {
    const today = new Date();
    const isToday = today.toDateString() === date.toDateString();
    if (isToday) return "Today";
    return date.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const selectedISODate = getISODate(selectedDate)
  const emptyStateActionButtonClass = `px-4 py-2 flex items-center gap-1.5 ${emptyStateSecondaryButtonBaseClass}`;

  useEffect(() => {
    if (modalToClose === modalItemId) {
        setModalItemId(null);
        onModalClosed();
    }
  }, [modalToClose, modalItemId, onModalClosed]);
  
  useEffect(() => {
    const categoryMatch = (categoryId?: string) => selectedCategoryId === 'all' || (categoryId && categoryId === selectedCategoryId);
    const projectFilteredChecklists = checklists.filter(c => (selectedProjectId === 'all' || c.projectId === selectedProjectId) && categoryMatch(c.categoryId));
    const projectFilteredHabits = habits.filter(h => (selectedProjectId === 'all' || h.projectId === selectedProjectId) && categoryMatch(h.categoryId));
    const projectFilteredEvents = events.filter(e => (selectedProjectId === 'all' || e.projectId === selectedProjectId) && categoryMatch(e.categoryId as any));

      const tasksForRender = projectFilteredChecklists.filter((task) => {
        if (!isTaskDueOnDate(task, selectedDate)) return false;
        
        if (task.recurrence) return true;
    
        if (task.tasks.length > 0) return true;
        
        return task.completionHistory.length === 0 || task.completionHistory.includes(selectedISODate);
      });

      const habitsForRender = projectFilteredHabits.filter((habit) => isHabitDueOnDate(habit, selectedDate));
      
      const eventsForRender = projectFilteredEvents.filter(event => {
        const eventStartDate = new Date(event.startDate + 'T00:00:00');
        const eventEndDate = event.endDate ? new Date(event.endDate + 'T00:00:00') : eventStartDate;
        const checkDate = new Date(selectedDate);
        checkDate.setHours(0,0,0,0);
        return checkDate >= eventStartDate && checkDate <= eventEndDate;
      });

    const dailyItems: DailyItemWrapper[] = [
      ...tasksForRender.map((task): DailyItemWrapper => ({ item: task, type: 'task' as const, id: task.id })),
      ...habitsForRender.map((habit): DailyItemWrapper => ({ item: habit, type: 'habit' as const, id: habit.id })),
      ...eventsForRender.map((event): DailyItemWrapper => ({ item: event, type: 'event' as const, id: event.id })),
    ];
      
      const isItemCompleted = (itemWrapper: DailyItemWrapper, isoDate: string): boolean => {
        if (itemWrapper.type === 'event') return false; // Events don't have completion status
        const { item } = itemWrapper;
        return (item as Checklist | Habit).completionHistory?.includes(isoDate);
      };

      const sortedItems = [...dailyItems].sort((a, b) => {
            const aIsEvent = a.type === 'event';
            const bIsEvent = b.type === 'event';
            if (aIsEvent && !bIsEvent) return -1;
            if (!aIsEvent && bIsEvent) return 1;

            if(aIsEvent && bIsEvent) {
                const eventA = a.item as CalendarEvent;
                const eventB = b.item as CalendarEvent;
                if(eventA.isAllDay && !eventB.isAllDay) return -1;
                if(!eventA.isAllDay && eventB.isAllDay) return 1;
                const timeA = eventA.startTime || '00:00';
                const timeB = eventB.startTime || '00:00';
                return timeA.localeCompare(timeB);
            }

            const aCompleted = isItemCompleted(a, selectedISODate);
            const bCompleted = isItemCompleted(b, selectedISODate);
            if (aCompleted && !bCompleted) return 1;
            if (!aCompleted && bCompleted) return -1;

            const priorityA = (a.item as Checklist | Habit).priority || 99;
            const priorityB = (b.item as Checklist | Habit).priority || 99;
            if (priorityA !== priorityB) return priorityA - priorityB;

            const timeA = a.type === 'task' ? (a.item as Checklist).dueTime : undefined;
            const timeB = b.type === 'task' ? (b.item as Checklist).dueTime : undefined;
            if (timeA && timeB) return timeA.localeCompare(timeB);
            if (timeA) return -1;
            if (timeB) return 1;

            return (a.item as any).name.localeCompare((b.item as any).name);
      });
      // Detect completion transitions (for flashing)
      const prevCompletion = new Map<string, boolean>();
      orderedDailyItems.forEach(w => {
        const wasCompleted = (w.item as any).completionHistory?.includes(selectedISODate) || false;
        prevCompletion.set(w.id, wasCompleted);
      });

      setOrderedDailyItems(sortedItems);

      // After updating order, check which items just turned fully complete for selected date
      const nextFlash: Record<string, number> = {};
      sortedItems.forEach(w => {
        if (w.type === 'habit') {
          const h = w.item as Habit;
          const total = h.tasks?.length || 0;
          const done = h.tasks?.filter(t => t.completedAt === selectedISODate).length || 0;
          const isNowComplete = total > 0 ? (done === total) : h.completionHistory.includes(selectedISODate);
          const wasComplete = prevCompletion.get(w.id) || false;
          if (isNowComplete && !wasComplete) {
            nextFlash[w.id] = Date.now();
          }
        } else if (w.type === 'task') {
          const c = w.item as Checklist;
          const total = c.tasks?.length || 0;
          const done = c.tasks?.filter(t => t.completedAt && (!c.recurrence || t.completedAt === selectedISODate)).length || 0;
          const isNowComplete = total > 0 ? (done === total) : c.completionHistory.includes(selectedISODate);
          const wasComplete = prevCompletion.get(w.id) || false;
          if (isNowComplete && !wasComplete) {
            nextFlash[w.id] = Date.now();
          }
        }
      });
      if (Object.keys(nextFlash).length) {
        setFlashCompleted(fc => ({ ...fc, ...nextFlash }));
        // auto clear after 900ms
        window.setTimeout(() => {
          setFlashCompleted(fc => {
            const copy = { ...fc };
            Object.keys(nextFlash).forEach(id => delete copy[id]);
            return copy;
          });
        }, 900);
      }
      setEventsForDay(eventsForRender);

  }, [checklists, habits, events, selectedDate, selectedISODate, selectedProjectId, selectedCategoryId]);

  // Recompute and sort events for the selected day; update minutely when viewing today
  useEffect(() => {
    const recompute = () => {
      const now = new Date();
      const isTodayView = isSameDayDate(now, selectedDate);
      const sorted = [...eventsForDay].sort((a, b) => {
        if (!isTodayView) {
          // Static ordering: all-day first, then start time
          if (a.isAllDay && !b.isAllDay) return -1;
          if (!a.isAllDay && b.isAllDay) return 1;
          const ta = a.startTime || '00:00';
          const tb = b.startTime || '00:00';
          return ta.localeCompare(tb);
        }
        // Today: order by live status: live > upcoming > done; within groups, by time
        const sa = getEventStatusForNow(a, now);
        const sb = getEventStatusForNow(b, now);
        const orderVal = (s: EventLiveStatus) => (s === 'live' ? 0 : s === 'upcoming' ? 1 : 2);
        const oa = orderVal(sa);
        const ob = orderVal(sb);
        if (oa !== ob) return oa - ob;
        // If both upcoming: sooner start first
        const aStart = parseEventDateTime(a.startDate, a.startTime) || new Date(`${a.startDate}T00:00:00`);
        const bStart = parseEventDateTime(b.startDate, b.startTime) || new Date(`${b.startDate}T00:00:00`);
        return aStart.getTime() - bStart.getTime();
      });
      setEventsSorted(sorted);
    };
    recompute();
    if (isSameDayDate(new Date(), selectedDate)) {
      const id = window.setInterval(recompute, 60_000);
      return () => window.clearInterval(id);
    }
  }, [eventsForDay, selectedDate]);
  
  const projectFilteredNotes = notes.filter(n => (selectedProjectId === 'all' || n.projectId === selectedProjectId) && (selectedCategoryId === 'all' || n.categoryId === selectedCategoryId));
  
  const recentNotes = [...projectFilteredNotes]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5)
    
  const tasksAndHabits = orderedDailyItems.filter(item => item.type !== 'event');
  const hasTasksOrHabits = tasksAndHabits.length > 0;
  const hasEvents = eventsForDay.length > 0;
  const isEmpty = !hasTasksOrHabits && !hasEvents;
  const isTrulyEmpty = checklists.length === 0 && habits.length === 0 && events.length === 0 && projects.length === 0 && notes.length === 0 && userCategories.length === 0;
  
  const allDailyItems = [...checklists, ...habits];
  const modalItem = modalItemId ? allDailyItems.find(i => i.id === modalItemId) || null : null;
  const modalCategory = modalItem ? userCategories.find(c => c.id === modalItem.categoryId) : undefined;
  const modalProject = modalItem?.projectId ? projects.find(p => p.id === modalItem.projectId) : undefined;
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Modals / overlays */}
      <DashboardItemsModal
        item={modalItem}
        onClose={() => setModalItemId(null)}
        onToggleTask={onToggleTask}
        onToggleHabitTask={onToggleHabitTask}
        onEditRequest={(item) => onEditItem(item)}
        category={modalCategory}
        project={modalProject}
        selectedISODate={selectedISODate}
        onCreateTask={onCreateTask}
        onAddTaskToHabit={onAddTaskToHabit}
      />
      {isCalendarOpen && (
        <MonthlyCalendar
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onClose={() => setIsCalendarOpen(false)}
        />
      )}
      {priorityModalItem && (
        <PriorityModal
          item={priorityModalItem}
            onClose={() => setPriorityModalItem(null)}
            onSave={(newPriority) => {
              const type = 'recurrence' in priorityModalItem ? 'habit' : 'task';
              onUpdateItemPriority(priorityModalItem.id, newPriority, type);
            }}
        />
      )}
      {isOnboardingOpen && <OnboardingModal isOpen={isOnboardingOpen} onClose={() => setOnboardingOpen(false)} />}
      {/* Global search rendered at App root */}

      {/* Sticky header */}
      <div className="sticky top-0 z-30">
        <Header
          title={formatDateForHeader(selectedDate)}
          onToggleSidebar={onToggleSidebar}
        >
          <div className="hidden md:flex items-center gap-2">
            <ProjectFilterDropdown
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          </div>
          <div className="flex items-center gap-2">
            {/* Search first, then calendar, then help; equal gaps */}
            <button
              onClick={() => window.dispatchEvent(new Event('taskly.openSearch'))}
              className="w-10 h-10 rounded-[var(--radius-button)] resend-secondary flex items-center justify-center transition-transform duration-150 hover:-translate-y-[1px]"
              aria-label="Search"
              title="Search (⌘/Ctrl+K)"
            ><SearchIcon /></button>
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="w-10 h-10 rounded-[var(--radius-button)] resend-secondary flex items-center justify-center transition-transform duration-150 hover:-translate-y-[1px]"
              aria-label="Open calendar"
              title="Open calendar"
            ><CalendarTodayIcon /></button>
            <button
              onClick={() => setOnboardingOpen(true)}
              className="w-10 h-10 rounded-[var(--radius-button)] resend-secondary flex items-center justify-center transition-transform duration-150 hover:-translate-y-[1px]"
              aria-label="Help"
              title="Help & Tips"
            ><HelpOutlineIcon /></button>
          </div>
        </Header>
        {/* Divider removed per design: keep header flush with content */}
      </div>

      <main className="flex-1 px-4 sm:px-6 text-gray-800 dark:text-white overflow-y-auto md:overflow-hidden min-h-0">
        <div className="flex flex-col h-full min-h-0">
          {/* Full-width date scroller row */}
          <div className="md:sticky md:top-0 z-20 pt-1.5 pb-2 md:pb-0">
            <DateScroller selectedDate={selectedDate} onDateSelect={onDateSelect} />
            <div className="flex items-center gap-2 mt-2">
              <div className="md:hidden flex items-center gap-1 p-1 rounded-[var(--radius-button)] resend-secondary shadow-md">
                <button
                  onClick={() => setMobileTab('tasks')}
                  className={`px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-semibold transition-colors ${mobileTab === 'tasks' ? 'bg-white/20 text-white shadow-inner' : 'text-gray-300 hover:bg-white/10'}`}
                >Tasks & Habits</button>
                <button
                  onClick={() => setMobileTab('events')}
                  className={`px-3 py-1.5 rounded-[var(--radius-button)] text-xs font-semibold transition-colors ${mobileTab === 'events' ? 'bg-white/20 text-white shadow-inner' : 'text-gray-300 hover:bg-white/10'}`}
                >Agenda</button>
              </div>
              <div className="flex md:hidden items-center gap-2 ml-auto">
                <button onClick={() => onNewTask(selectedISODate)} className="w-10 h-10 flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px] shadow-md" aria-label="New Task" title="New Task"><NewTaskIcon /></button>
                <button onClick={() => onNewEvent(selectedISODate)} className="w-10 h-10 flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px] shadow-md" aria-label="New Event" title="New Event"><CalendarAddOnIcon /></button>
                <button onClick={onNewHabit} className="w-10 h-10 flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px] shadow-md" aria-label="New Habit" title="New Habit"><NewHabitIcon /></button>
              </div>
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 min-h-0 mt-1 md:mt-0 flex flex-col">
            {(isTrulyEmpty || isEmpty) ? (
              <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center min-h-[50vh]">
                {isTrulyEmpty ? (
                  <>
                    <EmptyStateIcon icon={<TodayIcon />} size="lg" />
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('dashboard_empty_title')}</h2>
                    <p className="max-w-md mt-1 mb-6">{t('dashboard_empty_subtitle')}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                      <button onClick={() => onNewTask(selectedISODate)} className={emptyStateActionButtonClass}><NewTaskIcon /> <span>New Task</span></button>
                      <button onClick={() => onNewEvent(selectedISODate)} className={emptyStateActionButtonClass}><CalendarAddOnIcon /> <span>New Event</span></button>
                      <button onClick={onNewHabit} className={emptyStateActionButtonClass}><NewHabitIcon /> <span>New Habit</span></button>
                    </div>
                  </>
                ) : (
                  <>
                    <EmptyStateIcon icon={<CheckCircleIcon />} size="lg" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Organize your day</h3>
                    <p className="max-w-md text-sm mb-5">You have no tasks, habits, or events for this date. Add what matters and get going.</p>
                    <div className="flex gap-3 flex-wrap items-center justify-center">
                      <button onClick={() => onNewTask(selectedISODate)} className={emptyStateActionButtonClass}><NewTaskIcon /> <span>New Task</span></button>
                      <button onClick={() => onNewEvent(selectedISODate)} className={emptyStateActionButtonClass}><CalendarAddOnIcon /> <span>New Event</span></button>
                      <button onClick={onNewHabit} className={emptyStateActionButtonClass}><NewHabitIcon /> <span>New Habit</span></button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                {/* Mobile stacked view */}
                <div className="md:hidden mt-2 space-y-2">
                  {mobileTab === 'events' ? (
                    <div className="overflow-hidden rounded-xl resend-glass-panel border border-transparent flex flex-col h-[65vh] mb-12 scroll-fade" data-elevated={true}>
                      <DayEventsTimeline
                        events={eventsForDay}
                        projects={projects}
                        selectedDate={selectedDate}
                        onEditItem={onEditItem}
                        onNewEventAt={onNewEventAt}
                      />
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl resend-glass-panel border border-transparent flex flex-col h-[65vh] mb-12 scroll-fade" data-elevated={true}>
                      <div className="p-2 space-y-2 overflow-y-auto min-h-0 flex-1 pt-1">
                        {tasksAndHabits.length === 0 && (
                          <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-gray-400 dark:text-gray-500">No tasks or habits for this day.</p>
                          </div>
                        )}
                        {tasksAndHabits.map(itemWrapper => {
                          const { item, type } = itemWrapper;
                          const typedItem = item as Checklist | Habit;
                          const category = typedItem.categoryId ? userCategories.find(c => c.id === typedItem.categoryId) : undefined;
                          const project = 'projectId' in typedItem && typedItem.projectId ? projects.find(p => p.id === typedItem.projectId) : undefined;
                          const isRecentlyCompleted = recentlyCompletedItemId === item.id;
                          const isCompleted = typedItem.completionHistory?.includes(selectedISODate);
                          const isCompleting = completingItemIds.has(item.id);
                          if (isCompleting && isCompleted) return null;
                          return (
                            <div key={item.id}>
                              {type === 'task' ? (
                                (item as Checklist).tasks.length === 0 ? (
                                  <DashboardSingleTask
                                    task={item as Checklist}
                                    category={category}
                                    onToggleCompletion={() => onToggleSingleTaskCompletion(item.id, selectedISODate)}
                                    onEdit={() => onEditItem(item)}
                                    onOpenModal={() => setModalItemId(item.id)}
                                    isCompleted={!!isCompleted}
                                    isRecentlyCompleted={isRecentlyCompleted}
                                    onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)}
                                    isCompleting={isCompleting}
                                  />
                                ) : (
                                  <DashboardMultiTaskList
                                    list={item as Checklist}
                                    category={category}
                                    project={project}
                                    onOpenModal={(list) => setModalItemId(list.id)}
                                    onEdit={() => onEditItem(item)}
                                    selectedDate={selectedDate}
                                    isRecentlyCompleted={isRecentlyCompleted}
                                    onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)}
                                    isCompleting={isCompleting}
                                    isFlashing={!!flashCompleted[item.id]}
                                  />
                                )
                              ) : (
                                <DashboardHabitCard
                                  habit={item as Habit}
                                  category={category}
                                  project={project}
                                  selectedDate={selectedDate}
                                  onToggleHabitCompletion={onToggleHabitCompletion}
                                  onOpenSubtaskModal={(habit) => setModalItemId(habit.id)}
                                  onEdit={() => onEditItem(item)}
                                  isRecentlyCompleted={isRecentlyCompleted}
                                  onOpenPriorityModal={() => setPriorityModalItem(item as Habit)}
                                  isCompleting={isCompleting}
                                  isFlashing={!!flashCompleted[item.id]}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop layout: md = two columns (Tasks/Agenda) + bottom Notes; lg+ = two flexible columns + fixed 120px Notes */}
                <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_160px] md:gap-4 lg:gap-6 flex-1 min-h-0 mt-0 pb-6">
                  {/* Column 1: Tasks & Habits */}
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">Tasks & Habits</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onNewTask(selectedISODate)} className="w-10 h-10 hidden md:flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px]" aria-label="New Task" title="New Task"><NewTaskIcon /></button>
                        <button onClick={onNewHabit} className="w-10 h-10 hidden md:flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px]" aria-label="New Habit" title="New Habit"><NewHabitIcon /></button>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl resend-glass-panel border border-transparent flex flex-col min-h-0 flex-1 scroll-fade" data-elevated={true}>
                      {(() => {
                        return (
                          <div className={`px-2 pb-2 pt-1 space-y-2 overflow-y-auto min-h-0 flex-1`}>
                            {tasksAndHabits.length === 0 && (
                              <div className="flex items-center justify-center py-10">
                                <p className="text-sm text-gray-400 dark:text-gray-500">No tasks or habits for this day.</p>
                              </div>
                            )}
                            {tasksAndHabits.map(itemWrapper => {
                              const { item, type } = itemWrapper;
                              const typedItem = item as Checklist | Habit;
                              const category = typedItem.categoryId ? userCategories.find(c => c.id === typedItem.categoryId) : undefined;
                              const project = 'projectId' in typedItem && typedItem.projectId ? projects.find(p => p.id === typedItem.projectId) : undefined;
                              const isRecentlyCompleted = recentlyCompletedItemId === item.id;
                              const isCompleted = typedItem.completionHistory?.includes(selectedISODate);
                              const isCompleting = completingItemIds.has(item.id);
                              if (isCompleting && isCompleted) return null;
                              return (
                                <div key={item.id}>
                                  {type === 'task' ? (
                                    (item as Checklist).tasks.length === 0 ? (
                                      <DashboardSingleTask
                                        task={item as Checklist}
                                        category={category}
                                        onToggleCompletion={() => onToggleSingleTaskCompletion(item.id, selectedISODate)}
                                        onEdit={() => onEditItem(item)}
                                        onOpenModal={() => setModalItemId(item.id)}
                                        isCompleted={!!isCompleted}
                                        isRecentlyCompleted={isRecentlyCompleted}
                                        onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)}
                                        isCompleting={isCompleting}
                                      />
                                    ) : (
                                      <DashboardMultiTaskList
                                        list={item as Checklist}
                                        category={category}
                                        project={project}
                                        onOpenModal={(list) => setModalItemId(list.id)}
                                        onEdit={() => onEditItem(item)}
                                        selectedDate={selectedDate}
                                        isRecentlyCompleted={isRecentlyCompleted}
                                        onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)}
                                        isCompleting={isCompleting}
                                        isFlashing={!!flashCompleted[item.id]}
                                      />
                                    )
                                  ) : (
                                    <DashboardHabitCard
                                      habit={item as Habit}
                                      category={category}
                                      project={project}
                                      selectedDate={selectedDate}
                                      onToggleHabitCompletion={onToggleHabitCompletion}
                                      onOpenSubtaskModal={(habit) => setModalItemId(habit.id)}
                                      onEdit={() => onEditItem(item)}
                                      isRecentlyCompleted={isRecentlyCompleted}
                                      onOpenPriorityModal={() => setPriorityModalItem(item as Habit)}
                                      isCompleting={isCompleting}
                                      isFlashing={!!flashCompleted[item.id]}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Column 2: Agenda / Events */}
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">Agenda</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => onNewEvent(selectedISODate)} className="w-10 h-10 hidden md:flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px]" aria-label="New Event" title="New Event"><CalendarAddOnIcon /></button>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl resend-glass-panel border border-transparent flex flex-col min-h-0 flex-1 scroll-fade" data-elevated={true}>
                      <div className="flex-1 min-h-0 h-full">
                        <DayEventsTimeline
                          events={eventsForDay}
                          projects={projects}
                          selectedDate={selectedDate}
                          onEditItem={onEditItem}
                          onNewEventAt={onNewEventAt}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Recent Notes (lg+: right fixed column; md: bottom row, horizontal scroll) */}
                  <div className="flex flex-col min-h-0 md:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-start-1">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <h3 className="text-base font-semibold text-gray-800 dark:text-white">{t('recent_notes')}</h3>
                      <button onClick={() => onNewNote({})} className="w-10 h-10 flex items-center justify-center resend-secondary rounded-[var(--radius-button)] transition-transform duration-150 hover:-translate-y-[1px]" aria-label="New Note" title="New Note"><NoteAddIcon /></button>
                    </div>
                    {/* md: horizontal scroll; lg+: vertical list in fixed 120px column */}
                    <div className="min-h-0 flex-1 md:flex md:flex-row md:space-x-3 md:overflow-x-auto md:space-y-0 md:pb-1 lg:flex-col lg:space-x-0 lg:space-y-3 lg:overflow-y-auto">
                      {recentNotes.map((note, index) => {
                        const color = noteColors[index % noteColors.length];
                        const formattedDate = formatNoteDate(note.lastModified);
                        const contentPreview = getContentPreview(note.content);
                        return (
                          <button
                            key={note.id}
                            onClick={() => onSelectNote(note.id)}
                            className={`md:min-w-[220px] lg:min-w-0 w-full text-left p-3 rounded-[12px] shadow-sm flex flex-col transition-all hover:shadow-md border border-gray-200 dark:border-gray-700/50 border-l-4 ${color.bg} ${color.darkBg} ${color.border}`}
                          >
                            <h4 className="font-semibold text-gray-800 dark:text-white truncate">{note.name}</h4>
                            <div className="mt-1">
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug truncate">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{formattedDate}</span>
                                <span className="mx-1">—</span>
                                <span className="align-baseline">{contentPreview}</span>
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug line-clamp-1">{contentPreview}</p>
                            </div>
                          </button>
                        );
                      })}
                      {notes.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-2 italic">No notes yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;