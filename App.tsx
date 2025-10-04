import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import Dashboard from './components/Dashboard';
import ListsView from './components/ListsView';
import HabitsView from './components/HabitsView';
import SettingsView from './components/SettingsView';
import AuthModal from './components/AuthModal';
import NotesView from './components/NotesView';
import NotesListPage from './components/NotesListPage';
import ProjectModal from './components/ProjectsView';
import CategoryModal from './components/CategoryModal';
import ProjectDetailsView from './components/ProjectDetailsView';
import ChatInputBar from './components/ChatInputBar';
import BottomNavBar from './components/BottomNavBar';
import FilesView from './components/FilesView';
import FilePreviewModal from './components/FilePreviewModal';
import ProjectsListPage from './components/ProjectsListPage';
import EventModal from './components/EventModal';
import CalendarView from './components/CalendarView';
import StoriesView from './components/StoriesView';
import RequestsListPage from './components/RequestsListPage';
import RequestIntakeForm from './components/RequestIntakeForm';
import RequestsBoardPage from './components/RequestsBoardPage';
import StoryEditorPage from './components/StoryEditorPage';
import LandingPage from './components/LandingPage';
import OnboardingModal from './components/OnboardingModal';
import FeedbackModal from './components/FeedbackModal';
import { Project, Conversation, Message, Sender, Habit, Checklist, Task, AIResponse, UserCategory, AppView, UserPreferences, Note, AppLanguage, RecurrenceRule, ProjectFile, Reminder, AppSize, Event, ReminderSetting, Story, StoryStatus, Request, FeedbackType, SkillCategory, Skill } from './types';
import { getCombinedSampleData } from './services/sampleDataService';
import { parseAIResponse, generateTitleForChat, generateStoriesFromRequest } from './services/geminiService';
import { AddIcon, CalendarTodayIcon, CloseIcon, DeleteIcon, NotificationsIcon, WarningIcon, FolderIcon, ExpandMoreIcon, ListAltIcon, CheckCircleIcon, RadioButtonUncheckedIcon, ChatAddOnIcon, SearchIcon } from './components/icons';
import GlobalSearch from './components/GlobalSearch';
import { authService, AuthSession, VERIFICATION_STORAGE_KEY } from './services/authService';
import { authorizationNotificationService } from './services/authorizationNotificationService';
import { databaseService } from './services/databaseService';
import { migrateToRelational } from './services/migrateToRelational';
import { relationalDb } from './services/relationalDatabaseService';
import { offlineSync } from './services/offlineQueue';
import { feedbackService } from './services/feedbackService';


// === SHARED MODAL COMPONENTS ===
const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; message: string; }> = ({ onConfirm, onCancel, message }) => (
  <div className="fixed inset-0 bg-gray-900/80 z-[60] flex items-center justify-center p-4">
    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 text-center">
      <WarningIcon className="text-red-500 text-5xl mx-auto mb-4" />
      <h2 className="text-xl font-semibold mb-2">Are you sure?</h2>
      <p className="text-gray-400 mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        <button onClick={onCancel} className="px-6 py-2 rounded-full bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const FloatingActionButton: React.FC<{onClick: () => void, isChatOpen: boolean}> = ({onClick, isChatOpen}) => {
    return (
        <div className={`md:hidden fixed right-4 bottom-20 z-40 transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-y-48' : 'translate-y-0'}`}>
            <button
                onClick={onClick}
                className="w-14 h-14 flex items-center justify-center bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                aria-label="Open Command Bar"
            >
                <span className="material-symbols-outlined text-3xl">chat</span>
            </button>
        </div>
    );
};

const StyledSelect: React.FC<{
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
}> = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <span>{selectedOption?.label}</span>
                <ExpandMoreIcon className={`text-base text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <ul>
                        {options.map(option => (
                            <li key={option.value}>
                                <button
                                    onClick={() => { onChange(option.value); setIsOpen(false); }}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-600"
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

// Helper to get today's date as a YYYY-MM-DD string based on local timezone
const getISODate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


const RecurrenceEditor: React.FC<{
    recurrence?: RecurrenceRule | null;
    onUpdate: (updates: Partial<RecurrenceRule> | null) => void;
    allowNoRecurrence?: boolean;
}> = ({ recurrence, onUpdate, allowNoRecurrence = true }) => {
    const days: RecurrenceRule['daysOfWeek'] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const toggleDay = (day: (typeof days)[number]) => {
        const currentDays = recurrence?.daysOfWeek || [];
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
        onUpdate({ daysOfWeek: newDays });
    };
    
    const handleTypeChange = (newType: string) => {
        if (newType === 'none') {
            onUpdate(null);
        } else {
            const baseRecurrence: RecurrenceRule = {
                type: newType as RecurrenceRule['type'],
                startDate: recurrence?.startDate || getISODate(),
                daysOfWeek: recurrence?.daysOfWeek,
                interval: recurrence?.interval,
            };
            onUpdate(baseRecurrence);
        }
    };

    const recurrenceOptions = [
        { value: 'none', label: 'Does not repeat' },
        { value: 'daily', label: 'Every day' },
        { value: 'weekly', label: 'Specific days of the week' },
        { value: 'interval', label: 'Repeat' },
    ];
    const filteredOptions = allowNoRecurrence ? recurrenceOptions : recurrenceOptions.filter(o => o.value !== 'none');

    return (
        <div className="space-y-2">
            <StyledSelect
                value={recurrence?.type || 'none'}
                onChange={handleTypeChange}
                options={filteredOptions}
            />
            {recurrence?.type === 'weekly' && (
                <div className="flex items-center justify-center gap-1.5 pt-1">
                    {days.map(day => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`w-8 h-8 rounded-full text-xs font-semibold transition-colors ${
                                recurrence.daysOfWeek?.includes(day)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                            }`}
                        >
                            {day.slice(0,1)}
                        </button>
                    ))}
                </div>
            )}
            {recurrence?.type === 'interval' && (
                 <input
                    type="number"
                    min="1"
                    value={recurrence.interval || 1}
                    onChange={e => onUpdate({ interval: parseInt(e.target.value, 10) })}
                    className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3 for every 3 days"
                 />
            )}
        </div>
    );
};

const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

const IconSelect: React.FC<{
  items: (Project | UserCategory)[];
  userCategories: UserCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  type: 'project' | 'category';
  onNewRequest?: () => void;
  placeholder: string;
}> = ({ items, userCategories, selectedId, onSelect, type, onNewRequest, placeholder }) => {
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

  const getIcon = (item: Project | UserCategory) => {
    if (item.hasOwnProperty('icon') && item.hasOwnProperty('color') && (item as Project).icon && (item as Project).color) {
        // Project with custom icon/color
        return <Icon name={(item as Project).icon!} className="text-base" style={{ color: (item as Project).color }} />;
    }
    if ('categoryId' in item) { // it's a Project, find its category
        const category = userCategories.find(c => c.id === (item as Project).categoryId);
        return category ? <Icon name={category.icon} className="text-base" style={{ color: category.color }} /> : <FolderIcon className="text-base text-gray-400" />;
    }
    // it's a UserCategory
    return <Icon name={(item as UserCategory).icon} className="text-base" style={{ color: (item as UserCategory).color }} />;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <div className="flex items-center gap-2 truncate">
            {selectedItem ? getIcon(selectedItem) : (type === 'project' ? <FolderIcon className="text-base text-gray-400" /> : <Icon name="label" className="text-base text-gray-400" />)}
            <span className={`truncate ${selectedItem ? '' : 'text-gray-400'}`}>{selectedItem ? selectedItem.name : placeholder}</span>
        </div>
        <ExpandMoreIcon className={`text-base text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <ul>
            <li>
              <button onClick={() => { onSelect(''); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-600 text-gray-400">
                <span>{placeholder}</span>
              </button>
            </li>
            {items.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => { onSelect(item.id); setIsOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-600"
                >
                  {getIcon(item)}
                  <span className="truncate">{item.name}</span>
                </button>
              </li>
            ))}
            {onNewRequest && (
              <li>
                <button
                  onClick={() => { onNewRequest(); setIsOpen(false); }}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-gray-600"
                >
                  <AddIcon className="text-base" />
                  <span>Create new...</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const TaskEditorModal: React.FC<{
  initialData?: Partial<Checklist>;
  onClose: () => void;
  onSave: (data: Omit<Checklist, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Checklist, 'id'>>) => void;
  onDelete?: () => void;
  userCategories: UserCategory[];
  projects: Project[];
  onNewCategoryRequest: () => void;
}> = ({ initialData, onClose, onSave, onUpdate, onDelete, userCategories, projects, onNewCategoryRequest }) => {
    const isEditing = !!initialData?.id;
    const [localData, setLocalData] = useState<Partial<Checklist>>({
        name: '', tasks: [], categoryId: '', projectId: '', dueDate: getISODate(), 
        dueTime: null, reminder: undefined, priority: 10, recurrence: null,
        ...initialData
    });
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const itemInputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const prevTasksLength = useRef(localData.tasks?.length);

    useEffect(() => {
        if (!isEditing) {
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isEditing]);
    
    useEffect(() => {
        const currentTasksLength = localData.tasks?.length || 0;
        if (prevTasksLength.current !== undefined && currentTasksLength > prevTasksLength.current) {
            itemInputsRef.current[currentTasksLength - 1]?.focus();
        }
        prevTasksLength.current = currentTasksLength;
    }, [localData.tasks]);

    const handleUpdateField = (field: keyof Checklist, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    // When a project is selected, auto-select and lock the corresponding category
    useEffect(() => {
        if (localData.projectId) {
            const proj = projects.find(p => p.id === localData.projectId);
            if (proj && proj.categoryId && localData.categoryId !== proj.categoryId) {
                setLocalData(prev => ({ ...prev, categoryId: proj.categoryId! }));
            }
        }
    }, [localData.projectId, projects]);

    const handleRecurrenceChange = (newRecurrence: Partial<RecurrenceRule> | null) => {
        if (newRecurrence === null) {
            handleUpdateField('recurrence', null);
        } else {
            setLocalData(prev => ({
                ...prev,
                recurrence: {
                    ...(prev.recurrence || { type: 'daily', startDate: getISODate() }),
                    ...newRecurrence
                } as RecurrenceRule
            }));
        }
    };

    const handleChecklistChange = (field: keyof Task, index: number, value: any) => {
        const newTasks = [...(localData.tasks || [])];
        const task = { ...newTasks[index] };
        
        if (field === 'completedAt') {
            task.completedAt = task.completedAt ? null : getISODate();
        } else {
            task[field] = value;
        }

        newTasks[index] = task;
        handleUpdateField('tasks', newTasks);
    };


    const addChecklistItem = () => {
        const tasks = localData.tasks || [];
        if (tasks.length > 0 && tasks[tasks.length - 1].text.trim() === '') {
            itemInputsRef.current[tasks.length - 1]?.focus();
            return;
        }
        const newTasks = [...tasks, { id: `task-new-${Date.now()}`, text: '', completedAt: null }];
        handleUpdateField('tasks', newTasks);
    };
    
    const removeChecklistItem = (index: number) => {
        const newTasks = (localData.tasks || []).filter((_, i) => i !== index);
        handleUpdateField('tasks', newTasks);
    };

    const handleItemKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tasks = localData.tasks || [];
            if (tasks[index] && tasks[index].text.trim() !== '') {
                addChecklistItem();
            }
        }
    };

    const handleSave = () => {
        if (!localData.name?.trim()) return;
        
        const dataToSave = { ...localData };
        // Filter out empty checklist items before saving
        if (dataToSave.tasks) {
            dataToSave.tasks = dataToSave.tasks.filter(task => task.text.trim() !== '');
        }

        if (isEditing && initialData.id) {
            onUpdate(initialData.id, dataToSave);
        } else {
            onSave(dataToSave as Omit<Checklist, 'id'>);
        }
        onClose();
    };
    
    const FormRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <h3 className="font-semibold text-gray-300 text-sm flex-shrink-0 md:w-1/4">{label}</h3>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );

    return (
        <>
            <div className="fixed inset-0 bg-gray-900/80 z-50 md:flex md:items-center md:justify-center md:p-4" onClick={onClose}>
                <div className="fixed inset-x-0 bottom-0 md:relative bg-gray-800 rounded-t-xl md:rounded-xl border-t md:border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-in-up md:animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
                    <header className="p-4 flex items-center justify-between border-b border-gray-700">
                        <h2 className="text-lg font-semibold">{isEditing ? 'Edit Task' : 'New Task'}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
                    </header>
                    <main className="p-6 overflow-y-auto space-y-4">
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={localData.name || ''}
                            onChange={e => handleUpdateField('name', e.target.value)}
                            placeholder="Task Name"
                            className="w-full bg-transparent border-none p-0 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                        />
                        <div className="pt-3 space-y-2">
                            {localData.tasks?.map((task, index) => (
                                <div key={task.id} className="flex items-center gap-2 group">
                                    {!localData.recurrence && (
                                        <button onClick={() => handleChecklistChange('completedAt', index, null)}>
                                            {task.completedAt ? <CheckCircleIcon className="text-blue-500 text-xl flex-shrink-0" /> : <RadioButtonUncheckedIcon className="text-gray-500 text-xl flex-shrink-0" />}
                                        </button>
                                    )}
                                    <input
                                        ref={el => { itemInputsRef.current[index] = el; return; }}
                                        type="text" 
                                        value={task.text} 
                                        onChange={e => handleChecklistChange('text', index, e.target.value)} 
                                        onKeyDown={(e) => handleItemKeyDown(e, index)}
                                        placeholder="Item name" 
                                        className={`flex-1 bg-transparent text-sm py-1 focus:outline-none focus:bg-gray-700/50 rounded-md px-2 ${task.completedAt ? 'line-through text-gray-500' : ''}`}
                                    />
                                    <button onClick={() => removeChecklistItem(index)} className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><DeleteIcon /></button>
                                </div>
                            ))}
                            <div className="pl-7">
                                <button onClick={addChecklistItem} className="text-blue-400 text-sm font-semibold hover:text-blue-300 flex items-center gap-1 py-1">
                                    <AddIcon className="text-base" />
                                    <span>Add item</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-700">
                      <FormRow label="Category">
                          {/* FIX: Renamed 'onNewCategoryRequest' prop to 'onNewRequest' */}
                          <div className={`${localData.projectId ? 'opacity-60 pointer-events-none' : ''}`}>
                            <IconSelect items={userCategories} userCategories={userCategories} selectedId={localData.categoryId || ''} onSelect={id => handleUpdateField('categoryId', id)} type="category" placeholder="Select Category" onNewRequest={onNewCategoryRequest} />
                          </div>
                      </FormRow>
                           <FormRow label="Project">
                               <IconSelect items={projects} userCategories={userCategories} selectedId={localData.projectId || ''} onSelect={id => handleUpdateField('projectId', id)} type="project" placeholder="No project" />
                           </FormRow>
                            <FormRow label="Due Date">
                                <div className="flex items-center gap-2">
                                    <CalendarTodayIcon className="text-base text-gray-400" />
                                    <input type="date" value={localData.dueDate || ''} onChange={e => handleUpdateField('dueDate', e.target.value)} className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <span className="hidden md:inline text-gray-500">·</span>
                                    <span className="sr-only">Due time</span>
                                    <span className="inline-flex items-center gap-2">
                                        <span className="inline-flex items-center">
                                            <span className="material-symbols-outlined text-base text-gray-400">schedule</span>
                                        </span>
                                        <input type="time" value={localData.dueTime || ''} onChange={e => handleUpdateField('dueTime', e.target.value)} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </span>
                                </div>
                            </FormRow>
                            <FormRow label="Priority">
                                <input type="number" min="1" max="99" value={localData.priority || 10} onChange={e => handleUpdateField('priority', parseInt(e.target.value, 10))} className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </FormRow>
                           <FormRow label="Frequency">
                               <RecurrenceEditor
                                 recurrence={localData.recurrence}
                                 onUpdate={handleRecurrenceChange}
                                 allowNoRecurrence={true}
                               />
                           </FormRow>
                        </div>

                    </main>
                    <footer className="p-4 border-t border-gray-700 flex items-center justify-between gap-4">
                        {isEditing && onDelete ? (
                            <button onClick={() => setConfirmingDelete(true)} className="px-4 py-3 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/40 hover:text-red-300 transition-colors">
                                Delete
                            </button>
                        ) : <div></div>}
                        <button onClick={handleSave} disabled={!localData.name?.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
                             {isEditing ? 'Save Changes' : 'Create Task'}
                        </button>
                    </footer>
                </div>
            </div>
            {isConfirmingDelete && onDelete && (
                <DeleteConfirmationModal 
                    onConfirm={() => { onDelete(); setConfirmingDelete(false); onClose(); }}
                    onCancel={() => setConfirmingDelete(false)}
                    message="This action is permanent and cannot be undone."
                />
            )}
        </>
    );
};


const HabitModal: React.FC<{
  initialData?: Habit;
  onClose: () => void;
  onSave: (data: Omit<Habit, 'id' | 'completionHistory'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Habit, 'id'>>) => void;
  onDelete?: () => void;
  userCategories: UserCategory[];
  projects: Project[];
  onNewCategoryRequest: () => void;
}> = ({ initialData, onClose, onSave, onUpdate, onDelete, userCategories, projects, onNewCategoryRequest }) => {
    const isEditing = !!initialData;
    const [localData, setLocalData] = useState<Partial<Habit>>(
      initialData || { name: '', type: 'daily_check_off', categoryId: '', projectId: '', tasks: [], recurrence: { type: 'daily', startDate: getISODate() }, reminder: undefined }
    );
    const [isConfirmingDelete, setConfirmingDelete] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const habitItemInputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const prevHabitTasksLength = useRef(localData.tasks?.length);

    useEffect(() => {
        if (!isEditing) {
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isEditing]);
    
    useEffect(() => {
        const currentTasksLength = localData.tasks?.length || 0;
        if (prevHabitTasksLength.current !== undefined && currentTasksLength > prevHabitTasksLength.current) {
            habitItemInputsRef.current[currentTasksLength - 1]?.focus();
        }
        prevHabitTasksLength.current = currentTasksLength;
    }, [localData.tasks]);


    const handleUpdateField = (field: keyof Habit, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const handleRecurrenceChange = (newRecurrence: Partial<RecurrenceRule> | null) => {
        if (newRecurrence) {
             setLocalData(prev => ({
                ...prev,
                recurrence: {
                    ...(prev.recurrence || { type: 'daily', startDate: getISODate() }),
                    ...newRecurrence
                } as RecurrenceRule
            }));
        }
    };

    const handleHabitTaskChange = (field: 'text', index: number, value: any) => {
        const newTasks = [...(localData.tasks || [])];
        newTasks[index] = { ...newTasks[index], [field]: value };
        handleUpdateField('tasks', newTasks);
    };

    const addHabitTaskItem = () => {
        const tasks = localData.tasks || [];
        if (tasks.length > 0 && tasks[tasks.length - 1].text.trim() === '') {
            habitItemInputsRef.current[tasks.length - 1]?.focus();
            return;
        }
        const newTasks = [...tasks, { id: `task-new-${Date.now()}`, text: '', completedAt: null }];
        handleUpdateField('tasks', newTasks);
    };
    
    const removeHabitTaskItem = (index: number) => {
        const newTasks = (localData.tasks || []).filter((_, i) => i !== index);
        handleUpdateField('tasks', newTasks);
    };
    
    const handleHabitItemKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tasks = localData.tasks || [];
            if (tasks[index] && tasks[index].text.trim() !== '') {
                addHabitTaskItem();
            }
        }
    };

    const handleSave = () => {
        if (!localData.name?.trim()) return;
        if (isEditing) {
            onUpdate(initialData.id, localData);
        } else {
            onSave(localData as Omit<Habit, 'id' | 'completionHistory'>);
        }
        onClose();
    };
    
    const FormRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <h3 className="font-semibold text-gray-300 text-sm flex-shrink-0 md:w-1/4">{label}</h3>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
    
    return (
     <>
      <div className="fixed inset-0 bg-gray-900/80 z-50 md:flex md:items-center md:justify-center md:p-4" onClick={onClose}>
        <div className="fixed inset-x-0 bottom-0 md:relative bg-gray-800 rounded-t-xl md:rounded-xl border-t md:border border-gray-700 w-full max-w-2xl h-[85vh] md:h-auto md:max-h-[90vh] flex flex-col animate-slide-in-up md:animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
          <header className="p-4 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit Habit' : 'New Habit'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
          </header>
          <main className="p-6 overflow-y-auto space-y-4">
             <input
                ref={nameInputRef}
                type="text"
                value={localData.name || ''}
                onChange={e => handleUpdateField('name', e.target.value)}
                placeholder="Habit Name"
                className="w-full bg-transparent border-none p-0 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-0"
            />

            <div className="space-y-3 pt-4 border-t border-gray-700">
                <div className="flex items-center gap-1 p-1 bg-gray-700/50 rounded-full">
                    <button type="button" onClick={() => handleUpdateField('type', 'daily_check_off')} className={`flex-1 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${localData.type === 'daily_check_off' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-600/50'}`}>
                        Daily Check-off
                    </button>
                    <button type="button" onClick={() => handleUpdateField('type', 'checklist')} className={`flex-1 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${localData.type === 'checklist' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:bg-gray-600/50'}`}>
                        Checklist
                    </button>
                </div>
                <FormRow label="Category">
                    <IconSelect items={userCategories} userCategories={userCategories} selectedId={localData.categoryId || ''} onSelect={id => handleUpdateField('categoryId', id)} type="category" placeholder="Select Category" onNewRequest={onNewCategoryRequest} />
                </FormRow>
                <FormRow label="Project">
                    <IconSelect items={projects} userCategories={userCategories} selectedId={localData.projectId || ''} onSelect={id => handleUpdateField('projectId', id)} type="project" placeholder="No Project" />
                </FormRow>
                <FormRow label="Frequency">
                    <RecurrenceEditor
                      recurrence={localData.recurrence!}
                      onUpdate={handleRecurrenceChange}
                      allowNoRecurrence={false}
                    />
                </FormRow>
            </div>
            
            {localData.type === 'checklist' && (
              <div className="pt-4 border-t border-gray-700">
                  <h3 className="font-semibold text-gray-300 mb-2 text-sm">Checklist Items</h3>
                  <div className="space-y-2">
                      {localData.tasks?.map((task, index) => (
                          <div key={task.id} className="flex items-center gap-2 group">
                              <input
                                ref={el => { habitItemInputsRef.current[index] = el; return; }}
                                type="text"
                                value={task.text}
                                onChange={e => handleHabitTaskChange('text', index, e.target.value)}
                                onKeyDown={e => handleHabitItemKeyDown(e, index)}
                                placeholder="Item name"
                                className="flex-1 bg-gray-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                              <button onClick={() => removeHabitTaskItem(index)} className="p-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><DeleteIcon /></button>
                          </div>
                      ))}
                      <button onClick={addHabitTaskItem} className="text-blue-400 text-sm font-semibold hover:text-blue-300 flex items-center gap-1 py-1">
                        <AddIcon className="text-base" />
                        <span>Add item</span>
                      </button>
                  </div>
              </div>
            )}

          </main>
          <footer className="p-4 border-t border-gray-700 flex items-center justify-between gap-4">
            {isEditing && onDelete ? (
              <button onClick={() => setConfirmingDelete(true)} className="px-4 py-3 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/40 hover:text-red-300 transition-colors">
                Delete
              </button>
            ) : <div></div>}
            <button onClick={handleSave} disabled={!localData.name?.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-full text-sm font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">
                {isEditing ? 'Save Changes' : 'Create Habit'}
            </button>
          </footer>
        </div>
      </div>
      {isConfirmingDelete && onDelete && (
         <DeleteConfirmationModal
            onConfirm={() => { onDelete(); setConfirmingDelete(false); onClose(); }}
            onCancel={() => setConfirmingDelete(false)}
            message="This action is permanent and cannot be undone."
        />
      )}
    </>
    );
};


// === I18N TRANSLATIONS ===
const translations = {
  en: {
    dashboard: 'Today', tasks: 'Tasks', habits: 'Habits', categories: 'Categories', projects: 'Projects', notes: 'Notes', files: 'Files', settings: 'Settings', calendar: 'Calendar', new_chat: 'New chat', chats: 'Chats',
    good_morning: 'Good morning', good_afternoon: 'Good afternoon', good_evening: 'Good evening',
    dashboard_subtitle: "Here's your plan for today.",
    dashboard_empty_title: "Your central command center", dashboard_empty_subtitle: "Once you add tasks or habits, your daily priorities will show up here. Ready to organize your day?", dashboard_empty_cta_tasks: "Create a Task", dashboard_empty_cta_habits: "Build a Habit",
    todays_items: "Today's Items", no_items_today: "No items for today. Add one from the Tasks tab!", view_all: "View All", no_habits_tracked: "No habits being tracked. Add one from the Habits tab!",
    new_task: "New Task", no_tasks_yet: "Organize anything with tasks", no_tasks_yet_subtitle: "From simple to-dos to multi-step projects, tasks help you keep track of everything. Create your first one to get started.", create_task: "Create Your First Task",
    new_habit: "New Habit", no_habits_yet: "Build routines that stick", no_habits_yet_subtitle: "Consistency is key. Track daily habits or multi-step routines and watch your progress grow over time.", create_habit: "Track a New Habit",
    new_category: "New Category", no_categories_yet: "Categorize your life", no_categories_yet_subtitle: "Group your tasks, habits, and projects with custom icons and colors. Crate categories like 'Work', 'Health', or 'Personal'.", create_category: "Create Your First Category",
    no_note_selected: "Your thoughts, organized", no_note_selected_subtitle: "Select a note from the sidebar to start editing, or create a new note or folder to capture what's on your mind.", create_note: "New Note",
    new_project: "New project",
    conversations: "Conversations", pending_tasks: "Pending Tasks",
    project_no_conversations: "Start a conversation to begin brainstorming or planning in this project.", project_no_tasks: "No pending tasks. Add a task to get started on your project goals.", project_no_notes_linked: "No notes in this project. Add a note to keep track of important information.",
    settings_title: "Settings", settings_user_profile: "User Profile", settings_ai_memory: "AI & Memory", settings_appearance: "Appearance", settings_pulse: "Pulse Widget",
    settings_nickname: "How should the app call you?", settings_occupation: "Occupation / Role", settings_personal_notes: "Personal Notes", settings_personal_notes_desc: "Provide any other details about yourself to give the chatbot more context.",
    settings_language: "Language", settings_personality: "Personality", settings_use_memory: "Use Memory", settings_use_memory_desc: "Allow the chatbot to remember things from your current conversation.",
    settings_use_history: "Reference Historical Chats", settings_use_history_desc: "Allow the chatbot to use context from previous, separate conversations.",
    settings_allow_web_search: "Allow automatic web search", settings_allow_web_search_desc: "Let Taskly.Chat search the web for up-to-date information when needed.",
    settings_dark_mode: "Dark Mode", settings_color_theme: "Color Theme",
    settings_reset_defaults: "Reset to Default Settings", settings_save_changes: "Save Changes", settings_discard_changes: "Discard Changes", settings_changes_saved: "Changes saved!",
    recent_notes: "Recent Notes",
    no_notes_yet: "Capture your thoughts", no_notes_yet_subtitle: "Your notes page is the perfect place to jot down ideas, meeting minutes, or anything else you need to remember. Create your first note to get started.",
    no_files_yet: "Your file library is empty", no_files_yet_subtitle: "Attach files to notes or projects, and they'll all appear here for easy management.", upload_file: 'Upload File',
    settings_pulse_desc: "Configure up to 3 real-time data points to display on your dashboard.",
    pulse_add_widget: "Add Widget", pulse_configure_widget: "Configure Widget", pulse_select_type: "Select Widget Type",
    pulse_weather: "Weather", pulse_stock: "Stock", pulse_crypto: "Cryptocurrency", pulse_email: "Unread Emails", pulse_calendar: "Next Event", pulse_exchange: "Exchange Rate", pulse_trending: "Trending Topic",
    pulse_config_city: "City", pulse_config_ticker: "Stock Ticker (e.g., GOOGL)", pulse_config_symbol: "Crypto Symbol (e.g., BTC)", pulse_config_from: "From Currency (e.g., USD)", pulse_config_to: "To Currency (e.g., EUR)",
    task_created_success: "Task created successfully!",
    habit_created_success: "Habit created successfully!",
    project_created_success: "Project created successfully!",
    category_created_success: "Category created successfully!",
  },
  pt: {
    dashboard: 'Hoje', tasks: 'Tarefas', habits: 'Hábitos', categories: 'Categorias', projects: 'Projetos', notes: 'Notas', files: 'Ficheiros', settings: 'Configurações', calendar: 'Calendário', new_chat: 'Novo chat', chats: 'Chats',
    good_morning: 'Bom dia', good_afternoon: 'Boa tarde', good_evening: 'Boa noite',
    dashboard_subtitle: "Aqui está o seu plano para hoje.",
    dashboard_empty_title: "Seu centro de comando central", dashboard_empty_subtitle: "Assim que adicionar tarefas ou hábitos, suas prioridades diárias aparecerão aqui. Pronto para organizar seu dia?", dashboard_empty_cta_tasks: "Criar uma Tarefa", dashboard_empty_cta_habits: "Construir um Hábito",
    todays_items: "Itens de Hoje", no_items_today: "Nenhum item para hoje. Adicione um na aba de Tarefas!", view_all: "Ver Todos", no_habits_tracked: "Nenhum hábito sendo acompanhado. Adicione um na aba de Hábitos!",
    new_task: "Nova Tarefa", no_tasks_yet: "Organize qualquer coisa com tarefas", no_tasks_yet_subtitle: "De simples afazeres a projetos com várias etapas, as tarefas ajudam você a acompanhar tudo. Crie sua primeira para começar.", create_task: "Crie Sua Primeira Tarefa",
    new_habit: "Novo Hábito", no_habits_yet: "Crie rotinas que se mantêm", no_habits_yet_subtitle: "A consistência é fundamental. Acompanhe hábitos diários ou rotinas de várias etapas e veja seu progresso crescer com o tempo.", create_habit: "Acompanhar um Novo Hábito",
    new_category: "Nova Categoria", no_categories_yet: "Categorize sua vida", no_categories_yet_subtitle: "Agrupe suas tarefas, hábitos e projetos com ícones e cores personalizados. Crie categorias como 'Trabalho', 'Saúde' ou 'Pessoal'.", create_category: "Crie Sua Primeira Categoria",
    no_note_selected: "Seus pensamentos, organizados", no_note_selected_subtitle: "Selecione uma nota na barra lateral para começar a editar, ou crie uma nova nota ou pasta para capturar o que está em sua mente.", create_note: "Nova Nota",
    new_project: "Novo projeto",
    conversations: "Conversas", pending_tasks: "Tarefas Pendentes",
    project_no_conversations: "Inicie uma conversa para começar a debater ideias ou planejar neste projeto.", project_no_tasks: "Nenhuma tarefa pendente. Adicione uma tarefa para começar a trabalhar nos objetivos do seu projeto.", project_no_notes_linked: "Nenhuma nota neste projeto. Adicione uma nota para manter o controle de informações importantes.",
    settings_title: "Configurações", settings_user_profile: "Perfil de Usuário", settings_ai_memory: "IA & Memória", settings_appearance: "Aparência", settings_pulse: "Widget Pulse",
    settings_nickname: "Como o aplicativo deve te chamar?", settings_occupation: "Ocupação / Cargo", settings_personal_notes: "Notas Pessoais", settings_personal_notes_desc: "Forneça outros detalhes sobre você para dar mais contexto ao chatbot.",
    settings_language: "Idioma", settings_personality: "Personalidade", settings_use_memory: "Usar Memória", settings_use_memory_desc: "Permitir que o chatbot se lembre de coisas da sua conversa atual.",
    settings_use_history: "Referenciar Chats Históricos", settings_use_history_desc: "Permitir que o chatbot use o contexto de conversas anteriores e separadas.",
    settings_allow_web_search: "Permitir pesquisa automática na web", settings_allow_web_search_desc: "Deixe o Taskly.Chat pesquisar na web por informações atualizadas quando necessário.",
    settings_dark_mode: "Modo Escuro", settings_color_theme: "Tema de Cores",
    settings_reset_defaults: "Redefinir para Padrões", settings_save_changes: "Salvar Alterações", settings_discard_changes: "Descartar Alterações", settings_changes_saved: "Alterações salvas!",
    recent_notes: "Notas Recentes",
    no_notes_yet: "Capture seus pensamentos", no_notes_yet_subtitle: "Sua página de notas é o lugar perfeito para anotar ideias, atas de reuniões ou qualquer outra coisa que você precise lembrar. Crie sua primeira nota para começar.",
    no_files_yet: "A sua biblioteca de ficheiros está vazia", no_files_yet_subtitle: "Anexe ficheiros a notas ou projetos, e eles aparecerão todos aqui para uma gestão fácil.", upload_file: 'Carregar Ficheiro',
    settings_pulse_desc: "Configure até 3 pontos de dados em tempo real para exibir no seu painel.",
    pulse_add_widget: "Adicionar Widget", pulse_configure_widget: "Configurar Widget", pulse_select_type: "Selecionar Tipo de Widget",
    pulse_weather: "Clima", pulse_stock: "Ações", pulse_crypto: "Criptomoeda", pulse_email: "E-mails não lidos", pulse_calendar: "Próximo Evento", pulse_exchange: "Taxa de Câmbio", pulse_trending: "Tópico em Destaque",
    pulse_config_city: "Cidade", pulse_config_ticker: "Símbolo da Ação (ex: GOOGL)", pulse_config_symbol: "Símbolo Cripto (ex: BTC)", pulse_config_from: "Moeda de Origem (ex: USD)", pulse_config_to: "Moeda de Destino (ex: EUR)",
    task_created_success: "Tarefa criada com sucesso!",
    habit_created_success: "Hábito criado com sucesso!",
    project_created_success: "Projeto criado com sucesso!",
    category_created_success: "Categoria criada com sucesso!",
  },
  nl: {
    dashboard: 'Vandaag', tasks: 'Taken', habits: 'Gewoonten', categories: 'Categorieën', projects: 'Projecten', notes: 'Notities', files: 'Bestanden', settings: 'Instellingen', calendar: 'Kalender', new_chat: 'Nieuwe chat', chats: 'Chats',
    good_morning: 'Goedemorgen', good_afternoon: 'Goedemiddag', good_evening: 'Goedenavond',
    dashboard_subtitle: "Hier is je plan voor vandaag.",
    dashboard_empty_title: "Je centrale commandocentrum", dashboard_empty_subtitle: "Zodra je taken of gewoonten toevoegt, verschijnen hier je dagelijkse prioriteiten. Klaar om je dag te organiseren?", dashboard_empty_cta_tasks: "Maak een Taak", dashboard_empty_cta_habits: "Bouw een Gewoonte",
    todays_items: "Items voor vandaag", no_items_today: "Geen items voor vandaag. Voeg er een toe via het tabblad Taken!", view_all: "Alles bekijken", no_habits_tracked: "Geen gewoonten bijgehouden. Voeg er een toe via het tabblad Gewoonten!",
    new_task: "Nieuwe Taak", no_tasks_yet: "Organiseer alles met taken", no_tasks_yet_subtitle: "Van eenvoudige to-do's tot projecten met meerdere stappen, taken helpen je alles bij te houden. Maak je eerste om te beginnen.", create_task: "Maak Je Eerste Taak",
    new_habit: "Nieuwe Gewoonte", no_habits_yet: "Bouw routines die blijven hangen", no_habits_yet_subtitle: "Consistentie is de sleutel. Volg dagelijkse gewoonten of routines met meerdere stappen en zie je vooruitgang in de loop van de tijd groeien.", create_habit: "Volg een Nieuwe Gewoonte",
    new_category: "Nieuwe Categorie", no_categories_yet: "Categoriseer je leven", no_categories_yet_subtitle: "Groepeer je taken, gewoonten en projecten met aangepaste iconen en kleuren. Maak categorieën zoals 'Werk', 'Gezondheid' of 'Persoonlijk'.", create_category: "Maak Je Eerste Categorie",
    no_note_selected: "Je gedachten, georganiseerd", no_note_selected_subtitle: "Selecteer een notitie in de zijbalk om te beginnen met bewerken, of maak een nieuwe notitie of map om vast te leggen wat je bezighoudt.", create_note: "Nieuwe Notitie",
    new_project: "Nieuw project",
    conversations: "Gesprekken", pending_tasks: "Openstaande Taken",
    project_no_conversations: "Start een gesprek om te beginnen met brainstormen of plannen in this project.", project_no_tasks: "Geen openstaande taken. Voeg een taak toe om aan je projectdoelen te beginnen.", project_no_notes_linked: "Geen notities in dit project. Voeg een notitie toe om belangrijke informatie bij te houden.",
    settings_title: "Instellingen", settings_user_profile: "Gebruikersprofiel", settings_ai_memory: "AI & Geheugen", settings_appearance: "Uiterlijk", settings_pulse: "Pulse Widget",
    settings_nickname: "Hoe moet de app je noemen?", settings_occupation: "Beroep / Rol", settings_personal_notes: "Persoonlijke Notities", settings_personal_notes_desc: "Geef andere details over jezelf om de chatbot meer context te geven.",
    settings_language: "Taal", settings_personality: "Persoonlijkheid", settings_use_memory: "Gebruik Geheugen", settings_use_memory_desc: "Sta de chatbot toe om dingen uit je huidige gesprek te onthouden.",
    settings_use_history: "Verwijs naar Historische Chats", settings_use_history_desc: "Sta de chatbot toe om context uit eerdere, afzonderlijke gesprekken te gebruiken.",
    settings_allow_web_search: "Automatisch zoeken op het web toestaan", 
    settings_allow_web_search_desc: "Laat Taskly.Chat op het web zoeken naar actuele informatie wanneer dat nodig is.",
    settings_dark_mode: "Donkere Modus", settings_color_theme: "Kleurenthema",
    settings_reset_defaults: "Reset naar Standaard", settings_save_changes: "Wijzigingen Opslaan", settings_discard_changes: "Wijzigingen Verwerpen", settings_changes_saved: "Wijzigingen opgeslagen!",
    recent_notes: "Recente Notities",
    no_notes_yet: "Leg je gedachten vast", no_notes_yet_subtitle: "Je notitiepagina is de perfecte plek om ideeën, notulen van vergaderingen of iets anders dat je moet onthouden op te schrijven. Maak je eerste notitie om te beginnen.",
    no_files_yet: "Je bestandenbibliotheek is leeg", no_files_yet_subtitle: "Voeg bestanden toe aan notities of projecten, en ze verschijnen hier allemaal voor eenvoudig beheer.", upload_file: 'Bestand uploaden',
    settings_pulse_desc: "Configureer tot 3 real-time datapunten om op uw dashboard weer te geven.",
    pulse_add_widget: "Widget Toevoegen", pulse_configure_widget: "Widget Configureren", pulse_select_type: "Widgettype Selecteren",
    pulse_weather: "Weer", pulse_stock: "Aandeel", pulse_crypto: "Cryptocurrency", pulse_email: "Ongelezen E-mails", pulse_calendar: "Volgende Afspraak", pulse_exchange: "Wisselkoers", pulse_trending: "Trending Onderwerp",
    pulse_config_city: "Stad", pulse_config_ticker: "Aandelensymbool (bijv. GOOGL)", pulse_config_symbol: "Cryptosymbool (bijv. BTC)", pulse_config_from: "Van Valuta (bijv. USD)", pulse_config_to: "Naar Valuta (bijv. EUR)",
    task_created_success: "Taak succesvol aangemaakt!",
    habit_created_success: "Gewoonte succesvol aangemaakt!",
    project_created_success: "Project succesvol aangemaakt!",
    category_created_success: "Categorie succesvol aangemaakt!",
  },
};
const getT = (language: AppLanguage) => {
  let effectiveLang: 'en' | 'pt' | 'nl' = 'en';
  let langCode = language;
  if (langCode === 'auto') {
    langCode = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] as AppLanguage : 'en';
  }
  if (langCode === 'pt' || langCode === 'nl') {
    effectiveLang = langCode;
  }
  type TranslationKey = keyof typeof translations.en;
  return (key: TranslationKey | string): string => {
    return translations[effectiveLang][key as TranslationKey] || translations.en[key as TranslationKey] || key;
  };
};



const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-slide-in-up z-[70]">
      <CheckCircleIcon />
      <span>{message}</span>
    </div>
  );
};

// === INITIAL EXAMPLE DATA ===
const initialProjectId = 'proj-initial-1';
const initialListId = 'cl-initial-2';
const initialNoteId1 = 'note-initial-1';
const today = getISODate();

const initialProjects: Project[] = [
    { id: initialProjectId, name: "Website Launch Plan", description: "A project to plan and launch our new company website. Contains all tasks, notes, and brainstorming sessions.", categoryId: "cat-1", instructions: "You are a project manager helping to plan a website launch. Be concise and provide actionable steps." }
];

const initialNotes: Note[] = [
    { id: initialNoteId1, name: "Meeting Minutes - Kickoff", content: "<h1>Meeting Minutes - Kickoff</h1><p><b>Date:</b> Today</p><h3>Attendees:</h3><ul><li>Alex (Project Lead)</li><li>AI Assistant</li></ul><h3>Discussion Points:</h3><ol><li>Finalize project goals</li><li>Set timeline and milestones</li><li>Assign initial tasks</li></ol>", projectId: initialProjectId, lastModified: new Date().toISOString() },
    { id: 'note-initial-2', name: "Content Ideas", content: "<h1>Content Ideas</h1><ul><li>Announcing our new website</li><li>Top 10 productivity hacks</li><li>How AI can improve your workflow</li></ul>", projectId: initialProjectId, lastModified: new Date().toISOString() },
    { id: 'note-initial-3', name: "Standalone Note", content: "<h1>Standalone Note</h1><p>This is a note that doesn't belong to any project.</p>", lastModified: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toISOString() }
];
const initialConversations: Conversation[] = [
    { id: 'convo-initial-1', name: "Brainstorming Slogans", projectId: initialProjectId, messages: [
        { id: 'msg-initial-1', sender: Sender.User, text: "Help me brainstorm some slogans for a new productivity app called Taskly.Chat" },
        { id: 'msg-initial-2', sender: Sender.Model, text: "Of course! How about:\n- Taskly.Chat: Where conversations become actions.\n- Conquer your day, one chat at a time.\n- Your productive partner." },
    ]}
];
const initialChecklists: Checklist[] = [
    { id: 'cl-initial-1', name: "Groceries", completionHistory: [], tasks: [
        { id: 'task-initial-1', text: "Milk", completedAt: null },
        { id: 'task-initial-2', text: "Bread", completedAt: null },
        { id: 'task-initial-3', text: "Eggs", completedAt: today },
    ], categoryId: 'cat-3', priority: 2 },
    { id: initialListId, name: "Website Launch Tasks", completionHistory: [], tasks: [
        { id: 'task-initial-4', text: "Design mockups for the landing page", completedAt: null },
        { id: 'task-initial-5', text: "Develop the front-end for the landing page", completedAt: null },
        { id: 'task-initial-6', text: "Write blog post announcement", completedAt: null },
    ], categoryId: 'cat-1', projectId: initialProjectId, priority: 3 },
    { id: 'cl-initial-3', name: "Call the bank", completionHistory: [], tasks: [], categoryId: 'cat-5', priority: 1 }
];
const initialHabits: Habit[] = [
    { id: 'habit-initial-1', name: "Read for 15 minutes", type: 'daily_check_off', completionHistory: [], categoryId: 'cat-2', recurrence: { type: 'daily', startDate: '2024-01-01' } },
    { id: 'habit-initial-2', name: "Morning Routine", type: 'checklist', completionHistory: [], categoryId: 'cat-4', tasks: [
        { id: 'htask-initial-1', text: "Make bed", completedAt: null },
        { id: 'htask-initial-2', text: "Drink a glass of water", completedAt: null },
        { id: 'htask-initial-3', text: "Stretch for 5 mins", completedAt: null },
    ], recurrence: { type: 'weekly', daysOfWeek: ['Mon', 'Wed', 'Fri'], startDate: '2024-01-01' }}
];
const initialEvents: Event[] = [
    { id: 'event-initial-1', title: 'Website Launch Meeting', description: 'Final check before going live.', startDate: today, startTime: '14:00', endDate: today, endTime: '15:00', isAllDay: false, reminders: ['15m'], projectId: initialProjectId, categoryId: 'cat-1' },
    { id: 'event-initial-2', title: 'Dentist Appointment', startDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], startTime: '10:00', endDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], endTime: '10:30', isAllDay: false, reminders: ['1h'], categoryId: 'cat-4' }
];
// =============================

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


const initialUserCategories: UserCategory[] = [
    { id: 'cat-1', name: 'Task', icon: 'check_circle', color: '#3B82F6' },
    { id: 'cat-2', name: 'Shopping', icon: 'shopping_cart', color: '#22C55E' },
    { id: 'cat-3', name: 'Study', icon: 'school', color: '#8B5CF6' },
    { id: 'cat-4', name: 'Sports', icon: 'sports_soccer', color: '#F97316' },
    { id: 'cat-5', name: 'Entertainment', icon: 'theaters', color: '#EC4899' },
    { id: 'cat-6', name: 'Social', icon: 'groups', color: '#06B6D4' },
    { id: 'cat-7', name: 'Finance', icon: 'account_balance_wallet', color: '#EAB308' },
    { id: 'cat-8', name: 'Health', icon: 'fitness_center', color: '#10B981' },
    { id: 'cat-9', name: 'Work', icon: 'work', color: '#2563EB' },
    { id: 'cat-10', name: 'Nutrition', icon: 'restaurant', color: '#F59E0B' },
    { id: 'cat-11', name: 'Home', icon: 'home', color: '#6366F1' },
    { id: 'cat-12', name: 'Outdoor', icon: 'park', color: '#14B8A6' },
    { id: 'cat-13', name: 'Others', icon: 'more_horiz', color: '#64748B' },
];

const defaultPreferences: UserPreferences = {
  personality: 'smart',
  nickname: 'User',
  occupation: '',
  personalNotes: '',
  useMemory: true,
  useHistory: true,
  allowWebSearch: false,
  theme: 'dark',
  colorTheme: 'blue',
  language: 'en',
  size: 'md',
  pulseWidgets: [],
  aiSnapshotVerbosity: 'concise',
  defaultView: 'dashboard', // Always default to Today view
};

// FIX: Changed payload for 'newTask' to Partial<Checklist> to allow properties like categoryId.
export type ViewAction = 
    | { type: 'newTask', payload?: Partial<Checklist> } 
    | { type: 'newHabit' } 
    | { type: 'newEvent', payload: Partial<Event> }
    | { type: 'editTask', payload: Checklist } 
    | { type: 'editHabit', payload: Habit } 
    | { type: 'editEvent', payload: Event }
    | { type: 'newRequest', payload?: Partial<Request> }
    | null;

const App: React.FC = () => {
  // App State
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
    const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  
  // UI State
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [previousView, setPreviousView] = useState<AppView | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [autoCollapsedByViewport, setAutoCollapsedByViewport] = useState(false);
    const viewportRangeRef = useRef<'mobile' | 'tablet' | 'desktop' | null>(null);
  const [projectModalData, setProjectModalData] = useState<Project | 'new' | null>(null);
  const [categoryModalData, setCategoryModalData] = useState<UserCategory | 'new' | null>(null);
  const onCategoryCreateCallbackRef = useRef<((newCategoryId: string) => void) | null>(null);
  const [pendingConversation, setPendingConversation] = useState<Conversation | null>(null);
  const [panelChatId, setPanelChatId] = useState<string | null>(null);
  const [previewingFile, setPreviewingFile] = useState<ProjectFile | null>(null);
  const [targetSettingsTab, setTargetSettingsTab] = useState<string | undefined>();
  const [viewAction, setViewAction] = useState<ViewAction>(null);
  const [recentlyCompletedItemId, setRecentlyCompletedItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
        const [requestsViewMode, setRequestsViewMode] = useState<'list' | 'board'>(() => {
            try {
                const saved = localStorage.getItem('requests.viewMode.v1');
                if (saved === 'list' || saved === 'board') return saved;
            } catch {}
            return 'board';
        });
    const [isGlobalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [isMobileChatOpen, setMobileChatOpen] = useState(false);
  const [chatOpenMode, setChatOpenMode] = useState<'text' | 'voice' | null>(null);
  const [completingItemIds, setCompletingItemIds] = useState<Set<string>>(new Set());
  const [modalToClose, setModalToClose] = useState<string | null>(null);
    const [authSession, setAuthSession] = useState<AuthSession | null>(null);
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    // Show landing page by default - will be hidden when auth session is detected
    const [showLanding, setShowLanding] = useState(true);
    const lastSyncToastRef = useRef<number>(0);
        const [isFeedbackOpen, setFeedbackOpen] = useState(false);

    const maybeShowSyncFailureToast = (message?: string) => {
        const now = Date.now();
        if (now - lastSyncToastRef.current < 20000) return; // 20s cooldown
        lastSyncToastRef.current = now;
        setToastMessage(message || 'You are offline. Changes will sync when reconnected.');
    };
    const handleOpenFeedback = () => {
        setFeedbackOpen(true);
    };
    const handleCloseFeedback = () => setFeedbackOpen(false);
    const handleSubmitFeedback = async (payload: { email?: string; type: FeedbackType; message: string }) => {
        await feedbackService.submitFeedback({
            ...payload,
            metadata: {
                submittedAt: new Date().toISOString(),
                appView: currentView,
            },
        });
        setToastMessage('Thanks for the feedback!');
    };
  const [dashboardDate, setDashboardDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [scheduledNotifications, setScheduledNotifications] = useState<number[]>([]);
    const [pendingStoryId, setPendingStoryId] = useState<string | null>(null);


  const t = getT(preferences.language);

    // === Share/Import helpers ===
    type ShareEnvelope = { v: 1; type: 'checklist' | 'habit'; data: any };
    const encodeShare = (env: ShareEnvelope) => {
        try {
            const json = JSON.stringify(env);
            return btoa(unescape(encodeURIComponent(json)));
        } catch {
            return '';
        }
    };
    const decodeShare = (token: string): ShareEnvelope | null => {
        try {
            const json = decodeURIComponent(escape(atob(token)));
            const obj = JSON.parse(json);
            if (obj && obj.v === 1 && (obj.type === 'checklist' || obj.type === 'habit')) return obj as ShareEnvelope;
            return null;
        } catch {
            return null;
        }
    };

    const buildShareUrl = (token: string) => {
        if (typeof window === 'undefined') return '';
        const url = new URL(window.location.href);
        url.searchParams.set('import', token);
        return url.toString();
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setToastMessage('Share link copied to clipboard');
        } catch {
            // Fallback prompt
            window.prompt('Copy this link', text);
        }
    };


    // Load state from local storage or set initial example data
    useEffect(() => {
    try {
      const savedProjects = localStorage.getItem('projects_v4');
      const savedPrefs = localStorage.getItem('userPreferences_v3');

      if (savedPrefs) {
          const parsedPrefs = JSON.parse(savedPrefs);
          if (!parsedPrefs.pulseWidgets) parsedPrefs.pulseWidgets = [];
          if (!parsedPrefs.size) parsedPrefs.size = 'md';
          if (!parsedPrefs.aiSnapshotVerbosity) parsedPrefs.aiSnapshotVerbosity = 'concise';
          setPreferences(parsedPrefs);
      } else {
          setPreferences(defaultPreferences);
      }
      
                    if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
        
        // Don't automatically hide landing page - let auth session control this
        
        const savedConvos = localStorage.getItem('conversations_v3');
        if (savedConvos) setConversations(JSON.parse(savedConvos));

        const savedCategories = localStorage.getItem('userCategories_v2');
        if (savedCategories) setUserCategories(JSON.parse(savedCategories));

        const savedSkills = localStorage.getItem('skillCategories_v1');
        if (savedSkills) setSkillCategories(JSON.parse(savedSkills));

        const savedChecklists = localStorage.getItem('checklists_v7');
        if (savedChecklists) {
            setChecklists(JSON.parse(savedChecklists));
        }
        
    const savedHabits = localStorage.getItem('habits_v3');
    if(savedHabits) setHabits(JSON.parse(savedHabits));
    const savedStories = localStorage.getItem('stories_v1');
    if (savedStories) setStories(JSON.parse(savedStories));
        
        const savedNotes = localStorage.getItem('notes_v2');
        if(savedNotes) setNotes(JSON.parse(savedNotes));
        
    const savedFiles = localStorage.getItem('projectFiles_v1');
        if(savedFiles) setProjectFiles(JSON.parse(savedFiles));

        const savedEvents = localStorage.getItem('events_v1');
        if (savedEvents) setEvents(JSON.parse(savedEvents));

    const savedRequests = localStorage.getItem('requests_v1');
    if (savedRequests) setRequests(JSON.parse(savedRequests));

            } else {
                // Start empty for new users; offer CTA to load sample templates from the dashboard
                setProjects([]);
                setNotes([]);
                setConversations([]);
                setChecklists([]);
                setHabits([]);
                setEvents([]);
                setUserCategories([]);
                setStories([]);
                setCurrentView('dashboard');
                // Landing page already shown by default for new users
            }
      
            const savedSidebarCollapsed = localStorage.getItem('sidebarCollapsed');
            if (savedSidebarCollapsed !== null) {
                setSidebarCollapsed(JSON.parse(savedSidebarCollapsed));
            } else {
                // Default behavior: collapse on tablet widths (>=768px and <1024px)
                if (typeof window !== 'undefined') {
                    const w = window.innerWidth;
                    if (w >= 768 && w < 1024) {
                        setSidebarCollapsed(true);
                        setAutoCollapsedByViewport(true);
                    }
                }
            }

    } catch (error) { console.error("Failed to load data from localStorage", error); }
  }, []);

    // Track viewport range changes and auto-collapse/restore accordingly
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const getRange = (w: number): 'mobile' | 'tablet' | 'desktop' => {
            if (w < 768) return 'mobile';
            if (w < 1024) return 'tablet';
            return 'desktop';
        };

        // Initialize range ref
        viewportRangeRef.current = getRange(window.innerWidth);

        const handleResize = () => {
            const w = window.innerWidth;
            const newRange = getRange(w);
            const prevRange = viewportRangeRef.current;
            if (newRange !== prevRange) {
                // Entering tablet: collapse by default if not already collapsed
                if (newRange === 'tablet') {
                    if (!isSidebarCollapsed) {
                        setSidebarCollapsed(true);
                        setAutoCollapsedByViewport(true);
                    }
                }
                // Returning to desktop: restore if it was auto-collapsed
                if (newRange === 'desktop') {
                    if (autoCollapsedByViewport) {
                        setSidebarCollapsed(false);
                        setAutoCollapsedByViewport(false);
                    }
                }
                // On mobile we don't force any change; mobile drawer handles visibility
                viewportRangeRef.current = newRange;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isSidebarCollapsed, autoCollapsedByViewport]);

        const handleLoadSampleData = () => {
            const bundle = getCombinedSampleData();
        setProjects(bundle.projects);
        setConversations(bundle.conversations);
        setChecklists(bundle.checklists);
        setHabits(bundle.habits);
        setEvents(bundle.events);
        setUserCategories(bundle.userCategories);
        setNotes(bundle.notes);
        setProjectFiles(bundle.projectFiles);
        setStories(bundle.stories || []);
        try {
            localStorage.setItem('sampleLoaded_v1', 'true');
                localStorage.setItem('sampleTemplate_v1', 'combined');
        } catch {}
        setCurrentView('dashboard');
    };

    // Save state to local storage
    useEffect(() => {
        try {
            localStorage.setItem('projects_v4', JSON.stringify(projects));
            localStorage.setItem('conversations_v3', JSON.stringify(conversations));
            localStorage.setItem('checklists_v7', JSON.stringify(checklists));
            localStorage.setItem('habits_v3', JSON.stringify(habits));
            localStorage.setItem('events_v1', JSON.stringify(events));
            localStorage.setItem('stories_v1', JSON.stringify(stories));
            localStorage.setItem('requests_v1', JSON.stringify(requests));
            localStorage.setItem('userCategories_v2', JSON.stringify(userCategories));
            localStorage.setItem('skillCategories_v1', JSON.stringify(skillCategories));
            localStorage.setItem('userPreferences_v3', JSON.stringify(preferences));
            localStorage.setItem('notes_v2', JSON.stringify(notes));
            localStorage.setItem('projectFiles_v1', JSON.stringify(projectFiles));
            localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
            try { localStorage.setItem('requests.viewMode.v1', requestsViewMode); } catch {}
        } catch (error) { console.error("Failed to save data to localStorage", error); }
  }, [projects, conversations, checklists, habits, events, stories, requests, userCategories, skillCategories, preferences, notes, projectFiles, isSidebarCollapsed, requestsViewMode]);
  
  // Apply theme and color preferences to the UI
  useEffect(() => {
    const root = document.documentElement;
    // Theme
    if (preferences.theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    // Color
    const colorMap = {
      blue: { 600: '#3B82F6', 700: '#2563EB' },
      purple: { 600: '#8B5CF6', 700: '#7C3AED' },
      green: { 600: '#22C55E', 700: '#16A34A' },
      orange: { 600: '#F97316', 700: '#EA580C' },
    };
    const themeColors = colorMap[preferences.colorTheme] || colorMap.blue;
    root.style.setProperty('--color-primary-600', themeColors[600]);
    root.style.setProperty('--color-primary-700', themeColors[700]);
    // Size
    root.classList.remove('size-sm', 'size-lg');
    if (preferences.size === 'sm') {
        root.classList.add('size-sm');
    } else if (preferences.size === 'lg') {
        root.classList.add('size-lg');
    }
  }, [preferences.theme, preferences.colorTheme, preferences.size]);

  // Handle Notifications
  useEffect(() => {
      if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission();
      }
  }, []);

  useEffect(() => {
      scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId));
      
      if (!('Notification' in window) || Notification.permission !== 'granted') {
          return;
      }

      const newTimeouts: number[] = [];
      const now = new Date();

      events.forEach(event => {
          if (event.isAllDay || !event.startTime) return;

          const eventDateTime = new Date(`${event.startDate}T${event.startTime}`);
          if (eventDateTime <= now) return;

          event.reminders.forEach(reminder => {
              let reminderTime = new Date(eventDateTime);
              switch (reminder) {
                  case 'start': break;
                  case '5m': reminderTime.setMinutes(reminderTime.getMinutes() - 5); break;
                  case '15m': reminderTime.setMinutes(reminderTime.getMinutes() - 15); break;
                  case '1h': reminderTime.setHours(reminderTime.getHours() - 1); break;
                  case '1d': reminderTime.setDate(reminderTime.getDate() - 1); break;
              }

              const delay = reminderTime.getTime() - now.getTime();
              if (delay > 0) {
                  const timeoutId = window.setTimeout(() => {
                      const minsUntil = Math.max(0, Math.round((eventDateTime.getTime() - new Date().getTime()) / 60000));
                      const timeLabel = minsUntil === 0 ? 'now' : minsUntil < 60 ? `${minsUntil} min` : `${Math.floor(minsUntil/60)}h ${minsUntil%60 ? (minsUntil%60)+'m' : ''}`;
                      const body = event.description ? `${event.description}` : `Starts ${reminder === 'start' ? 'now' : `in ${timeLabel}`} (${event.startTime})`;
                      new Notification(event.title, {
                          body,
                          icon: '/vite.svg',
                      });
                  }, delay);
                  newTimeouts.push(timeoutId);
              }
          });
      });

      setScheduledNotifications(newTimeouts);

      return () => {
          newTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      };
  }, [events]);

    // --- Supabase Auth wiring ---
    useEffect(() => {
        if (!authService.isEnabled()) return;
        // Get initial session
        authService.getSession().then(setAuthSession).catch(() => {});
        // Subscribe to changes
        const unsub = authService.onAuthStateChange(setAuthSession);
        return () => unsub();
    }, []);

    // Show onboarding after auth if not completed yet
    useEffect(() => {
        if (authSession) {
            setShowLanding(false);
            setAuthModalOpen(false); // Close auth modal when user is authenticated
            // If preferences indicate onboarding not completed, open wizard
            const completed = (preferences.onboardingCompleted === true);
            if (!completed) setShowOnboarding(true);
        }
    }, [authSession]);

    useEffect(() => {
        if (!authSession) return;
        if (!authorizationNotificationService.isEnabled()) return;
        let verificationEmailSentAt: string | null = null;
        if (typeof window !== 'undefined') {
            try {
                const raw = window.localStorage.getItem(VERIFICATION_STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw) as { email?: string; sentAt?: string };
                    if (parsed?.email && parsed.email.toLowerCase() === (authSession.email || '').toLowerCase() && parsed.sentAt) {
                        verificationEmailSentAt = parsed.sentAt;
                    }
                }
            } catch (err) {
                console.warn('Failed to read cached verification timestamp', err);
            }
        }
        authorizationNotificationService
            .syncProfileWithAuth(authSession, { verificationEmailSentAt })
            .catch(err => console.warn('Failed to sync auth profile', err))
            .finally(() => {
                if (verificationEmailSentAt && typeof window !== 'undefined') {
                    window.localStorage.removeItem(VERIFICATION_STORAGE_KEY);
                }
            });
    }, [authSession]);

    // --- Cloud persistence (load on login, save on changes) ---
    const justLoadedFromCloudRef = useRef(false);
    useEffect(() => {
            const load = async () => {
                if (!authSession || !databaseService.isEnabled()) return;

                const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                if (useRelDb && relationalDb.isEnabled()) {
                    try {
                        const [cats, projs, lists, habs, evs, nts, files, strs, prefs, convos, reqs] = await Promise.all([
                            relationalDb.listCategories(),
                            relationalDb.listProjects(),
                            relationalDb.listChecklists(),
                            relationalDb.listHabits(),
                            relationalDb.listEvents(),
                            relationalDb.listNotes(),
                            relationalDb.listFiles(),
                            relationalDb.listStories(),
                            relationalDb.getPreferences(),
                            relationalDb.listConversations(),
                            relationalDb.listRequests(),
                        ]);
                        const anyData = (cats.length + projs.length + lists.length + habs.length + evs.length + nts.length + files.length + strs.length + (convos.length) + reqs.length + (prefs ? 1 : 0)) > 0;
                        if (anyData) {
                            justLoadedFromCloudRef.current = true;
                            setUserCategories(cats);
                            setProjects(projs);
                            setChecklists(lists);
                            setHabits(habs);
                            setEvents(evs);
                            setNotes(nts);
                            setProjectFiles(files);
                            setStories(strs);
                            if (prefs) setPreferences({ ...defaultPreferences, ...prefs });
                            setConversations(convos);
                            setRequests(reqs);
                            setToastMessage('Loaded your data from database');
                            setTimeout(() => { justLoadedFromCloudRef.current = false; }, 800);
                            return;
                        }
                    } catch (e) {
                        console.warn('Relational load failed, falling back to app_state', e);
                    }
                }

                const remote = await databaseService.loadAppState(authSession.userId);
                if (remote) {
                        justLoadedFromCloudRef.current = true;
                        setProjects(remote.projects || []);
                        setConversations(remote.conversations || []);
                        setChecklists(remote.checklists || []);
                        setHabits(remote.habits || []);
                        setEvents(remote.events || []);
                        setStories(remote.stories || []);
                        setUserCategories(remote.userCategories || []);
                        setPreferences({ ...defaultPreferences, ...(remote.preferences || {}) });
                        setNotes(remote.notes || []);
                        setProjectFiles(remote.projectFiles || []);
                        setRequests(remote.requests || []);
                        setToastMessage('Loaded your data from cloud');
                        // Clear flag after a short delay so subsequent local changes trigger save
                        setTimeout(() => { justLoadedFromCloudRef.current = false; }, 800);
                } else {
                        // No remote yet: seed with current local
                        const payload = collectAppState();
                        try { await databaseService.saveAppState(authSession.userId, payload); } catch {}
                }
            };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authSession?.userId]);

    const collectAppState = (): any => ({
        projects, conversations, checklists, habits, events, stories, requests, userCategories, preferences, notes, projectFiles,
    });

        // Dev-only: expose a migration helper to console for manual triggering
        useEffect(() => {
            if (typeof window !== 'undefined') {
                (window as any).__taskly_migrate = async () => {
                    const state = collectAppState();
                    const res = await migrateToRelational(state);
                    if (res.ok) setToastMessage('Migrated data to relational tables');
                    else setToastMessage('Migration failed: ' + (res.message || ''));
                    return res;
                };
            }
        }, []);

        // Setup offline reconciliation: on reconnect, push relational state
        useEffect(() => {
            const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
            if (!useRelDb || !relationalDb.isEnabled()) return;
            const unsubscribe = offlineSync.setup(collectAppState, migrateToRelational);
            return () => { unsubscribe && unsubscribe(); };
        }, []);

    // Debounced save when local state changes and user is logged in
        useEffect(() => {
            if (!authSession || !databaseService.isEnabled()) return;
            if (justLoadedFromCloudRef.current) return;
            const id = window.setTimeout(() => {
                const payload = collectAppState();
                const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                // Always keep JSON app_state up-to-date for backward compatibility
                databaseService.saveAppState(authSession.userId, payload).catch(() => {});
                // Optionally mirror to relational tables (idempotent upserts)
                if (useRelDb && relationalDb.isEnabled()) {
                    migrateToRelational(payload).catch(() => { try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {} });
                }
            }, 900);
            return () => clearTimeout(id);
        }, [authSession, projects, conversations, checklists, habits, events, stories, userCategories, preferences, notes, projectFiles]);

    // On load: handle "import" URL param to import a shared checklist or habit
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const token = params.get('import');
        if (!token) return;
        const env = decodeShare(token);
        if (!env) {
            // Clean bad param
            const url = new URL(window.location.href);
            url.searchParams.delete('import');
            window.history.replaceState({}, '', url.toString());
            return;
        }
        if (env.type === 'checklist') {
            const d = env.data as Partial<Checklist> & { tasks?: { text: string }[] };
            const created = handleCreateChecklist({
                name: d.name || 'Imported List',
                tasks: (d.tasks || []).map((t, i) => ({ id: `task-${Date.now()}-${i}`, text: t.text, completedAt: null })),
                completionHistory: [],
                priority: d.priority ?? 10,
                dueDate: d.dueDate || undefined,
                dueTime: d.dueTime || undefined,
                recurrence: d.recurrence || undefined,
            });
            setCurrentView('lists');
            setToastMessage(`Imported list: ${created.name}`);
        } else if (env.type === 'habit') {
            const d = env.data as Partial<Habit> & { tasks?: { text: string }[] };
            handleCreateHabit({
                name: d.name || 'Imported Habit',
                type: d.type === 'checklist' ? 'checklist' : 'daily_check_off',
                recurrence: d.recurrence || { type: 'daily', startDate: getISODate() },
                tasks: (d.tasks || []).map((t, i) => ({ id: `ht-${Date.now()}-${i}`, text: t.text, completedAt: null })),
            });
            setCurrentView('habits');
            setToastMessage('Imported habit');
        }
        // Remove the import param from the URL without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('import');
        window.history.replaceState({}, '', url.toString());
    }, []);

    // Share actions exposed to child views
    const handleShareChecklist = (checklist: Checklist) => {
        const env: ShareEnvelope = {
            v: 1,
            type: 'checklist',
            data: {
                name: checklist.name,
                tasks: checklist.tasks.map(t => ({ text: t.text })),
                priority: checklist.priority ?? 10,
                dueDate: checklist.dueDate || undefined,
                dueTime: checklist.dueTime || undefined,
                recurrence: checklist.recurrence || undefined,
            },
        };
        const token = encodeShare(env);
        if (!token) return;
        const url = buildShareUrl(token);
        copyToClipboard(url);
    };

    const handleShareHabit = (habit: Habit) => {
        const env: ShareEnvelope = {
            v: 1,
            type: 'habit',
            data: {
                name: habit.name,
                type: habit.type,
                recurrence: habit.recurrence,
                tasks: (habit.tasks || []).map(t => ({ text: t.text })),
            },
        };
        const token = encodeShare(env);
        if (!token) return;
        const url = buildShareUrl(token);
        copyToClipboard(url);
    };


    const handleUpdatePreferences = (newPreferences: Partial<UserPreferences>) => {
        // Merge locally for immediate UI response, and persist to relational DB if enabled
        setPreferences(prev => {
            const merged = { ...prev, ...newPreferences };
            try {
                const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                if (authSession && useRelDb && relationalDb.isEnabled()) {
                    relationalDb
                        .savePreferences(merged)
                            .catch(() => {
                            try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {}
                                maybeShowSyncFailureToast();
                        });
                }
            } catch {}
            return merged;
        });
    };
  const handleResetPreferences = () => setPreferences(defaultPreferences);
  
  const cleanupEmptyNote = (noteId: string | null) => {
    if (!noteId) return;
    const note = notes.find(n => n.id === noteId);
    if (note && note.name === 'Untitled Note') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = note.content;
        
        const textContent = tempDiv.textContent?.trim();

        if (textContent === 'Untitled Note' || textContent === '') {
            setNotes(prev => prev.filter(n => n.id !== noteId));
        }
    }
  };

    const completeOnboarding = (updates: Partial<UserPreferences>) => {
        handleUpdatePreferences(updates);
        setShowOnboarding(false);
        if (updates.defaultView) setCurrentView(updates.defaultView as AppView);
        setToastMessage('Welcome to Taskly!');
    };
  
  const handleNewChat = (projectId?: string) => {
    setPanelChatId(null);
    const newTempConversation: Conversation = { 
        id: `temp-convo-${Date.now()}`,
        name: "New Chat", 
        messages: [], 
        projectId 
    };
    setPendingConversation(newTempConversation);
    setActiveChatId(null);
    setActiveProjectId(null);
    setSelectedNoteId(null);
    if (isMobileSidebarOpen) setMobileSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    setPanelChatId(null);
    cleanupEmptyNote(selectedNoteId);
    setPreviousView(null);
    setPendingConversation(null);
    setActiveChatId(chatId);
    setActiveProjectId(null);
    setSelectedNoteId(null);
    if (isMobileSidebarOpen) setMobileSidebarOpen(false);
  };
  
  const handleSelectView = (view: AppView, tab?: string) => {
    if (isMobileChatOpen) {
      setMobileChatOpen(false);
    }
    setPanelChatId(null);
    cleanupEmptyNote(selectedNoteId);
    setPreviousView(null);
    setPendingConversation(null);
    if (view === 'settings' && tab) {
      setTargetSettingsTab(tab);
    } else {
      setTargetSettingsTab(undefined);
    }
    if (view === 'dashboard') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setDashboardDate(today);
    }
    setCurrentView(view);
    setActiveChatId(null);
    setActiveProjectId(null);
    setSelectedNoteId(null); // Always reset note selection
    if (isMobileSidebarOpen) setMobileSidebarOpen(false);
  };

    // Global search keyboard shortcut when not inside a Header (fallback)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                setGlobalSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handler);
            const openEvent = () => setGlobalSearchOpen(true);
            window.addEventListener('taskly.openSearch', openEvent as any);
            const onToast = (e: Event) => {
                const detail = (e as unknown as CustomEvent<string | { message: string }>).detail;
                const msg = typeof detail === 'string' ? detail : detail?.message;
                if (msg) setToastMessage(msg);
            };
            window.addEventListener('taskly.toast', onToast as any);
            // Conversion events wiring
            const onNewRequest = (e: Event) => {
                const detail = (e as unknown as CustomEvent<any>).detail || {};
                // Pre-populate requester from auth profile email if missing
                const payload = { ...detail } as any;
                if ((!payload.requester || String(payload.requester).trim().length === 0) && authSession?.email) {
                    payload.requester = authSession.email;
                }
                setViewAction({ type: 'newRequest', payload });
                setCurrentView('requestIntake');
            };
            const onCreateStoryFromRequest = (e: Event) => {
                const detail = (e as unknown as CustomEvent<any>).detail as { id: string };
                const req = detail?.id ? requests.find(r => r.id === detail.id) : undefined;
                if (!req) return;
                // Create a Story seeded from request
                handleCreateStory({
                    title: req.product || (req.problem?.slice(0, 60) || 'New Story'),
                    description: [
                        req.problem ? `Problem: ${req.problem}` : '',
                        req.outcome ? `Desired outcome: ${req.outcome}` : '',
                        req.valueProposition ? `Value: ${req.valueProposition}` : '',
                        req.affectedUsers ? `Users: ${req.affectedUsers}` : '',
                        req.details ? `Details: ${req.details}` : '',
                    ].filter(Boolean).join('\n\n'),
                    // If the request already has linked tasks, carry them into the story
                    linkedTaskIds: req.linkedTaskIds || [],
                    // Carry over skills from the request
                    skillIds: req.skillIds || [],
                });
            };
            const onCreateTasksForRequest = (e: Event) => {
                const detail = (e as unknown as CustomEvent<any>).detail as { id: string };
                const req = detail?.id ? requests.find(r => r.id === detail.id) : undefined;
                if (!req) return;
                // Create a checklist from the request problem and link back
                const name = (req.problem || req.product || 'Request Tasks').slice(0, 80);
                const created = handleCreateChecklist({ name, completionHistory: [], tasks: [] });
                const merged = Array.from(new Set([...(req.linkedTaskIds || []), created.id]));
                handleUpdateRequest(req.id, { linkedTaskIds: merged });
                setToastMessage('Tasks created and linked');
            };
            window.addEventListener('taskly.newRequest', onNewRequest as any);
            window.addEventListener('taskly.createStoryFromRequest', onCreateStoryFromRequest as any);
            window.addEventListener('taskly.createTasksForRequest', onCreateTasksForRequest as any);
            return () => {
                window.removeEventListener('keydown', handler);
                window.removeEventListener('taskly.openSearch', openEvent as any);
                window.removeEventListener('taskly.toast', onToast as any);
                window.removeEventListener('taskly.newRequest', onNewRequest as any);
                window.removeEventListener('taskly.createStoryFromRequest', onCreateStoryFromRequest as any);
                window.removeEventListener('taskly.createTasksForRequest', onCreateTasksForRequest as any);
            };
    }, []);
  
  const handleSelectNote = (noteId: string | null) => {
    setPanelChatId(null);
    if (selectedNoteId !== noteId) {
        cleanupEmptyNote(selectedNoteId);
    }
    if (noteId && currentView !== 'notes') {
        setPreviousView(currentView);
    }
    setPendingConversation(null);
    setActiveChatId(null);
    setActiveProjectId(null);
    setSelectedNoteId(noteId);
    if (noteId) {
        setCurrentView('notes');
    }
    if (isMobileSidebarOpen) setMobileSidebarOpen(false);
  };

  const handleCloseNote = () => {
    cleanupEmptyNote(selectedNoteId);
    setSelectedNoteId(null);
    if (previousView) {
        setCurrentView(previousView);
        setPreviousView(null);
    }
  };

  const handleSelectProject = (projectId: string) => {
    setPanelChatId(null);
    cleanupEmptyNote(selectedNoteId);
    setPreviousView(null);
    setPendingConversation(null);
    setActiveProjectId(projectId);
    setActiveChatId(null);
    setSelectedNoteId(null);
  };
  
    const handleToggleSidebarCollapse = () => {
        // User manually toggled; disable auto behavior until next breakpoint change
        setAutoCollapsedByViewport(false);
        setSidebarCollapsed(prev => !prev);
    };

  // Project Handlers
  const handleCreateProject = (projectData: Omit<Project, 'id'>) => {
    const newProject: Project = { id: `proj-${Date.now()}`, ...projectData };
    setProjects(prev => [newProject, ...prev]);
    setToastMessage(t('project_created_success'));
  };
  const handleUpdateProject = (projectId: string, updatedData: Partial<Omit<Project, 'id'>>) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updatedData } : p));
  };
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setConversations(prev => prev.map(c => c.projectId === projectId ? { ...c, projectId: undefined } : c));
    setNotes(prev => prev.map(n => n.projectId === projectId ? { ...n, projectId: undefined } : n));
    setChecklists(prev => prev.map(cl => cl.projectId === projectId ? { ...cl, projectId: undefined } : cl));
    setHabits(prev => prev.map(h => h.projectId === projectId ? { ...h, projectId: undefined } : h));
    setProjectFiles(prev => prev.filter(f => f.projectId !== projectId));
    if (activeProjectId === projectId) setActiveProjectId(null);
  };
  const handleSaveProjectFromModal = (data: Omit<Project, 'id'>) => {
    if (projectModalData && projectModalData !== 'new') {
        handleUpdateProject(projectModalData.id, data);
    } else {
        handleCreateProject(data);
    }
  };

  // Note Handlers
  const handleCreateNote = (details: { projectId?: string; name?: string; content?: string } = {}) => {
    const { projectId, name = 'Untitled Note', content = `<h1>${name}</h1><p></p>` } = details;
    const newNote: Note = { 
        id: `note-${Date.now()}`, 
        name, 
        content, 
        projectId, 
        lastModified: new Date().toISOString() 
    };
    setNotes(prev => [...prev, newNote]);
    handleSelectNote(newNote.id);
  };
  const handleUpdateNote = (noteId: string, updates: Partial<Omit<Note, 'id'>>) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updates, lastModified: new Date().toISOString() } : n));
  };
  const handleDeleteNote = (noteId: string) => {
      const noteToDelete = notes.find(n => n.id === noteId);
      if (noteToDelete?.fileIds) {
          // Delete associated files when deleting the note
          setProjectFiles(prev => prev.filter(f => !noteToDelete.fileIds?.includes(f.id)));
      }
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if(selectedNoteId === noteId) setSelectedNoteId(null);
  };

  // File Handlers
  const handleUploadFiles = (files: FileList, projectId: string, noteId?: string) => {
    const projectFileCount = projectFiles.filter(f => f.projectId === projectId).length;
    if (projectFileCount + files.length > 20) {
        alert(`Cannot upload. A project can hold a maximum of 20 files.`);
        return;
    }

    const newFiles: ProjectFile[] = [];
    const filePromises = Array.from(files).map(file => {
        return new Promise<ProjectFile>((resolve, reject) => {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/markdown'];
            if (!allowedTypes.includes(file.type)) {
                alert(`File type for ${file.name} is not supported.`);
                return reject('Unsupported file type');
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                alert(`File ${file.name} is too large. Maximum size is 10MB.`);
                return reject('File too large');
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const newFile: ProjectFile = {
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.name,
                    mimeType: file.type,
                    size: file.size,
                    data: (event.target?.result as string).split(',')[1], // Get base64 part
                    projectId: projectId,
                };
                newFiles.push(newFile);
                resolve(newFile);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    });

    Promise.all(filePromises).then((createdFiles) => {
        setProjectFiles(prev => [...prev, ...createdFiles]);
        if (noteId) {
            const newFileIds = createdFiles.map(f => f.id);
            setNotes(prev => prev.map(n => 
                n.id === noteId ? { ...n, fileIds: [...(n.fileIds || []), ...newFileIds], lastModified: new Date().toISOString() } : n
            ));
        }
    }).catch(error => console.error("Error uploading files:", error));
  };

  const handleDeleteFile = (fileId: string) => {
      setProjectFiles(prev => prev.filter(f => f.id !== fileId));
      setNotes(prev => prev.map(n => ({
          ...n,
          fileIds: n.fileIds?.filter(id => id !== fileId)
      })));
  };

  // Conversation Handlers
    const handleMoveConversationToProject = (conversationId: string, projectId?: string) => {
        setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, projectId: projectId } : c
        ));
        // Persist change in relational DB if enabled
        try {
            const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                    if (authSession && useRelDb && relationalDb.isEnabled()) {
                        const convo = conversations.find(c => c.id === conversationId);
                        const name = convo?.name || 'Chat';
                        relationalDb.upsertConversation({ id: conversationId, name, projectId }).catch(() => {
                            try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {}
                            maybeShowSyncFailureToast();
                        });
                    }
        } catch {}
    };

  const handleApproveSuggestedTask = (conversationId: string, messageId: string, taskText: string, dueDate?: string) => {
      handleCreateChecklist({ name: taskText, completionHistory: [], tasks: [], dueDate: dueDate || undefined });
      
      setConversations(prev => prev.map(convo => {
          if (convo.id !== conversationId) return convo;
          
          const newMessages = convo.messages.map(msg => {
              if (msg.id !== messageId || !msg.suggestions) return msg;
              
              const newSuggestions = msg.suggestions.map(sugg => 
                  sugg.text === taskText ? { ...sugg, isApproved: true } : sugg
              );
              return { ...msg, suggestions: newSuggestions };
          });
          
          return { ...convo, messages: newMessages };
      }));
  };
  
  const handleApproveAllSuggestedTasks = (conversationId: string, messageId: string) => {
    let listCreated = false;
    let listName = '';

    setConversations(prev => prev.map(convo => {
        if (convo.id !== conversationId) return convo;

        const message = convo.messages.find(msg => msg.id === messageId);
        if (!message || !message.suggestions || !message.suggestionListName) return convo;
        
        if (!listCreated) {
            listName = message.suggestionListName;
            const tasksToCreate: Task[] = message.suggestions.map((sugg, i) => ({
                id: `task-approved-${Date.now()}-${i}`,
                text: sugg.text,
                completedAt: null,
            }));
            handleCreateChecklist({ name: listName, tasks: tasksToCreate, completionHistory: [] });
            listCreated = true;
        }

        const newMessages = convo.messages.map(msg => {
            if (msg.id !== messageId) return msg;
            return {
                ...msg,
                suggestions: msg.suggestions?.map(s => ({ ...s, isApproved: true }))
            };
        });
        return { ...convo, messages: newMessages };
    }));
    if (listCreated) {
        setToastMessage(`List '${listName}' created!`);
    }
  };


  // Category Handlers
  const handleRequestNewCategory = (callback?: (newCategoryId: string) => void) => {
      if (callback) {
          onCategoryCreateCallbackRef.current = callback;
      }
      setCategoryModalData('new');
  };
  const handleSaveCategoryFromModal = (categoryData: Omit<UserCategory, 'id'>) => {
    const newCategory: UserCategory = { id: `cat-${Date.now()}`, ...categoryData };
    setUserCategories(prev => [...prev, newCategory]);
    if (onCategoryCreateCallbackRef.current) {
        onCategoryCreateCallbackRef.current(newCategory.id);
    }
    setToastMessage(t('category_created_success'));
    setCategoryModalData(null);
    onCategoryCreateCallbackRef.current = null;
  };
  const handleUpdateCategoryFromModal = (categoryId: string, updatedData: Partial<Omit<UserCategory, 'id'>>) => {
    setUserCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, ...updatedData } : cat));
    setCategoryModalData(null);
  };
  const handleDeleteCategory = (categoryId: string) => {
    setUserCategories(prev => prev.filter(cat => cat.id !== categoryId));
    setChecklists(prev => prev.map(cl => cl.categoryId === categoryId ? { ...cl, categoryId: undefined } : cl));
    setHabits(prev => prev.map(h => h.categoryId === categoryId ? { ...h, categoryId: undefined } : h));
    setCategoryModalData(null);
  };

  // Skills Handlers
  const handleUpdateSkills = (categories: SkillCategory[]) => {
    setSkillCategories(categories);
    setToastMessage('Skills updated successfully');
  };

  const handleGenerateSkills = async () => {
    if (!preferences.occupation) {
      setToastMessage('Please set your occupation in Profile settings first');
      return;
    }

    try {
      // Use parseAIResponse with minimal history for skill generation
      const prompt = `Generate a comprehensive list of professional skills for a ${preferences.occupation}.
      
Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "categories": [
    {
      "name": "Category Name",
      "skills": [
        { "name": "Skill Name", "description": "Brief description" }
      ]
    }
  ]
}

Generate 4-6 skill categories relevant to this role, with 5-10 skills per category.
Focus on practical, industry-standard skills.
Keep descriptions concise (10-15 words max).`;

      const aiResponse = await parseAIResponse(
        [], // empty history
        prompt,
        'settings',
        preferences
      );
      
      // Parse the JSON from the response
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Convert to our SkillCategory format
      const newCategories: SkillCategory[] = parsed.categories.map((cat: any, idx: number) => ({
        id: `cat_ai_${Date.now()}_${idx}`,
        name: cat.name,
        skills: cat.skills.map((skill: any, skillIdx: number) => ({
          id: `skill_ai_${Date.now()}_${idx}_${skillIdx}`,
          name: skill.name,
          description: skill.description,
          categoryId: `cat_ai_${Date.now()}_${idx}`,
        }))
      }));

      // Merge with existing skills (avoid duplicates)
      setSkillCategories(prev => {
        const existingNames = new Set(prev.map(c => c.name.toLowerCase()));
        const filtered = newCategories.filter(c => !existingNames.has(c.name.toLowerCase()));
        return [...prev, ...filtered];
      });

      setToastMessage(`Generated ${newCategories.length} skill categories for ${preferences.occupation}`);
    } catch (error) {
      console.error('Failed to generate skills:', error);
      setToastMessage('Failed to generate skills. Please try again.');
    }
  };
  
  const triggerCompletionAnimation = (id: string) => {
    setRecentlyCompletedItemId(id);
    setTimeout(() => setRecentlyCompletedItemId(null), 500);
  };

  // Checklist and Task Handlers
  const handleCreateChecklist = (checklistData: Omit<Checklist, 'id'>): Checklist => {
    const newChecklist: Checklist = { id: `cl-${Date.now()}`, ...checklistData, completionHistory: [], tasks: checklistData.tasks || [] };
    setChecklists(prev => [newChecklist, ...prev]);
    setToastMessage(t('task_created_success'));
    return newChecklist;
  };

    // === Requests Handlers ===
    const handleCreateRequest = (payload: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>) => {
        // Simple team routing heuristic based on product
        // e.g., if product includes 'billing', auto-prefix requester/team
        const routedRequester = (() => {
            const p = (payload.product || '').toLowerCase();
            if (p.includes('billing') || p.includes('payment')) return `${payload.requester} · Team: Billing`;
            if (p.includes('onboarding') || p.includes('signup')) return `${payload.requester} · Team: Growth`;
            if (p.includes('calendar') || p.includes('event')) return `${payload.requester} · Team: Calendar`;
            return payload.requester;
        })();
    const req: Request = { id: `req-${Date.now()}`, ...payload, requester: routedRequester, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        setRequests(prev => [req, ...prev]);
        setToastMessage('Request submitted');
        // Mirror to relational DB if enabled
        try {
            const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
            if (authSession && useRelDb && relationalDb.isEnabled()) {
                relationalDb.upsertRequest(req).catch(() => { try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {} maybeShowSyncFailureToast(); });
            }
        } catch {}
    };
    const handleUpdateRequest = (id: string, updates: Partial<Request>) => {
            const updated = { ...updates, updatedAt: new Date().toISOString() } as Partial<Request>;
            const prevReq = requests.find(r => r.id === id);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
            // Mirror to relational DB if enabled
            try {
                const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                if (authSession && useRelDb && relationalDb.isEnabled()) {
                    const current = prevReq;
                    const merged = current ? { ...current, ...updated } : null;
                    if (merged) {
                      relationalDb.upsertRequest(merged as any).catch(() => { try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {} maybeShowSyncFailureToast(); });
                      // If status changed, log a request update entry
                      if (current && updates.status && updates.status !== current.status) {
                        const action = `Status changed from ${current.status} -> ${updates.status}`;
                        relationalDb.addRequestUpdate({ requestId: id, author: preferences.nickname || 'User', action }).catch(() => {});
                      }
                    }
                }
            } catch {}
    };
    const handleDeleteRequest = (id: string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
        try {
            const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
            if (authSession && useRelDb && relationalDb.isEnabled()) {
                relationalDb.deleteRequest(id).catch(() => { try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {} maybeShowSyncFailureToast(); });
            }
        } catch {}
    };

        // Move request across board columns (update status)
        const handleMoveRequestStatus = (id: string, to: Request['status']) => {
            const r = requests.find(x => x.id === id);
            if (!r) return;
            handleUpdateRequest(id, { status: to });
        };

        // AI: Generate stories from a request and move request to in_progress
        const handleGenerateStoriesFromRequest = async (id: string) => {
            const r = requests.find(x => x.id === id);
            if (!r) return;
            try {
                const ideas = await generateStoriesFromRequest(r);
                if (!ideas.length) {
                    setToastMessage('AI could not generate stories');
                    return;
                }
                // Create stories and link tasks later (optional)
                const created: Story[] = ideas.map((it) => ({
                    id: `story-${Date.now()}-${Math.random()}`,
                    title: it.title,
                    description: it.description,
                    projectId: undefined,
                    categoryId: undefined,
                    status: 'in_progress',
                    acceptanceCriteria: [],
                    linkedTaskIds: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }));
                setStories(prev => [...created, ...prev]);
                // Optionally persist to relational DB
                try {
                    const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                    if (authSession && useRelDb && relationalDb.isEnabled()) {
                        for (const s of created) {
                            await relationalDb.upsertStory({ id: s.id, title: s.title, description: s.description, projectId: s.projectId, categoryId: s.categoryId, status: s.status, acceptanceCriteria: s.acceptanceCriteria, estimatePoints: s.estimatePoints, estimateTime: s.estimateTime, linkedTaskIds: s.linkedTaskIds, assigneeUserId: s.assigneeUserId, assigneeName: s.assigneeName, requesterUserId: s.requesterUserId, requesterName: s.requesterName });
                        }
                    }
                } catch {}
                // Move request to in_progress (work started)
                handleUpdateRequest(id, { status: 'in_progress' });
                setToastMessage(`Created ${created.length} stor${created.length === 1 ? 'y' : 'ies'} from request`);
            } catch (e) {
                setToastMessage('Failed to generate stories');
            }
        };

    // Naive status sync: if all linked tasks completed, mark request done; if any linked tasks exist and some are open, mark in_progress
    useEffect(() => {
        if (!requests.length) return;
        setRequests(prev => prev.map(r => {
            if (!r.linkedTaskIds || r.linkedTaskIds.length === 0) return r;
            const linked = checklists.filter(cl => r.linkedTaskIds.includes(cl.id));
            if (linked.length === 0) return r;
            const allSubtasks = linked.flatMap(cl => cl.tasks);
            const total = allSubtasks.length;
            const done = allSubtasks.filter(t => !!t.completedAt).length;
            let nextStatus: Request['status'] | null = null;
            if (total > 0 && done === total) nextStatus = 'done';
            else if (total > 0 && done < total) nextStatus = 'in_progress';
            if (nextStatus && nextStatus !== r.status) {
                const merged = { ...r, status: nextStatus, updatedAt: new Date().toISOString() };
                // Mirror to relational
                try {
                    const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                    if (authSession && useRelDb && relationalDb.isEnabled()) {
                        relationalDb.upsertRequest(merged).catch(() => { try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {} });
                    }
                } catch {}
                return merged;
            }
            return r;
        }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checklists]);
  const handleUpdateChecklist = (checklistId: string, updatedData: Partial<Omit<Checklist, 'id'>>) => {
    setChecklists(prev => prev.map(cl => cl.id === checklistId ? { ...cl, ...updatedData } : cl));
  };
  const handleDeleteChecklist = (checklistId: string) => {
    setChecklists(prev => prev.filter(cl => cl.id !== checklistId));
  };
  const handleDuplicateChecklist = (checklist: Checklist) => {
    const duplicatedData: Omit<Checklist, 'id'> = {
        ...checklist,
        name: `${checklist.name} (Copy)`,
        completionHistory: [],
        tasks: checklist.tasks.map(t => ({...t, id: `task-dup-${Date.now()}-${Math.random()}`, completedAt: null})),
        sourceNoteId: undefined, 
        generatedChecklistId: undefined,
        priority: (checklist.priority || 90) + 1
    };
    handleCreateChecklist(duplicatedData);
  };
  const handleCreateTask = (checklistId: string, text: string) => {
    const newTask: Task = { id: `task-${Date.now()}`, text, completedAt: null };
    setChecklists(prev => prev.map(cl => cl.id === checklistId ? { ...cl, tasks: [...cl.tasks, newTask] } : cl));
  };
  const handleToggleTask = (checklistId: string, taskId: string) => {
    const today = getISODate();
    let parentCompleted = false;

    setChecklists(prev => prev.map(cl => {
        if (cl.id !== checklistId) return cl;

        const taskToToggle = cl.tasks.find(t => t.id === taskId);
        if (!taskToToggle) return cl;
        
        const isCompletingSubtask = !taskToToggle.completedAt;
        if (isCompletingSubtask) triggerCompletionAnimation(checklistId);

        const newTasks = cl.tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completedAt: task.completedAt ? null : today };
            }
            return task;
        });

        const allTasksCompletedEver = newTasks.length > 0 && newTasks.every(t => t.completedAt);
        const completedTasksForDate = newTasks.filter(t => t.completedAt === today).length;
        const allTasksCompletedForDate = newTasks.length > 0 && completedTasksForDate === newTasks.length;

        const allTasksCompleted = cl.recurrence ? allTasksCompletedForDate : allTasksCompletedEver;
        
        const isCompleted = cl.completionHistory.includes(today);
        let newCompletionHistory = [...cl.completionHistory];

        if (allTasksCompleted && !isCompleted) {
            parentCompleted = true; // Flag that parent is now complete
            // Defer state update to animation handler
        } else if (!allTasksCompleted && isCompleted) {
            newCompletionHistory = newCompletionHistory.filter(d => d !== today);
        }
        
        return { ...cl, tasks: newTasks, completionHistory: newCompletionHistory };
    }));
    
    if (parentCompleted) {
        setTimeout(() => setModalToClose(checklistId), 200);
        setCompletingItemIds(prev => new Set(prev).add(checklistId));
        setTimeout(() => {
            setChecklists(prev => prev.map(cl => {
                 if (cl.id !== checklistId) return cl;
                 const newCompletionHistory = [...cl.completionHistory];
                 if (!newCompletionHistory.includes(today)) newCompletionHistory.push(today);
                 return { ...cl, completionHistory: newCompletionHistory };
            }));
            setCompletingItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(checklistId);
                return newSet;
            });
        }, 400);
    }
  };
  const handleToggleSingleTaskCompletion = (checklistId: string, date: string) => {
    const checklist = checklists.find(cl => cl.id === checklistId);
    if (!checklist) return;
    const isCompleting = !checklist.completionHistory.includes(date);

    if (isCompleting) {
        setCompletingItemIds(prev => new Set(prev).add(checklistId));
        setTimeout(() => {
            setChecklists(prev => prev.map(cl => {
                if (cl.id !== checklistId) return cl;
                return { ...cl, completionHistory: [...cl.completionHistory, date] };
            }));
            setCompletingItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(checklistId);
                return newSet;
            });
        }, 400); // Animation duration
    } else {
        setChecklists(prev => prev.map(cl => {
            if (cl.id !== checklistId) return cl;
            return { ...cl, completionHistory: cl.completionHistory.filter(d => d !== date) };
        }));
    }
  };
  const handleUpdateTask = (checklistId: string, taskId: string, newText: string) => {
    setChecklists(prev => prev.map(cl => cl.id !== checklistId ? cl : { ...cl, tasks: cl.tasks.map(task => task.id === taskId ? { ...task, text: newText } : task) }));
  };
  const handleDeleteTask = (checklistId: string, taskId: string) => {
    setChecklists(prev => prev.map(cl => cl.id !== checklistId ? cl : { ...cl, tasks: cl.tasks.filter(task => task.id !== taskId) }));
  };
  const handleCreateTaskInProject = (projectId: string, taskText: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Create as a single task
    const newSingleTask: Omit<Checklist, 'id'> = {
        name: taskText,
        completionHistory: [],
        tasks: [],
        projectId: projectId,
        categoryId: project.categoryId,
    };
    handleCreateChecklist(newSingleTask);
  };
  
  // Habit Handlers
  const handleCreateHabit = (habitData: Omit<Habit, 'id' | 'completionHistory'>) => {
    const newHabit: Habit = { id: `habit-${Date.now()}`, completionHistory: [], ...habitData, priority: 10 };
    setHabits(prev => [...prev, newHabit]);
    setToastMessage(t('habit_created_success'));
  };
  const handleUpdateHabit = (habitId: string, updatedData: Partial<Omit<Habit, 'id'>>) => {
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, ...updatedData } : h));
  };
  const handleDeleteHabit = (habitId: string) => {
     setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const handleUpdateItemPriority = (itemId: string, newPriority: number, itemType: 'task' | 'habit') => {
      if (itemType === 'task') {
          setChecklists(prev => prev.map(cl => cl.id === itemId ? { ...cl, priority: newPriority } : cl));
      } else {
          setHabits(prev => prev.map(h => h.id === itemId ? { ...h, priority: newPriority } : h));
      }
  };

  const handleToggleHabitCompletion = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const isCompleting = !habit.completionHistory.includes(date);

    if (isCompleting) {
        setCompletingItemIds(prev => new Set(prev).add(habitId));
        setTimeout(() => {
            setHabits(prev => prev.map(h => {
                if (h.id !== habitId) return h;
                return { ...h, completionHistory: [...h.completionHistory, date] };
            }));
            setCompletingItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(habitId);
                return newSet;
            });
        }, 400);
    } else {
        setHabits(prev => prev.map(h => {
            if (h.id !== habitId) return h;
            return { ...h, completionHistory: h.completionHistory.filter(d => d !== date) };
        }));
    }
  };
  const handleAddTaskToHabit = (habitId: string, text: string) => {
    const newTask: Task = { id: `ht-${Date.now()}`, text, completedAt: null };
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, tasks: [...(h.tasks || []), newTask] } : h));
  };
  const handleToggleHabitTask = (habitId: string, taskId: string, date: string) => {
    let parentCompleted = false;

    setHabits(prevHabits => prevHabits.map(h => {
      if (h.id !== habitId || !h.tasks) return h;
      
      const taskToToggle = h.tasks.find(t => t.id === taskId);
      if (!taskToToggle) return h;

      const isCompletingSubtask = !taskToToggle.completedAt;
      if (isCompletingSubtask) triggerCompletionAnimation(habitId);

      const newTasks = h.tasks.map(t => {
          if (t.id === taskId) {
              return { ...t, completedAt: isCompletingSubtask ? date : null };
          }
          return t;
      });
      
      const completedTasksForDate = newTasks.filter(t => t.completedAt === date).length;
      const allTasksCompletedForDate = newTasks.length > 0 && completedTasksForDate === newTasks.length;

      if (allTasksCompletedForDate) {
          parentCompleted = true;
          setTimeout(() => setModalToClose(habitId), 200);
      }
      
      return { ...h, tasks: newTasks };
    }));

    if (parentCompleted) {
        setCompletingItemIds(prev => new Set(prev).add(habitId));
        setTimeout(() => {
            setHabits(prev => prev.map(h => {
                if (h.id !== habitId) return h;
                const newHistory = [...h.completionHistory];
                if (!newHistory.includes(date)) newHistory.push(date);
                return { ...h, completionHistory: newHistory };
            }));
            setCompletingItemIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(habitId);
                return newSet;
            });
        }, 400);
    }
  };
  const handleDeleteHabitTask = (habitId: string, taskId: string) => {
    setHabits(prev => prev.map(h => h.id !== habitId || !h.tasks ? h : { ...h, tasks: h.tasks.filter(t => t.id !== taskId) }));
  };

  // Event Handlers
  const handleCreateEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = { id: `event-${Date.now()}`, ...eventData };
    setEvents(prev => [newEvent, ...prev]);
  };
  const handleUpdateEvent = (eventId: string, updatedData: Partial<Omit<Event, 'id'>>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updatedData } : e));
  };
  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };
    const handleNewEvent = (date: string) => {
        setViewAction({ type: 'newEvent', payload: { startDate: date } });
    };
    const handleNewEventAt = (date: string, startTime: string, endTime: string) => {
        setViewAction({ type: 'newEvent', payload: { startDate: date, endDate: date, startTime, endTime } });
    };

    // Stories Handlers (lifted to component scope)
    const handleCreateStory = (payload?: Partial<Story>) => {
        const now = new Date().toISOString();
        const newStory: Story = {
            id: `st-${Date.now()}`,
            title: payload?.title || 'Untitled Story',
            description: payload?.description || '',
            status: payload?.status || 'backlog',
            projectId: payload?.projectId,
            categoryId: payload?.categoryId,
            acceptanceCriteria: payload?.acceptanceCriteria || [],
            estimatePoints: payload?.estimatePoints,
            estimateTime: payload?.estimateTime,
            linkedTaskIds: payload?.linkedTaskIds || [],
            skillIds: payload?.skillIds || [],
            createdAt: now,
            updatedAt: now,
        };
        setStories(prev => [newStory, ...prev]);
        setCurrentView('storyEditor');
        setPendingStoryId(newStory.id);
    };
    const handleSelectStory = (id: string) => {
        setPendingStoryId(id);
        setCurrentView('storyEditor');
    };
    const handleUpdateStory = (id: string, updates: Partial<Story>) => {
        setStories(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s));
    };
    const handleDeleteStory = (id: string) => {
        setStories(prev => prev.filter(s => s.id !== id));
        if (pendingStoryId === id) {
            setPendingStoryId(null);
            setCurrentView('stories');
        }
    };
    const handleMoveStoryStatus = (id: string, status: StoryStatus) => {
        handleUpdateStory(id, { status });
    };

  const handleSendMessage = async (messageText: string) => {
    let currentChatId = activeChatId;
    let newConversationCreated = false;

    if (pendingConversation) {
        const title = await generateTitleForChat(messageText);
        const newConversation: Conversation = { 
            ...pendingConversation,
            id: `convo-${Date.now()}`, // Final ID
            name: title,
        };
        currentChatId = newConversation.id;
        setConversations(prev => [...prev, newConversation]);
        setPendingConversation(null);
        setActiveChatId(currentChatId);
        newConversationCreated = true;

                // Persist new conversation in relational DB if enabled
                try {
                    const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                    if (authSession && useRelDb && relationalDb.isEnabled()) {
                                await relationalDb.upsertConversation({ id: newConversation.id, name: newConversation.name, projectId: newConversation.projectId });
                    }
                } catch {
                    try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {}
                            maybeShowSyncFailureToast();
                }
    }
    
    if (!currentChatId) return;

    const userMessage: Message = { id: `msg-${Date.now()}`, sender: Sender.User, text: messageText };
    
    setConversations(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, userMessage] } : c));
        // Persist user message to relational DB if enabled
        try {
            const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
            if (authSession && useRelDb && relationalDb.isEnabled()) {
                await relationalDb.addMessage(currentChatId, userMessage);
            }
        } catch {
            try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {}
            maybeShowSyncFailureToast();
        }
    setIsLoading(true);

    try {
        const currentConvo = conversations.find(c => c.id === currentChatId);
        const history = (newConversationCreated ? [] : currentConvo?.messages) || [];
        const projectContext = currentConvo?.projectId ? projects.find(p => p.id === currentConvo.projectId) : undefined;
        
        // Find attached files if context is a note
        let filesForContext: ProjectFile[] = [];
        if(projectContext && selectedNoteId){
            const note = notes.find(n => n.id === selectedNoteId);
            if(note?.fileIds){
                filesForContext = projectFiles.filter(f => note.fileIds?.includes(f.id));
            }
        }
        
        // Build a snapshot of project-related context so AI can reason about all user objects
        let projectSnapshot: string | undefined;
        if (projectContext) {
            try {
                const verbose = (preferences.aiSnapshotVerbosity || 'concise') === 'detailed';
                const taskLimit = verbose ? 60 : 30;
                const openPerList = verbose ? 10 : 5;
                const noteLimit = verbose ? 20 : 10;
                const storyLimit = verbose ? 30 : 15;
                const eventLimit = verbose ? 20 : 10;

                const projectTasks = checklists
                    .filter(cl => cl.projectId === projectContext.id)
                    .slice(0, taskLimit)
                    .map(cl => {
                        const open = cl.tasks.filter(t => !t.completedAt).slice(0, openPerList).map(t => `- ${t.text}`).join('\n');
                        const due = cl.dueDate ? ` due:${cl.dueDate}${cl.dueTime ? ' ' + cl.dueTime : ''}` : '';
                        return `• List: ${cl.name}${due}${open ? `\n${open}` : ''}`;
                    }).join('\n');

                const projectNotes = notes
                    .filter(n => n.projectId === projectContext.id)
                    .slice(0, noteLimit)
                    .map(n => `• Note: ${n.name}`).join('\n');

                const projectStories = stories
                    .filter(s => s.projectId === projectContext.id)
                    .slice(0, storyLimit)
                    .map(s => `• Story: ${s.title} [${s.status}]`).join('\n');

                const projectEvents = events
                    .filter(e => e.projectId === projectContext.id)
                    .slice(0, eventLimit)
                    .map(e => `• Event: ${e.title} on ${e.startDate}${e.startTime ? ' ' + e.startTime : ''}`).join('\n');

                const sections = [
                  projectTasks && `TASKS\n${projectTasks}`,
                  projectNotes && `NOTES\n${projectNotes}`,
                  projectStories && `STORIES\n${projectStories}`,
                  projectEvents && `CALENDAR\n${projectEvents}`,
                ].filter(Boolean) as string[];

                projectSnapshot = sections.join('\n\n');
            } catch {}
        }

        const aiResponse: AIResponse = await parseAIResponse(history, messageText, currentView, preferences, projectContext, filesForContext, projectSnapshot);
        const modelMessage: Message = { id: `msg-${Date.now()}-ai`, sender: Sender.Model, text: aiResponse.text };

        if (aiResponse.action) {
            switch(aiResponse.action.type) {
                case 'CREATE_TASK':
                    handleCreateChecklist({ name: aiResponse.action.payload.text, completionHistory: [], tasks: [], dueDate: aiResponse.action.payload.dueDate });
                    break;
                case 'CREATE_HABIT':
                    handleCreateHabit({ name: aiResponse.action.payload.text, type: 'daily_check_off', recurrence: { type: 'daily', startDate: getISODate() } });
                    break;
                case 'ADD_ITEMS_TO_LIST': {
                    const { listName, items } = aiResponse.action.payload;
                    const existingList = checklists.find(cl => cl.name.toLowerCase() === listName.toLowerCase());
                    if (existingList) {
                        const newTasks: Task[] = items.map((itemText: string) => ({ id: `task-${Date.now()}-${Math.random()}`, text: itemText, completedAt: null }));
                        handleUpdateChecklist(existingList.id, { tasks: [...existingList.tasks, ...newTasks] });
                    } else {
                        const newTasks: Task[] = items.map((itemText: string) => ({ id: `task-${Date.now()}-${Math.random()}`, text: itemText, completedAt: null }));
                        handleCreateChecklist({ name: listName, completionHistory: [], tasks: newTasks });
                    }
                    break;
                }
                case 'SUGGEST_TASKS': {
                    const { listName, items } = aiResponse.action.payload;
                    modelMessage.suggestions = items.map((item: any) => ({
                        text: item.text,
                        dueDate: item.dueDate,
                        isApproved: false,
                    }));
                    modelMessage.suggestionListName = listName;
                    break;
                }
                case 'COMPLETE_ITEM': {
                    const { itemName, itemType } = aiResponse.action.payload;
                    const todayStr = getISODate();
                    if (itemType === 'habit') {
                        const habit = habits.find(h => h.name.toLowerCase() === itemName.toLowerCase());
                        if (habit) handleToggleHabitCompletion(habit.id, todayStr);
                    } else {
                        const checklist = checklists.find(c => c.name.toLowerCase() === itemName.toLowerCase());
                        if (checklist) handleToggleSingleTaskCompletion(checklist.id, todayStr);
                    }
                    break;
                }
                case 'CREATE_NOTE': {
                    const {noteTitle, noteContent} = aiResponse.action.payload;
                    const project = projectContext;
                    handleCreateNote({name: noteTitle, content: `<h1>${noteTitle}</h1><p>${noteContent || ''}</p>`, projectId: project?.id})
                    break;
                }
                case 'CREATE_EVENT': {
                    const payload = aiResponse.action.payload;
                    const project = projectContext;
                    handleCreateEvent({
                        ...payload,
                        reminders: [], // default
                        projectId: project?.id,
                        categoryId: project?.categoryId,
                    });
                    break;
                }
                case 'CREATE_REQUEST': {
                    const { product, requester, problem, outcome, priority } = aiResponse.action.payload;
                    const project = projectContext;
                    const newRequest: Request = {
                        id: `req-${Date.now()}`,
                        product: product || 'Untitled',
                        requester: requester || preferences.nickname || 'User',
                        problem: problem || '',
                        outcome: outcome || '',
                        valueProposition: '',
                        affectedUsers: '',
                        priority: priority || 'medium',
                        requestedExpertise: [],
                        status: 'new',
                        linkedTaskIds: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    handleCreateRequest(newRequest);
                    break;
                }
                case 'CREATE_STORY': {
                    const { title, description, requestId, skillIds } = aiResponse.action.payload;
                    const project = projectContext;
                    // If requestId provided, get skills from that request
                    let storySkillIds = skillIds || [];
                    if (requestId) {
                        const linkedRequest = requests.find(r => r.id === requestId);
                        if (linkedRequest?.skillIds) {
                            storySkillIds = linkedRequest.skillIds;
                        }
                    }
                    const newStory: Story = {
                        id: `story-${Date.now()}`,
                        title: title || 'Untitled Story',
                        description: description || '',
                        projectId: project?.id,
                        categoryId: project?.categoryId,
                        status: 'backlog',
                        acceptanceCriteria: [],
                        linkedTaskIds: [],
                        skillIds: storySkillIds,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                    handleCreateStory(newStory);
                    // If requestId provided, we could link it (future enhancement)
                    break;
                }
                case 'LINK_OBJECTS': {
                    const { sourceType, sourceId, targetType, targetId } = aiResponse.action.payload;
                    // Handle linking based on types
                    if (sourceType === 'request' && targetType === 'story') {
                        // Link story to request (could be implemented in handleUpdateRequest)
                        modelMessage.text += '\n\n_Note: Linking between requests and stories is coming soon!_';
                    } else if (sourceType === 'story' && targetType === 'task') {
                        const story = stories.find(s => s.id === sourceId);
                        const task = checklists.find(c => c.id === targetId);
                        if (story && task && !story.linkedTaskIds.includes(targetId)) {
                            handleUpdateStory(sourceId, { linkedTaskIds: [...story.linkedTaskIds, targetId] });
                        }
                    }
                    break;
                }
            }
        }
        
                setConversations(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, modelMessage] } : c));
                // Persist model message to relational DB if enabled
                        try {
                    const useRelDb = !!((import.meta as any).env?.VITE_USE_REL_DB === 'true');
                    if (authSession && useRelDb && relationalDb.isEnabled()) {
                        await relationalDb.addMessage(currentChatId, modelMessage);
                    }
                } catch {
                    try { localStorage.setItem('relational.sync.dirty.v1', 'true'); } catch {}
                            maybeShowSyncFailureToast();
                }
    } catch (error) {
        console.error("Error getting AI response:", error);
        const errorMessage: Message = { id: `msg-${Date.now()}-err`, sender: Sender.Model, text: "Sorry, I encountered an error. Please try again." };
        setConversations(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...c.messages, errorMessage] } : c));
    } finally {
        setIsLoading(false);
    }
  };

    const activeConversation = conversations.find(c => c.id === activeChatId) || pendingConversation;
    const activeStory = pendingStoryId ? stories.find(s => s.id === pendingStoryId) : null;
    const activeProjectForChat = activeConversation?.projectId ? projects.find(p => p.id === activeConversation.projectId) : undefined;
    const projectForDetails = projects.find(p => p.id === activeProjectId);
    const isLanding = showLanding && !authSession;
  
    return (

        <div className={`font-sans`}>
                <div className={`flex w-screen ${isLanding ? 'min-h-screen overflow-y-auto bg-transparent text-white' : 'h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100'}`}>
            {!(showLanding && !authSession) && (
                <Sidebar
                    projects={projects}
                    conversations={conversations}
                    userCategories={userCategories}
                    activeChatId={activeChatId}
                    activeProjectId={activeProjectId}
                    currentView={currentView}
                    isCollapsed={isSidebarCollapsed}
                    onNewChat={handleNewChat}
                    onNewProject={() => setProjectModalData('new')}
                    onSelectChat={handleSelectChat}
                    onSelectView={handleSelectView}
                    onSelectProject={handleSelectProject}
                    onToggleCollapse={handleToggleSidebarCollapse}
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setMobileSidebarOpen(false)}
                    t={t}
                    onOpenFeedback={handleOpenFeedback}
                    notes={notes}
                    // FIX: Corrected function signature to match prop type.
                    onCreateNote={(projectId) => handleCreateNote({ projectId })}
                />
            )}
            <div className="flex-1 flex flex-col min-w-0 relative">
                <div className="flex-1 flex flex-col min-h-0">
                    {showLanding && !authSession ? (
                        <LandingPage onSignIn={() => setAuthModalOpen(true)} />
                    ) : activeConversation ? (
                        <ChatView
                            conversation={activeConversation}
                            project={activeProjectForChat}
                            projects={projects}
                            userCategories={userCategories}
                            isLoading={isLoading}
                            onBack={() => {
                                setPendingConversation(null);
                                setActiveChatId(null);
                            }}
                            onMove={(projectId) => handleMoveConversationToProject(activeConversation.id, projectId)}
                            onApproveTask={handleApproveSuggestedTask}
                            onApproveAllTasks={handleApproveAllSuggestedTasks}
                        />
                    ) : activeProjectId && projectForDetails ? (
                        <ProjectDetailsView
                            project={projectForDetails}
                            conversations={conversations.filter(c => c.projectId === activeProjectId)}
                            checklists={checklists.filter(cl => cl.projectId === activeProjectId)}
                            notes={notes.filter(n => n.projectId === activeProjectId)}
                            userCategories={userCategories}
                            projectFiles={projectFiles.filter(f => f.projectId === activeProjectId)}
                            onNewChat={() => handleNewChat(activeProjectId)}
                            onSelectChat={handleSelectChat}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            onToggleTask={handleToggleTask}
                            onEdit={() => setProjectModalData(projectForDetails)}
                            onCreateTaskInProject={handleCreateTaskInProject}
                            onCreateNoteInProject={() => handleCreateNote({ projectId: activeProjectId })}
                            onSelectNote={handleSelectNote}
                            onUploadFiles={(files) => handleUploadFiles(files, activeProjectId)}
                            onDeleteFile={handleDeleteFile}
                            onPreviewFile={setPreviewingFile}
                            t={t}
                        />
                    ) : currentView === 'dashboard' ? (
                         <Dashboard
                            preferences={preferences}
                            checklists={checklists}
                            habits={habits}
                            events={events}
                            userCategories={userCategories}
                            projects={projects}
                            notes={notes}
                            projectFiles={projectFiles}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            onToggleTask={handleToggleTask}
                            onToggleSingleTaskCompletion={(checklistId, date) => handleToggleSingleTaskCompletion(checklistId, date)}
                            onToggleHabitTask={handleToggleHabitTask}
                            onToggleHabitCompletion={handleToggleHabitCompletion}
                            onSelectView={handleSelectView}
                            onSelectProject={handleSelectProject}
                            onSelectNote={handleSelectNote}
                            onNewTask={(date) => setViewAction({ type: 'newTask', payload: { dueDate: date } })}
                            onNewHabit={() => setViewAction({ type: 'newHabit' })}
                            onNewEvent={(date) => handleNewEvent(date)}
                              onNewEventAt={handleNewEventAt}
                            onNewNote={handleCreateNote}
                            onNewProject={() => setProjectModalData('new')}
                            onEditItem={(item) => {
                                if ('tasks' in item && 'type' in item) setViewAction({ type: 'editHabit', payload: item as Habit });
                                else if ('tasks' in item) setViewAction({ type: 'editTask', payload: item as Checklist });
                                else setViewAction({ type: 'editEvent', payload: item as Event });
                            }}
                            onUpdateItemPriority={handleUpdateItemPriority}
                            recentlyCompletedItemId={recentlyCompletedItemId}
                            t={t}
                            onCreateTask={handleCreateTask}
                            onAddTaskToHabit={handleAddTaskToHabit}
                            completingItemIds={completingItemIds}
                            modalToClose={modalToClose}
                            onModalClosed={() => setModalToClose(null)}
                            selectedDate={dashboardDate}
                            onDateSelect={setDashboardDate}
                                     onLoadSampleData={handleLoadSampleData}
                        />
                    ) : currentView === 'lists' ? (
                        <ListsView
                            projects={projects}
                            checklists={checklists}
                            userCategories={userCategories}
                            onNewChecklistRequest={() => setViewAction({ type: 'newTask' })}
                            onEditChecklistRequest={(cl) => setViewAction({ type: 'editTask', payload: cl })}
                            onUpdateChecklist={handleUpdateChecklist}
                            onDeleteChecklist={handleDeleteChecklist}
                            onToggleTask={handleToggleTask}
                            onToggleSingleTaskCompletion={(clId) => handleToggleSingleTaskCompletion(clId, getISODate())}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            onSelectNote={handleSelectNote}
                            recentlyCompletedItemId={recentlyCompletedItemId}
                            t={t}
                            onCreateTask={handleCreateTask}
                            onUpdateTask={handleUpdateTask}
                            onDeleteTask={handleDeleteTask}
                            onDuplicateChecklist={handleDuplicateChecklist}
                            onShareChecklist={handleShareChecklist}
                            completingItemIds={completingItemIds}
                            modalToClose={modalToClose}
                            onModalClosed={() => setModalToClose(null)}
                        />
                    ) : currentView === 'habits' ? (
                        <HabitsView
                            habits={habits}
                            projects={projects}
                            userCategories={userCategories}
                            onNewHabitRequest={() => setViewAction({ type: 'newHabit' })}
                            onEditHabitRequest={(h) => setViewAction({ type: 'editHabit', payload: h })}
                            onUpdateHabit={handleUpdateHabit}
                            onDeleteHabit={handleDeleteHabit}
                            onToggleHabitCompletion={handleToggleHabitCompletion}
                            onToggleHabitTask={handleToggleHabitTask}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            recentlyCompletedItemId={recentlyCompletedItemId}
                            t={t}
                            onShareHabit={handleShareHabit}
                        />
                    ) : currentView === 'settings' ? (
                        <SettingsView
                            preferences={preferences}
                            onUpdate={handleUpdatePreferences}
                            onReset={handleResetPreferences}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            t={t}
                            categories={userCategories}
                            onNewCategory={() => handleRequestNewCategory()}
                            onEditCategory={(cat) => setCategoryModalData(cat)}
                            targetTab={targetSettingsTab}
                            skillCategories={skillCategories}
                            onUpdateSkills={handleUpdateSkills}
                            onGenerateSkills={handleGenerateSkills}
                            authEmail={authSession?.email || null}
                            onSignIn={() => setAuthModalOpen(true)}
                            onSignOut={async () => {
                                try { await authService.signOut(); } catch {}
                                // Show in-app landing page after logout
                                setShowLanding(true);
                                setCurrentView('dashboard');
                                setActiveChatId(null);
                                setActiveProjectId(null);
                                setSelectedNoteId(null);
                            }}
                            supabaseEnabled={authService.isEnabled()}
                            onOpenFeedback={handleOpenFeedback}
                        />
                    ) : currentView === 'notes' ? (
                        <NotesListPage
                            notes={notes}
                            projects={projects}
                            userCategories={userCategories}
                            projectFiles={projectFiles}
                            selectedNoteId={selectedNoteId}
                            onSelectNote={handleSelectNote}
                            onUpdateNote={handleUpdateNote}
                            onCreateNote={(projectId) => handleCreateNote({ projectId })}
                            onDeleteNote={handleDeleteNote}
                            onCloseNote={handleCloseNote}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            onUploadFiles={handleUploadFiles}
                            onDeleteFile={handleDeleteFile}
                            onPreviewFile={setPreviewingFile}
                            onCreateChecklist={handleCreateChecklist}
                            onSelectView={handleSelectView}
                            onNewCategoryRequest={handleRequestNewCategory}
                            t={t}
                        />
                    ) : currentView === 'files' ? (
                        <FilesView
                            projectFiles={projectFiles}
                            projects={projects}
                            userCategories={userCategories}
                            onDeleteFile={handleDeleteFile}
                            onPreviewFile={setPreviewingFile}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            t={t}
                        />
                    ) : currentView === 'stories' ? (
                        <StoriesView
                            stories={stories}
                            projects={projects}
                            userCategories={userCategories}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            onCreateStory={() => handleCreateStory()}
                            onSelectStory={handleSelectStory}
                            onEditStory={handleSelectStory}
                            onDeleteStory={handleDeleteStory}
                            onMoveStory={handleMoveStoryStatus}
                            onLoadSampleData={handleLoadSampleData}
                        />
                    ) : currentView === 'storyEditor' && activeStory ? (
                        <StoryEditorPage
                            story={activeStory}
                            projects={projects}
                            userCategories={userCategories}
                            skillCategories={skillCategories}
                            checklists={checklists}
                            onBack={() => { setCurrentView('stories'); setPendingStoryId(null); }}
                            onUpdate={(updates) => handleUpdateStory(activeStory.id, updates)}
                            onDelete={() => handleDeleteStory(activeStory.id)}
                            onLinkTask={(checklistId) => handleUpdateStory(activeStory.id, { linkedTaskIds: Array.from(new Set([...(activeStory.linkedTaskIds || []), checklistId])) })}
                            onUnlinkTask={(checklistId) => handleUpdateStory(activeStory.id, { linkedTaskIds: (activeStory.linkedTaskIds || []).filter(id => id !== checklistId) })}
                            onCreateLinkedTask={(name) => {
                                const data: Omit<Checklist, 'id'> = {
                                    name,
                                    completionHistory: [],
                                    tasks: [],
                                    projectId: activeStory.projectId,
                                    categoryId: activeStory.categoryId,
                                };
                                const created = handleCreateChecklist(data);
                                handleUpdateStory(activeStory.id, { linkedTaskIds: Array.from(new Set([...(activeStory.linkedTaskIds || []), created.id])) });
                                setToastMessage('Task created and linked!');
                            }}
                        />
                    ) : currentView === 'projects' ? (
                        <ProjectsListPage
                            projects={projects}
                            userCategories={userCategories}
                            onSelectProject={handleSelectProject}
                            onNewProject={() => setProjectModalData('new')}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            t={t}
                        />
                                        ) : currentView === 'calendar' ? (
                        <CalendarView
                            events={events}
                            habits={habits}
                            userCategories={userCategories}
                            onNewEventRequest={handleNewEvent}
                            onEditEventRequest={(e) => setViewAction({type: 'editEvent', payload: e})}
                            onToggleSidebar={() => setMobileSidebarOpen(p => !p)}
                            t={t}
                        />
                                                                                ) : currentView === 'requests' ? (
                                                                                        requestsViewMode === 'list' ? (
                                                                                            <RequestsListPage
                                                                                                requests={requests}
                                                                                                onBack={() => setCurrentView('dashboard')}
                                                                                                onSelect={(id) => {
                                                                                                    const r = requests.find(x => x.id === id);
                                                                                                    if (!r) return;
                                                                                                    setViewAction({ type: 'newRequest', payload: r });
                                                                                                    setCurrentView('requestIntake');
                                                                                                }}
                                                                                                onNew={() => { setViewAction({ type: 'newRequest', payload: {} }); setCurrentView('requestIntake'); }}
                                                                                                mode={requestsViewMode}
                                                                                                onToggleMode={setRequestsViewMode}
                                                                                            />
                                                                                        ) : (
                                                                                            <RequestsBoardPage
                                                                                                requests={requests}
                                                                                                onBack={() => setCurrentView('dashboard')}
                                                                                                onSelect={(id) => {
                                                                                                    const r = requests.find(x => x.id === id);
                                                                                                    if (!r) return;
                                                                                                    setViewAction({ type: 'newRequest', payload: r });
                                                                                                    setCurrentView('requestIntake');
                                                                                                }}
                                                                                                onMove={handleMoveRequestStatus}
                                                                                                onNew={() => { setViewAction({ type: 'newRequest', payload: {} }); setCurrentView('requestIntake'); }}
                                                                                                onGenerateStories={handleGenerateStoriesFromRequest}
                                                                                                mode={requestsViewMode}
                                                                                                onToggleMode={setRequestsViewMode}
                                                                                            />
                                                                                        )
                                                                                ) : currentView === 'requestIntake' ? (
                                            <RequestIntakeForm
                                                initial={(viewAction?.type === 'newRequest' ? viewAction.payload : undefined) as any}
                                                onBack={() => {
                                                    setViewAction(null);
                                                    setCurrentView('requests');
                                                }}
                                                onSubmit={(req) => {
                                                    const editingId = (viewAction as any)?.payload?.id as string | undefined;
                                                    if (!editingId) {
                                                        let linkedIds = req.linkedTaskIds || [];
                                                        if (!linkedIds.length && req.problem) {
                                                            const created = handleCreateChecklist({ name: req.problem.slice(0, 80), completionHistory: [], tasks: [] });
                                                            linkedIds = [created.id];
                                                        }
                                                        handleCreateRequest({ ...req, linkedTaskIds: linkedIds });
                                                    } else {
                                                        handleUpdateRequest(editingId, { ...req });
                                                    }
                                                    setViewAction(null);
                                                    setCurrentView('requests');
                                                }}
                                                onCreateLinkedTask={(name) => {
                                                    const created = handleCreateChecklist({ name, completionHistory: [], tasks: [] });
                                                    setToastMessage('Task created');
                                                }}
                                                existingChecklists={checklists}
                                                skillCategories={skillCategories}
                                            />
                                        ) : null}
                                </div>

                                {/* Request intake is now a dedicated page (currentView === 'requestIntake') */}
                

                {activeConversation && !isMobileChatOpen && (
                    <div className="hidden md:block">
                    <ChatInputBar
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        currentView={currentView}
                        activeProjectId={activeProjectId}
                        t={t}
                        language={preferences.language}
                    />
                    </div>
                )}
            </div>

            {/* Modals and Overlays */}
            {projectModalData && (
                <ProjectModal
                    onClose={() => setProjectModalData(null)}
                    onSave={handleSaveProjectFromModal}
                    onDelete={projectModalData !== 'new' ? () => handleDeleteProject(projectModalData.id) : undefined}
                    initialData={projectModalData !== 'new' ? projectModalData : undefined}
                    userCategories={userCategories}
                    onNewCategoryRequest={handleRequestNewCategory}
                />
            )}
             {categoryModalData && (
                <CategoryModal
                    onClose={() => setCategoryModalData(null)}
                    onSave={handleSaveCategoryFromModal}
                    onUpdate={handleUpdateCategoryFromModal}
                    onDelete={categoryModalData !== 'new' ? () => handleDeleteCategory(categoryModalData.id) : undefined}
                    initialData={categoryModalData !== 'new' ? categoryModalData : undefined}
                />
            )}
            {viewAction?.type === 'newTask' && (
                <TaskEditorModal
                    initialData={viewAction.payload}
                    onClose={() => setViewAction(null)}
                    onSave={(data) => {
                        handleCreateChecklist(data);
                    }}
                    onUpdate={() => {}} // not used for new
                    userCategories={userCategories}
                    projects={projects}
                    onNewCategoryRequest={() => handleRequestNewCategory((newId) => {
                        // Re-open modal with new category id
                        const currentData = (viewAction as { payload?: Partial<Checklist> }).payload;
                        setViewAction({type: 'newTask', payload: {...currentData, categoryId: newId}})
                    })}
                />
            )}
             {viewAction?.type === 'editTask' && (
                <TaskEditorModal
                    initialData={viewAction.payload}
                    onClose={() => setViewAction(null)}
                    onSave={() => {}} // not used for edit
                    onUpdate={(id, data) => handleUpdateChecklist(id, data)}
                    onDelete={() => handleDeleteChecklist(viewAction.payload.id)}
                    userCategories={userCategories}
                    projects={projects}
                    onNewCategoryRequest={() => handleRequestNewCategory((newId) => {
                        const currentData = (viewAction as { payload: Checklist }).payload;
                        setViewAction({type: 'editTask', payload: {...currentData, categoryId: newId}})
                    })}
                />
            )}
            {viewAction?.type === 'newHabit' && (
                <HabitModal
                    onClose={() => setViewAction(null)}
                    onSave={handleCreateHabit}
                    onUpdate={() => {}}
                    userCategories={userCategories}
                    projects={projects}
                    onNewCategoryRequest={() => handleRequestNewCategory((newId) => {
                         setViewAction({type: 'newHabit'})
                    })}
                />
            )}
             {viewAction?.type === 'editHabit' && (
                <HabitModal
                    initialData={viewAction.payload}
                    onClose={() => setViewAction(null)}
                    onSave={() => {}}
                    onUpdate={(id, data) => handleUpdateHabit(id, data)}
                    onDelete={() => handleDeleteHabit(viewAction.payload.id)}
                    userCategories={userCategories}
                    projects={projects}
                    onNewCategoryRequest={() => handleRequestNewCategory((newId) => {
                        const currentData = (viewAction as { payload: Habit }).payload;
                        setViewAction({type: 'editHabit', payload: {...currentData, categoryId: newId}})
                    })}
                />
            )}
            {viewAction?.type === 'newEvent' && (
                 <EventModal
                    initialData={viewAction.payload}
                    onClose={() => setViewAction(null)}
                    onSave={handleCreateEvent}
                    onUpdate={() => {}}
                    userCategories={userCategories}
                    projects={projects}
                />
            )}
            {viewAction?.type === 'editEvent' && (
                 <EventModal
                    initialData={viewAction.payload}
                    onClose={() => setViewAction(null)}
                    onSave={() => {}}
                    onUpdate={(id, data) => handleUpdateEvent(id, data)}
                    onDelete={() => handleDeleteEvent(viewAction.payload.id)}
                    userCategories={userCategories}
                    projects={projects}
                />
            )}
            {previewingFile && (
                <FilePreviewModal file={previewingFile} onClose={() => setPreviewingFile(null)} />
            )}
            {toastMessage && (
                <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
            )}
            {/* Global Search Overlay */}
            <GlobalSearch
                isOpen={isGlobalSearchOpen}
                onClose={() => setGlobalSearchOpen(false)}
                checklists={checklists}
                habits={habits}
                notes={notes}
                projects={projects}
                events={events}
                projectFiles={projectFiles}
                userCategories={userCategories}
                onSelectNote={handleSelectNote}
                onSelectProject={handleSelectProject}
                onSelectView={handleSelectView}
            />
                        {isAuthModalOpen && (
                            <AuthModal
                                onClose={() => setAuthModalOpen(false)}
                                onSignIn={async (email, password) => {
                                    const res = await authService.signInWithPassword(email, password);
                                    if (!res.error && !res.requiresVerification) setToastMessage('Signed in successfully.');
                                    return res;
                                }}
                                onSignUp={async (email, password) => {
                                    const res = await authService.signUpWithEmail(email, password);
                                    if (!res.error) setToastMessage('Check your inbox to verify your email.');
                                    return res;
                                }}
                                onResendVerification={async (email) => {
                                    const res = await authService.resendVerification(email);
                                    if (!res.error) setToastMessage('Verification email sent.');
                                    return res;
                                }}
                                onMagicLink={async (email) => {
                                    const res = await authService.signInWithMagicLink(email);
                                    if (!res.error) setToastMessage('Check your email to finish sign in');
                                    return res;
                                }}
                                onForgotPassword={async (email) => {
                                    const res = await authService.resetPassword(email);
                                    if (!res.error) setToastMessage('Password reset email sent. Check your inbox.');
                                    return res;
                                }}
                            />
                        )}
            {showOnboarding && (
                <OnboardingModal
                  isOpen={showOnboarding}
                  onClose={() => {
                    setShowOnboarding(false);
                    completeOnboarding({ onboardingCompleted: true });
                  }}
                />
            )}

            <FeedbackModal
                isOpen={isFeedbackOpen}
                defaultEmail={authSession?.email || undefined}
                onClose={handleCloseFeedback}
                onSubmit={handleSubmitFeedback}
            />
            
            {/* Only show mobile navigation and FAB when NOT on landing page */}
            {!isLanding && (
                <>
                    <div className="md:hidden">
                        <BottomNavBar currentView={currentView} onSelectView={handleSelectView} onOpenFeedback={handleOpenFeedback} t={t} />
                        <FloatingActionButton
                            onClick={() => { setMobileChatOpen(true); setChatOpenMode('text'); }}
                            isChatOpen={isMobileChatOpen}
                        />
                    </div>
                    {isMobileChatOpen && (
                        <ChatInputBar
                            onSendMessage={(msg) => {
                                handleSendMessage(msg);
                                setMobileChatOpen(false);
                            }}
                            isLoading={isLoading}
                            currentView={currentView}
                            activeProjectId={activeProjectId}
                            t={t}
                            language={preferences.language}
                            isMobileOverlay={true}
                            initialMode={chatOpenMode}
                            onClose={() => setMobileChatOpen(false)}
                        />
                    )}
                </>
            )}

        </div>
    </div>
  );
};
export default App;