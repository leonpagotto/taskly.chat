import React, { useState, useEffect, useRef } from 'react';
import { Event, UserCategory, Project, ReminderSetting } from '../types';
import { CloseIcon, WarningIcon, AddIcon, FolderIcon, ExpandMoreIcon, NotificationsIcon, DeleteIcon } from './icons';
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
            <li><button onClick={() => { onSelect(''); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-600 text-gray-400"><span>{placeholder}</span></button></li>
            {items.map(item => (<li key={item.id}><button onClick={() => { onSelect(item.id); setIsOpen(false); }} className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-gray-600"><div className="w-5">{getIcon(item)}</div><span className="truncate">{item.name}</span></button></li>))}
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
    isAllDay: false, reminders: ['15m'],
        ...initialData
    });
  const [isConfirmingDelete, setConfirmingDelete] = useState(false);

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
    };

    const handleSave = () => {
        if (!localData.title?.trim()) return;
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

  return (
    <>
      <ModalOverlay onClick={onClose} className="md:flex md:items-center md:justify-center md:p-4">
        <div className="fixed inset-x-0 bottom-0 md:relative bg-gray-800 rounded-t-xl md:rounded-xl border-t md:border border-gray-700 w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-in-up md:animate-fade-in-down" onClick={(e) => e.stopPropagation()}>
                    <header className="p-4 flex items-center justify-between border-b border-gray-700">
                        <h2 className="text-lg font-semibold">{isEditing ? 'Edit Event' : 'New Event'}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
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
                               <div className="flex gap-2">
                                <input type="date" value={localData.startDate || ''} onChange={e => handleUpdateField('startDate', e.target.value)} className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                {!localData.isAllDay && <input type="time" value={localData.startTime || ''} onChange={e => handleUpdateField('startTime', e.target.value)} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>}
                               </div>
                           </FormRow>
                           {!localData.isAllDay && <FormRow label="Ends">
                               <div className="flex gap-2">
                                <input type="date" value={localData.endDate || ''} onChange={e => handleUpdateField('endDate', e.target.value)} className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                <input type="time" value={localData.endTime || ''} onChange={e => handleUpdateField('endTime', e.target.value)} className="bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                               </div>
                           </FormRow>}
                           <FormRow label="Reminders">
                                <div className="flex flex-wrap gap-2">
                                    {reminderOptions.map(opt => (
                                        <button key={opt.value} onClick={() => toggleReminder(opt.value)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${localData.reminders?.includes(opt.value) ? 'bg-blue-600 text-white' : 'bg-gray-600 hover:bg-gray-500'}`}>{opt.label}</button>
                                    ))}
                                </div>
                           </FormRow>
                        </div>
                    </main>
          <footer className="p-4 border-t border-gray-700 flex items-center justify-between gap-4 sticky bottom-0 bg-gray-800/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(theme(spacing.4),env(safe-area-inset-bottom))]">
                        {isEditing && onDelete ? (<button onClick={() => setConfirmingDelete(true)} className="px-4 py-3 bg-red-600/20 text-red-400 rounded-[var(--radius-button)] text-sm font-semibold hover:bg-red-600/40 hover:text-red-300 transition-colors">Delete</button>) : <div></div>}
              <button onClick={handleSave} disabled={!localData.title?.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] text-sm font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all">{isEditing ? 'Save Changes' : 'Create Event'}</button>
                    </footer>
        </div>
      </ModalOverlay>
            {isConfirmingDelete && onDelete && (<DeleteConfirmationModal onConfirm={() => { onDelete(); setConfirmingDelete(false); onClose(); }} onCancel={() => setConfirmingDelete(false)} message="This action is permanent and cannot be undone."/>)}
        </>
    );
};

export default EventModal;