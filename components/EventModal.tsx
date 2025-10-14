import React, { useState, useEffect, useRef } from 'react';
import { Event, UserCategory, Project, ReminderSetting, RecurrenceRule } from '../types';
import { CloseIcon, WarningIcon, AddIcon, FolderIcon, ExpandMoreIcon, NotificationsIcon, DeleteIcon, CalendarTodayIcon, AutorenewIcon } from './icons';
import ModalOverlay from './ModalOverlay';

const Icon: React.FC<{ name: string; className?: string; style?: React.CSSProperties }> = ({ name, className, style }) => (
  <span className={`material-symbols-outlined ${className}`} style={style}>{name}</span>
);

const IconSelect: React.FC<{
  items: (Project | UserCategory)[];
  userCategories: UserCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
  type: 'project' | 'category';
  placeholder: string;
}> = ({ items, userCategories, selectedId, onSelect, type, placeholder }) => {
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
        return <Icon name={(item as Project).icon!} className="text-base" style={{ color: (item as Project).color }} />;
    }
    if ('categoryId' in item) { // it's a Project
        const category = userCategories.find(c => c.id === (item as Project).categoryId);
        return category ? <Icon name={category.icon} className="text-base" style={{ color: category.color }} /> : <FolderIcon className="text-base text-gray-400" />;
    }
    // it's a UserCategory
    return <Icon name={(item as UserCategory).icon} className="text-base" style={{ color: (item as UserCategory).color }} />;
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-700/70 transition-colors">
        <div className="flex items-center gap-2 truncate flex-grow">
            {selectedItem ? getIcon(selectedItem) : (type === 'project' ? <FolderIcon className="text-base text-gray-400" /> : <Icon name="label" className="text-base text-gray-400" />)}
            <span className={`truncate ${selectedItem ? '' : 'text-gray-400'}`}>{selectedItem ? selectedItem.name : placeholder}</span>
        </div>
        <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in-down">
          <ul>
            <li><button onClick={() => { onSelect(''); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-gray-600 text-gray-400 transition-colors"><span>{placeholder}</span></button></li>
            {items.map(item => (<li key={item.id}><button onClick={() => { onSelect(item.id); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2.5 hover:bg-gray-600 transition-colors"><div className="w-5">{getIcon(item)}</div><span className="truncate">{item.name}</span></button></li>))}
          </ul>
        </div>
      )}
    </div>
  );
};


const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; message: string; }> = ({ onConfirm, onCancel, message }) => (
    <div className="fixed inset-0 bg-gray-900/80 z-[80] flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6 text-center">
        <WarningIcon className="text-red-500 text-5xl mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Are you sure?</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
         <button onClick={onCancel} className="px-6 py-2 rounded-[var(--radius-button)] bg-gray-600 hover:bg-gray-500 font-semibold transition-colors">Cancel</button>
         <button onClick={onConfirm} className="px-6 py-2 rounded-[var(--radius-button)] bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">Delete</button>
        </div>
      </div>
    </div>
);

interface EventModalProps {
    initialData?: Partial<Event>;
    onClose: () => void;
    onSave: (data: Omit<Event, 'id'>) => void;
    onUpdate: (id: string, data: Partial<Omit<Event, 'id'>>) => void;
    onDelete?: () => void;
    userCategories: UserCategory[];
    projects: Project[];
}

const EventModal: React.FC<EventModalProps> = ({ initialData, onClose, onSave, onUpdate, onDelete, userCategories, projects }) => {
    const isEditing = !!initialData?.id;
  const [localData, setLocalData] = useState<Partial<Event>>({
        title: '', description: '', categoryId: '', projectId: '', 
        startDate: new Date().toISOString().split('T')[0], startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0], endTime: '10:00',
    isAllDay: false, reminders: ['15m'], recurrence: undefined,
        ...initialData
    });
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);
  const [isRecurrenceExpanded, setIsRecurrenceExpanded] = useState(!!initialData?.recurrence);

  // When a project is selected, auto-select and lock the corresponding category.
  useEffect(() => {
    if (localData.projectId) {
      const proj = projects.find(p => p.id === localData.projectId);
      if (proj && proj.categoryId && localData.categoryId !== proj.categoryId) {
        setLocalData(prev => ({ ...prev, categoryId: proj.categoryId! }));
      }
    }
  }, [localData.projectId, projects]);

  const handleUpdateField = (field: keyof Event, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
    };

    const toggleReminder = (reminder: ReminderSetting) => {
        const currentReminders = localData.reminders || [];
        const newReminders = currentReminders.includes(reminder)
            ? currentReminders.filter(r => r !== reminder)
            : [...currentReminders, reminder];
        handleUpdateField('reminders', newReminders);
        // Politely request permission if user is enabling reminders and permission not yet decided
        try {
          if (newReminders.length > 0 && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        } catch {}
    };

    // Compute dirty state and time validity
    const normalizeReminders = (arr?: ReminderSetting[]) => (arr ? [...arr].sort().join(',') : '');
    const normalizeRecurrence = (rec?: RecurrenceRule) => rec ? JSON.stringify(rec) : '';
    const isDirty = (() => {
      const init = initialData || {};
      const fields: (keyof Event)[] = ['title','description','categoryId','projectId','startDate','startTime','endDate','endTime','isAllDay'];
      for (const f of fields) {
        if ((localData as any)[f] !== (init as any)[f]) return true;
      }
      if (normalizeReminders(localData.reminders as ReminderSetting[]) !== normalizeReminders(init.reminders as ReminderSetting[])) return true;
      if (normalizeRecurrence(localData.recurrence) !== normalizeRecurrence(init.recurrence)) return true;
      return false;
    })();

    const makeDateTime = (date?: string | null, time?: string | null) => {
      if (!date) return null;
      if (!time) return new Date(`${date}T00:00:00`);
      return new Date(`${date}T${time}`);
    };
    const startDT = makeDateTime(localData.startDate || undefined, localData.isAllDay ? null : (localData.startTime || undefined));
    const endDT = localData.isAllDay ? makeDateTime(localData.startDate || undefined, null) : makeDateTime(localData.endDate || undefined, localData.endTime || undefined);
    const timeError = (!localData.isAllDay && startDT && endDT && endDT < startDT) ? 'End must be after start.' : null;

  const handleSave = () => {
    if (!isEditing && !localData.title?.trim()) return;
    if (timeError) return;
        const dataToSave = { ...localData };
        if (dataToSave.isAllDay) {
            dataToSave.startTime = null;
            dataToSave.endTime = null;
            dataToSave.endDate = dataToSave.startDate;
        }
        if (isEditing && initialData.id) {
            onUpdate(initialData.id, dataToSave);
        } else {
            onSave(dataToSave as Omit<Event, 'id'>);
        }
        onClose();
    };
    
    const FormRow: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <h3 className="font-semibold text-gray-300 text-sm flex-shrink-0 md:w-1/4">{label}</h3>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
    
  const reminderOptions: {value: ReminderSetting, label: string}[] = [
    {value: 'start', label: 'At event time'}, {value: '5m', label: '5 min before'}, {value: '15m', label: '15 min before (default)'}, {value: '1h', label: '1 hour before'}, {value: '1d', label: '1 day before'}
    ];

  // Recurrence helpers
  const updateRecurrence = (field: keyof RecurrenceRule, value: any) => {
    const currentRecurrence = localData.recurrence || { type: 'daily', startDate: localData.startDate || new Date().toISOString().split('T')[0] };
    const updatedRecurrence = { ...currentRecurrence, [field]: value };
    
    // Clear incompatible fields when changing type
    if (field === 'type') {
      const baseRecurrence = { type: value, startDate: updatedRecurrence.startDate };
      if (value === 'weekly') {
        // Default to current day of the week
        const dayMap: { [key: number]: 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' } = { 
          0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' 
        };
        const today = new Date();
        const currentDay = dayMap[today.getDay()];
        (baseRecurrence as any).daysOfWeek = [currentDay];
        (baseRecurrence as any).interval = 1;
      } else if (value === 'monthly') {
        (baseRecurrence as any).dayOfMonth = parseInt(updatedRecurrence.startDate.split('-')[2]);
        (baseRecurrence as any).interval = 1;
      } else if (value === 'yearly') {
        const startDate = new Date(updatedRecurrence.startDate);
        (baseRecurrence as any).dayOfMonth = startDate.getDate();
        (baseRecurrence as any).monthOfYear = startDate.getMonth() + 1;
        (baseRecurrence as any).interval = 1;
      } else if (value === 'interval') {
        (baseRecurrence as any).interval = 1;
      }
      handleUpdateField('recurrence', baseRecurrence);
    } else {
      handleUpdateField('recurrence', updatedRecurrence);
    }
  };

  const removeRecurrence = () => {
    handleUpdateField('recurrence', undefined);
    setIsRecurrenceExpanded(false);
  };

  const addRecurrence = () => {
    const startDate = localData.startDate || new Date().toISOString().split('T')[0];
    updateRecurrence('type', 'daily');
    setIsRecurrenceExpanded(true);
  };

  return (
    <>
      <ModalOverlay onClick={onClose} className="md:flex md:items-center md:justify-center md:p-4">
        <div className="fixed inset-0 md:relative md:inset-auto bg-gray-800 rounded-none md:rounded-xl border-0 md:border border-gray-700 w-full max-w-2xl max-h-screen md:max-h-[90vh] flex flex-col animate-slide-in-up md:animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
                    <header className="sticky top-0 z-20 bg-gray-800/95 backdrop-blur-xl p-4 md:p-5 flex items-center justify-between border-b border-gray-700">
                        <h2 className="text-lg md:text-xl font-semibold">{isEditing ? 'Edit Event' : 'New Event'}</h2>
                        <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Close">
                          <CloseIcon />
                        </button>
                    </header>
          <main className="p-6 overflow-y-auto space-y-4">
                        <input type="text" value={localData.title || ''} onChange={e => handleUpdateField('title', e.target.value)} placeholder="Event Title" className="w-full bg-transparent border-none p-0 text-lg text-white placeholder-gray-500 focus:outline-none focus:ring-0"/>
                        <textarea value={localData.description || ''} onChange={e => handleUpdateField('description', e.target.value)} placeholder="Description..." rows={2} className="w-full bg-transparent text-sm text-gray-300 placeholder-gray-500 focus:outline-none"/>
                        <div className="space-y-3 pt-4 border-t border-gray-700">
               <FormRow label="Category">
                 <div className={`${localData.projectId ? 'opacity-60 pointer-events-none' : ''}`}>
                   <IconSelect items={userCategories} userCategories={userCategories} selectedId={localData.categoryId || ''} onSelect={id => handleUpdateField('categoryId', id)} type="category" placeholder="Select Category" />
                 </div>
               </FormRow>
               <FormRow label="Project"><IconSelect items={projects} userCategories={userCategories} selectedId={localData.projectId || ''} onSelect={id => handleUpdateField('projectId', id)} type="project" placeholder="No project" /></FormRow>
                           <FormRow label="All-day">
                               <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={localData.isAllDay} onChange={e => handleUpdateField('isAllDay', e.target.checked)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label>
                           </FormRow>
                           <FormRow label="Starts">
                               <div className="flex items-center gap-2">
                                 <CalendarTodayIcon className="text-base text-gray-400" />
                                 <input type="date" value={localData.startDate || ''} onChange={e => handleUpdateField('startDate', e.target.value)} className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                 {!localData.isAllDay && (
                                   <>
                                     <Icon name="schedule" className="text-base text-gray-400" />
                                     <input type="time" value={localData.startTime || ''} onChange={e => handleUpdateField('startTime', e.target.value)} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                   </>
                                 )}
                               </div>
                           </FormRow>
                           {!localData.isAllDay && (
                             <FormRow label="Ends">
                               <div className="flex items-center gap-2">
                                 <CalendarTodayIcon className="text-base text-gray-400" />
                                 <input type="date" value={localData.endDate || ''} onChange={e => handleUpdateField('endDate', e.target.value)} className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                 <Icon name="schedule" className="text-base text-gray-400" />
                                 <input type="time" value={localData.endTime || ''} onChange={e => handleUpdateField('endTime', e.target.value)} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                               </div>
                             </FormRow>
                           )}
                           {timeError && (
                             <div className="text-red-400 text-xs -mt-2">{timeError}</div>
                           )}
                           <FormRow label="Reminders">
                                <div className="flex flex-wrap gap-2">
                                    {reminderOptions.map(opt => (
                                        <button key={opt.value} onClick={() => toggleReminder(opt.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${localData.reminders?.includes(opt.value) ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>{opt.label}</button>
                                    ))}
                                </div>
                           </FormRow>
                           
                           {/* Recurrence Section */}
                           <FormRow label="Repeat">
                             <div className="space-y-3">
                               {localData.recurrence ? (
                                 <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                     <div className="flex items-center gap-2">
                                       <AutorenewIcon className="text-base text-blue-400" />
                                       <span className="text-sm text-blue-400">Recurring event</span>
                                     </div>
                                     <button onClick={removeRecurrence} className="text-red-400 hover:text-red-300 text-sm">
                                       Remove
                                     </button>
                                   </div>
                                   
                                   {/* Recurrence Type */}
                                   <div className="space-y-2">
                                     <label className="text-xs text-gray-400 uppercase tracking-wider">Repeat</label>
                                     <select 
                                       value={localData.recurrence.type} 
                                       onChange={e => updateRecurrence('type', e.target.value)}
                                       className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                     >
                                       <option value="daily">Daily</option>
                                       <option value="weekly">Weekly</option>
                                       <option value="monthly">Monthly</option>
                                       <option value="yearly">Yearly</option>
                                       <option value="interval">Every N days</option>
                                     </select>
                                   </div>

                                   {/* Interval for weekly, monthly, yearly */}
                                   {(localData.recurrence.type === 'weekly' || localData.recurrence.type === 'monthly' || localData.recurrence.type === 'yearly' || localData.recurrence.type === 'interval') && (
                                     <div className="space-y-2">
                                       <label className="text-xs text-gray-400 uppercase tracking-wider">
                                         Every
                                       </label>
                                       <div className="flex items-center gap-2">
                                         <input 
                                           type="number" 
                                           min="1" 
                                           max="365"
                                           value={localData.recurrence.interval || 1} 
                                           onChange={e => updateRecurrence('interval', parseInt(e.target.value))}
                                           className="w-20 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                         />
                                         <span className="text-sm text-gray-300">
                                           {localData.recurrence.type === 'weekly' ? 'week(s)' : 
                                            localData.recurrence.type === 'monthly' ? 'month(s)' : 
                                            localData.recurrence.type === 'yearly' ? 'year(s)' : 'day(s)'}
                                         </span>
                                       </div>
                                     </div>
                                   )}

                                   {/* Days of week for weekly */}
                                   {localData.recurrence.type === 'weekly' && (
                                     <div className="space-y-2">
                                       <label className="text-xs text-gray-400 uppercase tracking-wider">On days</label>
                                       <div className="flex flex-wrap gap-2">
                                         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                           <button 
                                             key={day}
                                             onClick={() => {
                                               const currentDays = localData.recurrence?.daysOfWeek || [];
                                               const newDays = currentDays.includes(day as any) 
                                                 ? currentDays.filter(d => d !== day)
                                                 : [...currentDays, day as any];
                                               updateRecurrence('daysOfWeek', newDays);
                                             }}
                                             className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                               localData.recurrence?.daysOfWeek?.includes(day as any) 
                                                 ? 'bg-blue-600 text-white' 
                                                 : 'bg-gray-600 hover:bg-gray-500'
                                             }`}
                                           >
                                             {day}
                                           </button>
                                         ))}
                                       </div>
                                     </div>
                                   )}

                                   {/* Day of month for monthly */}
                                   {localData.recurrence.type === 'monthly' && (
                                     <div className="space-y-2">
                                       <label className="text-xs text-gray-400 uppercase tracking-wider">On day of month</label>
                                       <input 
                                         type="number" 
                                         min="1" 
                                         max="31"
                                         value={localData.recurrence.dayOfMonth || 1} 
                                         onChange={e => updateRecurrence('dayOfMonth', parseInt(e.target.value))}
                                         className="w-20 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       />
                                     </div>
                                   )}

                                   {/* Month and day for yearly */}
                                   {localData.recurrence.type === 'yearly' && (
                                     <div className="space-y-2">
                                       <label className="text-xs text-gray-400 uppercase tracking-wider">On</label>
                                       <div className="flex items-center gap-2">
                                         <select 
                                           value={localData.recurrence.monthOfYear || 1} 
                                           onChange={e => updateRecurrence('monthOfYear', parseInt(e.target.value))}
                                           className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                         >
                                           {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => (
                                             <option key={idx} value={idx + 1}>{month}</option>
                                           ))}
                                         </select>
                                         <input 
                                           type="number" 
                                           min="1" 
                                           max="31"
                                           value={localData.recurrence.dayOfMonth || 1} 
                                           onChange={e => updateRecurrence('dayOfMonth', parseInt(e.target.value))}
                                           className="w-20 bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                         />
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               ) : (
                                 <button 
                                   onClick={addRecurrence} 
                                   className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                 >
                                   <AddIcon className="text-base" />
                                   Add recurrence
                                 </button>
                               )}
                             </div>
                           </FormRow>
                        </div>
                    </main>
          <footer className="sticky bottom-0 z-10 bg-gray-800/95 backdrop-blur-xl p-4 md:p-5 border-t border-gray-700 flex items-center justify-between gap-4">
                        {isEditing && onDelete ? (
                          <button onClick={() => setConfirmingDelete(true)} className="px-4 py-2.5 md:py-3 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold hover:bg-red-600/40 hover:text-red-300 transition-colors">
                            Delete
                          </button>
                        ) : <div></div>}
              <button onClick={handleSave} disabled={(isEditing ? !isDirty : !localData.title?.trim()) || !!timeError} className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white rounded-full text-sm font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">{isEditing ? 'Save Changes' : 'Create Event'}</button>
                    </footer>
        </div>
      </ModalOverlay>
            {isConfirmingDelete && onDelete && (<DeleteConfirmationModal onConfirm={() => { onDelete(); setConfirmingDelete(false); onClose(); }} onCancel={() => setConfirmingDelete(false)} message="This action is permanent and cannot be undone."/>)}
        </>
    );
};

export default EventModal;