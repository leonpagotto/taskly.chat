import React, { useState, useEffect, useRef } from 'react'
import {
  Task,
  Habit,
  UserCategory,
  Checklist,
  AppView,
  UserPreferences,
  Project,
  Note,
  RecurrenceRule,
  SearchableItem,
  Event,
  ProjectFile,
} from '../types'
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


const Icon: React.FC<{
  name: string
  className?: string
  style?: React.CSSProperties
}> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>
    {name}
  </span>
)

const OnboardingModal: React.FC<{onClose: () => void}> = ({onClose}) => {
    const [step, setStep] = useState(0);
    const steps = [
        {
            icon: <DragPanIcon className="text-5xl text-blue-400" />,
            title: "Reorder with Drag & Drop",
            description: "To move an activity up or down the list, press and hold its icon until you can drag it to a new position."
        },
        {
            icon: <CheckCircleIcon className="text-5xl text-green-400" />,
            title: "Complete with a Click",
            description: "Click on any item in the to-do list to mark it as complete or to update its state."
        },
        {
            icon: <SwipeIcon className="text-5xl text-purple-400" />,
            title: "Swipe for More Actions",
            description: "Swipe right to adjust the priority of an item. Swipe left to edit the activity."
        },
        {
            icon: <MicIcon className="text-5xl text-red-400" />,
      title: "Use AI Commands",
      description: "Tap the chat button. Try: ‘Create an event tomorrow 9am Standup’, ‘Add a habit Drink water’, or ‘Make a shopping list with milk, eggs, bread’."
        }
    ];

    const currentStep = steps[step];

    return (
    <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    {currentStep.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2">{currentStep.title}</h2>
                <p className="text-gray-400 mb-6 min-h-[72px]">{currentStep.description}</p>
                <div className="flex justify-center items-center gap-2 mb-6">
                    {steps.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === step ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
                    ))}
                </div>
                <div className="flex items-center gap-4">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="px-6 py-2 rounded-[var(--radius-button)] bg-gray-600 hover:bg-gray-500 font-semibold transition-colors disabled:opacity-50 flex-1">
                        Back
                    </button>
                    {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} className="px-6 py-2 rounded-[var(--radius-button)] bg-blue-600 hover:bg-blue-500 font-semibold transition-colors flex-1">
                            Next
                        </button>
                    ) : (
      <button onClick={onClose} className="px-6 py-2 rounded-[var(--radius-button)] bg-green-600 hover:bg-green-500 font-semibold transition-colors flex-1">
                            Got it!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const SearchModal: React.FC<{
    onClose: () => void;
    checklists: Checklist[];
    habits: Habit[];
    notes: Note[];
    projects: Project[];
    events: Event[];
    projectFiles: ProjectFile[];
    userCategories: UserCategory[];
    onSelectNote: (noteId: string) => void;
    onSelectProject: (projectId: string) => void;
    onSelectView: (view: AppView) => void;
}> = ({ onClose, checklists, habits, notes, projects, events, projectFiles, userCategories, onSelectNote, onSelectProject, onSelectView }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchableItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        
        const searchChecklists = checklists
            .filter(c => c.name.toLowerCase().includes(lowerQuery))
            .map(c => ({ ...c, itemType: 'task' as const }));
            
        const searchHabits = habits
            .filter(h => h.name.toLowerCase().includes(lowerQuery))
            .map(h => ({ ...h, itemType: 'habit' as const }));

        const searchNotes = notes
            .filter(n => n.name.toLowerCase().includes(lowerQuery) || n.content.toLowerCase().includes(lowerQuery))
            .map(n => ({ ...n, itemType: 'note' as const }));

        const searchProjects = projects
            .filter(p => p.name.toLowerCase().includes(lowerQuery) || p.description.toLowerCase().includes(lowerQuery))
            .map(p => ({ ...p, itemType: 'project' as const }));
        
        const searchEvents = events
            .filter(e => e.title.toLowerCase().includes(lowerQuery) || (e.description && e.description.toLowerCase().includes(lowerQuery)))
            .map(e => ({ ...e, itemType: 'event' as const }));

        const searchFiles = projectFiles
            .filter(f => f.name.toLowerCase().includes(lowerQuery))
            .map(f => ({ ...f, itemType: 'file' as const }));

        setResults([...searchProjects, ...searchChecklists, ...searchHabits, ...searchNotes, ...searchEvents, ...searchFiles]);
    }, [query, checklists, habits, notes, projects, events, projectFiles]);

    const handleSelect = (item: SearchableItem) => {
        onClose();
        switch (item.itemType) {
            case 'note': onSelectNote(item.id); break;
            case 'project': onSelectProject(item.id); break;
            case 'task': onSelectView('lists'); break;
            case 'habit': onSelectView('habits'); break;
            case 'event': onSelectView('calendar'); break;
            case 'file': onSelectView('files'); break;
        }
    };
    
    const ResultItem: React.FC<{item: SearchableItem}> = ({item}) => {
        let icon: React.ReactNode;
        let title: string;
        let subtitle: string | undefined;

        switch(item.itemType){
            case 'project':
                const project = item as Project;
                const category = userCategories.find(c => c.id === project.categoryId);
                const iconName = project.icon || category?.icon || 'folder';
                const color = project.color || category?.color;
                icon = <Icon name={iconName} className="text-xl" style={{color: color}}/>;
                subtitle = "Project";
                title = item.name;
                break;
            case 'task':
                icon = <ListAltIcon className="text-xl text-blue-400" />;
                subtitle = "Task/List";
                title = item.name;
                break;
            case 'habit':
                icon = <AutorenewIcon className="text-xl text-green-400" />;
                subtitle = "Habit";
                title = item.name;
                break;
            case 'note':
                icon = <DescriptionIcon className="text-xl text-yellow-400" />;
                subtitle = "Note";
                title = item.name;
                break;
            case 'event':
                icon = <EventNoteIcon className="text-xl text-indigo-400" />;
                subtitle = "Event";
                title = item.title;
                break;
            case 'file':
                icon = <FilePresentIcon className="text-xl text-purple-400" />;
                subtitle = "File";
                title = item.name;
                break;
        }
        return (
            <button onClick={() => handleSelect(item)} className="w-full text-left p-3 flex items-center gap-4 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{title}</p>
                    <p className="text-sm text-gray-400">{subtitle}</p>
                </div>
            </button>
        )
    };

    return (
        <div className="fixed inset-0 bg-gray-900/80 z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl mx-auto max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 flex items-center gap-3 border-b border-gray-700">
                    <SearchIcon className="text-2xl text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search for tasks, events, notes, projects..."
                        className="w-full bg-transparent text-lg placeholder:text-gray-500 focus:outline-none"
                    />
          <button onClick={onClose} className="p-2 rounded-[var(--radius-button)] hover:bg-gray-700"><CloseIcon /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {results.length > 0 ? (
                        <ul>{results.map(item => <li key={`${item.itemType}-${item.id}`}><ResultItem item={item} /></li>)}</ul>
                    ) : (
                        <p className="text-center text-gray-500 p-8">{query.length > 1 ? "No results found." : "Start typing to search."}</p>
                    )}
                </div>
            </div>
        </div>
    );
}


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
  events: Event[]
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
  onEditItem: (item: Checklist | Habit | Event) => void;
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
  onLoadSampleData: () => void;
}

interface DailyItemWrapper {
  item: Checklist | Habit | Event;
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

const getEventStatusForNow = (event: Event, now: Date): EventLiveStatus => {
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
    <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
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
                  ${isSelected ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white' : ''}
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
    </div>
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
        <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
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

  return (
    <div className="fixed inset-0 bg-gray-900/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-sm md:max-w-4xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex items-center justify-between border-b border-gray-700/50 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-semibold truncate">{item.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
        </header>

        <div className="flex-1 md:flex md:flex-row min-h-0">
          {/* Left Column - Details */}
          <div className="p-6 md:w-2/5 md:border-r border-gray-700/50 space-y-6 overflow-y-auto">
            <DetailItem icon="category" label="Category">
              {category ? (
                <div className="flex items-center gap-2">
                  <Icon name={category.icon} style={{ color: category.color }} className="text-lg" />
                  <span>{category.name}</span>
                </div>
              ) : <span className="text-gray-500">No category</span>}
            </DetailItem>

            <DetailItem icon="folder" label="Project">
              {project ? <span>{project.name}</span> : <span className="text-gray-500">Not in a project</span>}
            </DetailItem>

            {!isHabit && (item as Checklist).dueDate && (
              <DetailItem icon="calendar_today" label="Due Date">
                <span>{new Date((item as Checklist).dueDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </DetailItem>
            )}

            {item.recurrence && (
              <DetailItem icon="autorenew" label="Repeats">
                <span>{getRecurrenceText(item.recurrence)}</span>
              </DetailItem>
            )}
            
            <button
              onClick={() => { onEditRequest(item); onClose(); }}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <EditIcon className="text-base"/> Edit Details
            </button>
          </div>

          {/* Right Column - Checklist */}
          <div className="flex flex-col md:w-3/5">
            <main className="p-6 overflow-y-auto space-y-2 flex-1">
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
                <p className="text-center text-gray-500 py-8">No sub-items in this list.</p>
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
      </div>
    </div>
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
  task: Checklist
  category?: UserCategory
  onToggleCompletion: () => void;
  onEdit: () => void;
  isCompleted: boolean;
  isRecentlyCompleted: boolean;
  onOpenPriorityModal: () => void;
  isCompleting: boolean;
}> = ({ task, category, onToggleCompletion, onEdit, isCompleted, isRecentlyCompleted, onOpenPriorityModal, isCompleting }) => {
    const { itemRef, touchHandlers, translation, isSwiping } = useSwipeAndHold(onEdit, onOpenPriorityModal);

    const handleClick = () => {
        if (!isSwiping) onToggleCompletion();
    };

    return (
        <div className={`relative overflow-hidden rounded-lg ${isCompleting ? 'animate-slide-out-down' : ''}`} {...touchHandlers}>
            <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6" style={{ opacity: Math.max(0, -translation / 60), zIndex: 1 }}>
                <EditIcon className="text-white text-2xl" />
            </div>
            <div className="absolute inset-0 bg-purple-500 flex items-center justify-end px-6" style={{ opacity: Math.max(0, translation / 60), zIndex: 1 }}>
                <Icon name="flag" className="text-white text-2xl" />
            </div>
            <div
                ref={itemRef}
                style={{ transform: `translateX(${translation}px)` }}
                className="relative z-10"
            >
                <div onClick={handleClick} className={`flex items-center justify-between p-2.5 rounded-lg transition-all group hover:bg-gray-200 dark:hover:bg-gray-700/50 relative overflow-hidden cursor-pointer min-h-[56px] ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}>
                    <div className="flex items-center min-w-0 flex-1 gap-3">
                        
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
                                        <span className={`truncate ${isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {task.name}
                                        </span>
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 md:hidden" aria-label={`Edit ${task.name}`}>
                                            <EditIcon className="text-base"/>
                                        </button>
                                    </div>
                                    {task.dueTime && <span className="ml-2 text-xs font-mono bg-gray-200 dark:bg-gray-700/80 px-1.5 py-0.5 rounded flex-shrink-0">{task.dueTime}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
          <div className="flex items-center ml-3 flex-shrink-0">
            <div className="w-8 h-8 flex items-center justify-center" aria-label={`Toggle ${task.name}`}>
              {isCompleted ? <HabitCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-400 dark:text-gray-400" />}
            </div>
          </div>
                </div>
            </div>
        </div>
    );
};


const DashboardMultiTaskList: React.FC<{
  list: Checklist
  category?: UserCategory
  onOpenModal: (list: Checklist) => void
  onEdit: () => void
  selectedDate: Date
  isRecentlyCompleted: boolean;
  onOpenPriorityModal: () => void;
  isCompleting: boolean;
}> = ({ list, category, onOpenModal, onEdit, selectedDate, isRecentlyCompleted, onOpenPriorityModal, isCompleting }) => {
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
  
  const isCompletedForDate = list.completionHistory.includes(selectedISODate);
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : (isCompletedForDate ? 100 : 0);

  const handleClick = () => {
    if (!isSwiping) onOpenModal(list);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${isCompleting ? 'animate-slide-out-down' : ''}`} {...touchHandlers}>
        <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6" style={{ opacity: Math.max(0, -translation / 60), zIndex: 1 }}><EditIcon className="text-white text-2xl" /></div>
        <div className="absolute inset-0 bg-purple-500 flex items-center justify-end px-6" style={{ opacity: Math.max(0, translation / 60), zIndex: 1 }}><Icon name="flag" className="text-white text-2xl" /></div>
        <div ref={itemRef} style={{ transform: `translateX(${translation}px)` }} className="relative z-10">
            <div onClick={handleClick} className={`p-2.5 rounded-lg transition-colors group hover:bg-gray-200 dark:hover:bg-gray-700/50 relative overflow-hidden cursor-pointer min-h-[56px] ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}>
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
                              <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 md:hidden" aria-label={`Edit ${list.name}`}>
                                <EditIcon className="text-base"/>
                              </button>
                            </div>
                            {list.dueTime && <span className="ml-2 text-xs font-mono bg-gray-200 dark:bg-gray-700/80 px-1.5 py-0.5 rounded flex-shrink-0">{list.dueTime}</span>}
                        </div>
                        {/* Progress moved to the right side */}
                      </div>
                    </div>
                </div>
        <div className="flex items-center ml-3 gap-2 flex-shrink-0">
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200">{completedTasks}/{totalTasks}</span>
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
  selectedDate: Date
  onToggleHabitCompletion: (habitId: string, date: string) => void
  onOpenSubtaskModal: (habit: Habit) => void
  onEdit: () => void
  isRecentlyCompleted: boolean;
  onOpenPriorityModal: () => void;
  isCompleting: boolean;
}> = ({ habit, category, selectedDate, onToggleHabitCompletion, onOpenSubtaskModal, onEdit, isRecentlyCompleted, onOpenPriorityModal, isCompleting }) => {
  const selectedISODate = getISODate(selectedDate)
  const isCompletedOnSelectedDate = habit.completionHistory.includes(selectedISODate)
  const isSingleCheckOff = habit.type === 'daily_check_off';
  const { itemRef, touchHandlers, translation, isSwiping } = useSwipeAndHold(onEdit, onOpenPriorityModal);

  const totalTasks = habit.tasks?.length || 0
  const completedTasks = habit.tasks?.filter(t => t.completedAt === selectedISODate).length || 0;
  
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : isCompletedOnSelectedDate ? 100 : 0

  const handleClick = () => {
    if (!isSwiping) {
        isSingleCheckOff ? onToggleHabitCompletion(habit.id, selectedISODate) : onOpenSubtaskModal(habit);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${isCompleting ? 'animate-slide-out-down' : ''}`} {...touchHandlers}>
        <div className="absolute inset-0 bg-green-500 flex items-center justify-start px-6" style={{ opacity: Math.max(0, -translation / 60), zIndex: 1 }}><EditIcon className="text-white text-2xl" /></div>
        <div className="absolute inset-0 bg-purple-500 flex items-center justify-end px-6" style={{ opacity: Math.max(0, translation / 60), zIndex: 1 }}><Icon name="flag" className="text-white text-2xl" /></div>
        <div ref={itemRef} style={{ transform: `translateX(${translation}px)` }} className="relative z-10">
            <div onClick={handleClick} className={`p-2.5 rounded-lg transition-colors group hover:bg-gray-200 dark:hover:bg-gray-700/50 relative overflow-hidden cursor-pointer min-h-[56px] ${isRecentlyCompleted ? 'animate-check-reveal' : ''}`}>
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
                          <p className={`font-medium truncate ${isCompletedOnSelectedDate ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>{habit.name}</p>
                          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 md:hidden" aria-label={`Edit ${habit.name}`}>
                            <EditIcon className="text-base"/>
                          </button>
                        </div>
                        {/* Progress moved to the right side */}
                      </div>
                    </div>
                </div>
        <div className="flex items-center ml-3 gap-2 flex-shrink-0">
          {habit.type === 'checklist' && totalTasks > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono bg-gray-200 dark:bg-gray-700/80 text-gray-800 dark:text-gray-200">{completedTasks}/{totalTasks}</span>
          )}
                    <div className="w-8 h-8 flex items-center justify-center">
                        {isCompletedOnSelectedDate ? <HabitCheckCircle /> : <RadioButtonUncheckedIcon className="text-2xl text-gray-400 dark:text-gray-400" />}
                    </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  )
}

const DashboardEventCard: React.FC<{
  event: Event;
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
    <div onClick={onEdit} className={`relative overflow-hidden rounded-lg transition-all group hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer min-h-[56px] ${isDone ? 'opacity-60' : ''}`}>
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
  events: Event[];
  projects: Project[];
  selectedDate: Date;
  onEditItem: (ev: Event) => void;
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
  type TimedItem = { ev: Event; start: number; end: number; col?: number; cols?: number };
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
    <div ref={containerRef} className="p-2 overflow-y-auto min-h-0 h-full" style={{ maxHeight: '100%' }}>
      {/* Sticky tiny controls */}
      <div className="sticky top-0 z-10 flex justify-end items-center p-1 bg-gradient-to-b from-gray-100/95 dark:from-gray-800/95 to-transparent rounded-t-xl">
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
      {/* All-day row */}
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
      <div className="grid grid-cols-[48px_1fr] gap-2">
        {/* Hour labels */}
        <div className="relative" style={{ height: hourPx * 24 }}>
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="absolute left-0 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400 pr-1" style={{ top: h * hourPx }}>
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

          {/* Now marker */}
          {isToday && (() => {
            const now = new Date();
            const minutes = now.getHours() * 60 + now.getMinutes();
            const top = minutes * MIN_PX;
            return (
              <div className="absolute left-0 right-0" style={{ top }}>
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--color-primary-600)]" />
                <div className="h-0.5 bg-[var(--color-primary-600)] opacity-70" />
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
                className={`event-card absolute rounded-lg overflow-hidden cursor-pointer group hover:bg-gray-200/70 dark:hover:bg-gray-700/50 ${isDone ? 'opacity-60' : ''}`}
                style={{
                  top: dragTop,
                  height: dragHeight,
                  left: `calc(${leftPct}% + ${col * (gapX / 2)}px)`,
                  width: `calc(${widthPct}% - ${gapX}px)`,
                  background: 'transparent',
                }}
              >
                {/* Card background */}
                <div className="w-full h-full bg-white/90 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/60 backdrop-blur-sm">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: project?.color || 'var(--color-primary-600)' }} />
                  <div className="h-full flex items-start justify-between gap-2 px-2.5 py-1">
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
            const updated: Event = {
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
    <div
      ref={scrollerRef}
      className="flex items-center space-x-2 overflow-x-auto pb-2.5 scrollbar-hide px-4 sm:px-6"
    >
      {allDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate)
          const isToday = isSameDay(date, today);
          return (
          <button
              key={date.toISOString()}
              onClick={() => onDateSelect(date)}
              className={`flex-shrink-0 flex flex-col items-center justify-center w-11 h-14 rounded-2xl transition-colors relative shadow-md
              ${isSelected ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white date-item-selected' : 'bg-gray-200 dark:bg-gray-700/50 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'}
              ${isToday ? 'date-item-today' : ''}
              `}
          >
              <span className="text-[10px] uppercase">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-base font-bold">{date.getDate()}</span>
              {isToday && !isSelected && (
                  <div className="absolute bottom-1.5 left-3 right-3 h-[3px] bg-[var(--color-primary-700)] rounded-full"></div>
              )}
          </button>
          )
      })}
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
        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-colors bg-gray-200 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
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
  const [eventsForDay, setEventsForDay] = useState<Event[]>([]);
  const [eventsSorted, setEventsSorted] = useState<Event[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<'all' | string>('all');
  const [priorityModalItem, setPriorityModalItem] = useState<Checklist | Habit | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  // First-run onboarding
  useEffect(() => {
    try {
      const seen = localStorage.getItem('onboarding.seen');
      if (!seen) {
        setOnboardingOpen(true);
        localStorage.setItem('onboarding.seen', 'true');
      }
    } catch {}
  }, []);
  const [mobileTab, setMobileTab] = useState<'events' | 'tasks'>('events');

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

  useEffect(() => {
    if (modalToClose === modalItemId) {
        setModalItemId(null);
        onModalClosed();
    }
  }, [modalToClose, modalItemId, onModalClosed]);
  
  useEffect(() => {
      const projectFilteredChecklists = checklists.filter(c => selectedProjectId === 'all' || c.projectId === selectedProjectId);
      const projectFilteredHabits = habits.filter(h => selectedProjectId === 'all' || h.projectId === selectedProjectId);
      const projectFilteredEvents = events.filter(e => selectedProjectId === 'all' || e.projectId === selectedProjectId);

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
                const eventA = a.item as Event;
                const eventB = b.item as Event;
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
      setOrderedDailyItems(sortedItems);
      setEventsForDay(eventsForRender);

  }, [checklists, habits, events, selectedDate, selectedISODate, selectedProjectId]);

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
  
  const projectFilteredNotes = notes.filter(n => selectedProjectId === 'all' || n.projectId === selectedProjectId);
  
  const recentNotes = [...projectFilteredNotes]
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 5)
    
  const hasTasksOrHabits = orderedDailyItems.length > 0;
  const hasEvents = eventsForDay.length > 0;
  const isEmpty = !hasTasksOrHabits && !hasEvents;
  const isTrulyEmpty = checklists.length === 0 && habits.length === 0 && events.length === 0 && projects.length === 0 && notes.length === 0 && userCategories.length === 0;
  
  const allDailyItems = [...checklists, ...habits];
  const modalItem = modalItemId ? allDailyItems.find(i => i.id === modalItemId) || null : null;
  const modalCategory = modalItem ? userCategories.find(c => c.id === modalItem.categoryId) : undefined;
  const modalProject = modalItem?.projectId ? projects.find(p => p.id === modalItem.projectId) : undefined;
  
  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 h-full">
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
        {isOnboardingOpen && <OnboardingModal onClose={() => setOnboardingOpen(false)} />}
        {isSearchOpen && <SearchModal 
            onClose={() => setIsSearchOpen(false)} 
            checklists={checklists}
            habits={habits}
            notes={notes}
            projects={projects}
            events={events}
            projectFiles={projectFiles}
            userCategories={userCategories}
            onSelectNote={onSelectNote}
            onSelectProject={props.onSelectProject}
            onSelectView={onSelectView}
        />}

    <div className="sticky top-0 z-30 bg-gray-100 dark:bg-gray-800">
      <Header
        title={formatDateForHeader(selectedDate)}
        onToggleSidebar={onToggleSidebar}
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center" aria-label="Search" title="Search"><SearchIcon /></button>
          <button onClick={() => setIsCalendarOpen(true)} className="w-10 h-10 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center" aria-label="Open calendar" title="Open calendar"><CalendarTodayIcon /></button>
          <button onClick={() => setOnboardingOpen(true)} className="w-10 h-10 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center" aria-label="Help" title="Help & Tips"><HelpOutlineIcon /></button>
        </div>
      </Header>
      <div className="h-px bg-gray-200 dark:bg-gray-700/50" />
    </div>
  <main className="flex-1 px-4 sm:px-6 text-gray-800 dark:text-white overflow-y-auto md:overflow-hidden min-h-0">
        
        {isTrulyEmpty ? (
          <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center h-full">
            <EmptyStateIcon icon={<TodayIcon />} size="lg" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('dashboard_empty_title')}</h2>
            <p className="max-w-md mt-1 mb-6">{t('dashboard_empty_subtitle')}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => props.onLoadSampleData()} className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all">See example data</button>
              <button onClick={() => onSelectView('lists')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-[var(--radius-button)] font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('dashboard_empty_cta_tasks')}</button>
              <button onClick={() => onSelectView('habits')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-[var(--radius-button)] font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{t('dashboard_empty_cta_habits')}</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:grid md:grid-cols-4 md:gap-6 h-full min-h-0">
            {/* Main area (3/4 on >=md): controls + two columns (Tasks/Habits | Events) */}
            <div className="md:col-span-3 flex flex-col min-h-0">
              {/* Sticky within left/middle columns only */}
              <div className="bg-gray-100 dark:bg-gray-800 md:sticky md:top-0 z-20">
                <div className="pt-1.5">
                  <DateScroller selectedDate={selectedDate} onDateSelect={onDateSelect} />
                </div>
                <div className="px-0 sm:px-0 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <ProjectFilterDropdown projects={projects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} />
                    </div>
                    {!isTrulyEmpty && (
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {/* Mobile/Tablet: Toggle + icon-only actions in the same row */}
                        <div className="md:hidden flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700/50 rounded-full">
                          <button onClick={() => setMobileTab('events')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${mobileTab === 'events' ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/60 dark:hover:bg-gray-700/60'}`}>Events</button>
                          <button onClick={() => setMobileTab('tasks')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${mobileTab === 'tasks' ? 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300/60 dark:hover:bg-gray-700/60'}`}>Tasks</button>
                        </div>

                        {/* Icon-only actions for <lg */}
                        <button onClick={() => onNewTask(selectedISODate)} className="w-10 h-10 flex md:hidden items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Task" title="New Task"><NewTaskIcon /></button>
                        <button onClick={() => onNewEvent(selectedISODate)} className="w-10 h-10 flex md:hidden items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Event" title="New Event"><CalendarAddOnIcon /></button>
                        <button onClick={onNewHabit} className="w-10 h-10 flex md:hidden items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Habit" title="New Habit"><NewHabitIcon /></button>

                        {/* Desktop: Icon-only actions (>=lg) */}
                        <button onClick={() => onNewTask(selectedISODate)} className="w-10 h-10 hidden md:flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Task" title="New Task"><NewTaskIcon /></button>
                        <button onClick={() => onNewEvent(selectedISODate)} className="w-10 h-10 hidden md:flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Event" title="New Event"><CalendarAddOnIcon /></button>
                        <button onClick={onNewHabit} className="w-10 h-10 hidden md:flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Habit" title="New Habit"><NewHabitIcon /></button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700/50" />
              </div>
              <div>
                {isEmpty ? (
                  <div className="text-center text-gray-500 p-6 flex flex-col items-center justify-center">
                    <EmptyStateIcon icon={<CheckCircleIcon />} size="lg" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">Organize your day</h3>
                    <p className="max-w-md text-sm mb-5">You have no tasks, habits, or events for this date. Add what matters and get going.</p>
                    <div className="flex gap-3">
                      <button onClick={() => onNewTask(selectedISODate)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-[var(--radius-button)] font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5">
                        <NewTaskIcon /> <span>New Task</span>
                      </button>
                      <button onClick={onNewHabit} className="px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg transition-all flex items-center gap-1.5">
                        <NewHabitIcon /> <span>New Habit</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mobile: content below (toggle is in the control row) */}
                    <div className="md:hidden mt-2 space-y-2">
                      {mobileTab === 'events'
                        ? (
                          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col h-[65vh]">
                            <DayEventsTimeline
                              events={eventsForDay}
                              projects={projects}
                              selectedDate={selectedDate}
                              onEditItem={onEditItem}
                              onNewEventAt={onNewEventAt}
                            />
                          </div>
                        )
                        : orderedDailyItems.map(itemWrapper => {
                            const { item, type } = itemWrapper;
                            const category = userCategories.find(c => c.id === item.categoryId);
                            const isRecentlyCompleted = recentlyCompletedItemId === item.id;
                            const isCompleted = (item as Checklist | Habit).completionHistory?.includes(selectedISODate);
                            const isCompleting = completingItemIds.has(item.id);
                            if (isCompleting && isCompleted) return null;
                            return (
                              <div key={item.id}>
                                {type === 'task' ? (
                                  (item as Checklist).tasks.length === 0 ? (
                                    <DashboardSingleTask task={item as Checklist} category={category} onToggleCompletion={() => onToggleSingleTaskCompletion(item.id, selectedISODate)} onEdit={() => onEditItem(item)} isCompleted={isCompleted} isRecentlyCompleted={isRecentlyCompleted} onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)} isCompleting={isCompleting} />
                                  ) : (
                                    <DashboardMultiTaskList list={item as Checklist} category={category} onOpenModal={(list) => setModalItemId(list.id)} onEdit={() => onEditItem(item)} selectedDate={selectedDate} isRecentlyCompleted={isRecentlyCompleted} onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)} isCompleting={isCompleting} />
                                  )
                                ) : (
                                  <DashboardHabitCard habit={item as Habit} category={category} selectedDate={selectedDate} onToggleHabitCompletion={onToggleHabitCompletion} onOpenSubtaskModal={(habit) => setModalItemId(habit.id)} onEdit={() => onEditItem(item)} isRecentlyCompleted={isRecentlyCompleted} onOpenPriorityModal={() => setPriorityModalItem(item as Habit)} isCompleting={isCompleting} />
                                )}
                              </div>
                            );
                          })}
                    </div>

                    {/* >=md: split the 3/4 area into two equal columns (Tasks/Habits | Events) */}
                    <div className="hidden md:grid md:grid-cols-2 md:gap-6 mt-2 flex-1 min-h-0">
                      {/* Left of 3/4: Tasks & Habits */}
                      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col min-h-0">
                        <div className="p-2 space-y-2 overflow-y-auto min-h-0 flex-1">
                        {orderedDailyItems.map(itemWrapper => {
                          const { item, type } = itemWrapper;
                          const category = userCategories.find(c => c.id === item.categoryId);
                          const isRecentlyCompleted = recentlyCompletedItemId === item.id;
                          const isCompleted = (item as Checklist | Habit).completionHistory?.includes(selectedISODate);
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
                                    isCompleted={isCompleted}
                                    isRecentlyCompleted={isRecentlyCompleted}
                                    onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)}
                                    isCompleting={isCompleting}
                                  />
                                ) : (
                                  <DashboardMultiTaskList
                                    list={item as Checklist}
                                    category={category}
                                    onOpenModal={(list) => setModalItemId(list.id)}
                                    onEdit={() => onEditItem(item)}
                                    selectedDate={selectedDate}
                                    isRecentlyCompleted={isRecentlyCompleted}
                                    onOpenPriorityModal={() => setPriorityModalItem(item as Checklist)}
                                    isCompleting={isCompleting}
                                  />
                                )
                              ) : (
                                <DashboardHabitCard
                                  habit={item as Habit}
                                  category={category}
                                  selectedDate={selectedDate}
                                  onToggleHabitCompletion={onToggleHabitCompletion}
                                  onOpenSubtaskModal={(habit) => setModalItemId(habit.id)}
                                  onEdit={() => onEditItem(item)}
                                  isRecentlyCompleted={isRecentlyCompleted}
                                  onOpenPriorityModal={() => setPriorityModalItem(item as Habit)}
                                  isCompleting={isCompleting}
                                />
                              )}
                            </div>
                          );
                        })}
                        {orderedDailyItems.length === 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 px-2 italic">No tasks or habits.</p>
                        )}
                        </div>
                      </div>

                      {/* Right of 3/4: Events */}
                      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm flex flex-col min-h-0">
                        <div className="flex-1 min-h-0">
                          <DayEventsTimeline events={eventsForDay} projects={projects} selectedDate={selectedDate} onEditItem={onEditItem} onNewEventAt={onNewEventAt} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="my-2 h-px bg-gray-200 dark:bg-gray-700/50 md:hidden" />
            </div>

            {/* Right column (>=md): Notes */}
            <div className="hidden md:flex md:flex-col md:col-span-1 min-h-0">
              <div className="flex flex-col min-h-0 flex-1">
                <div className="flex items-center justify-between mb-3 px-2 pt-2.5">
                    <h2 className="text-base font-semibold">{t('recent_notes')}</h2>
          <button onClick={() => onNewNote({})} className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/50 rounded-[var(--radius-button)] transition-colors" aria-label="New Note" title="New Note">
            <NoteAddIcon />
          </button>
                </div>
                <div className="space-y-3 overflow-y-auto min-h-0">
                    {recentNotes.map((note, index) => {
                      const color = noteColors[index % noteColors.length];
                      const formattedDate = formatNoteDate(note.lastModified);
                      const contentPreview = getContentPreview(note.content);
                      return (
                          <button key={note.id} onClick={() => onSelectNote(note.id)} className={`w-full text-left p-3 rounded-xl shadow-sm flex flex-col transition-all hover:shadow-md border border-gray-200 dark:border-gray-700/50 border-l-4 ${color.bg} ${color.darkBg} ${color.border}`}>
                              <h4 className="font-semibold text-gray-800 dark:text-white truncate">{note.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{formattedDate}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 flex-grow overflow-hidden">
                                  {contentPreview}
                              </p>
                          </button>
                      )
                  })}
                  {notes.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400 px-2 italic">No notes yet.</p>}
                </div>
              </div>
            </div>
            {/* Mobile: Notes hidden per requirements */}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;