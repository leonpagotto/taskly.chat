import React, { useState, useEffect, useRef } from 'react';
import { AddIcon, CloseIcon, ListAltIcon, AutorenewIcon, DescriptionIcon, CreateNewFolderIcon } from './icons';

interface CreateNewButtonProps {
  onNewTask: () => void;
  onNewHabit: () => void;
  onNewNote: () => void;
  onNewProject: () => void;
}

const CreateNewButton: React.FC<CreateNewButtonProps> = ({ onNewTask, onNewHabit, onNewNote, onNewProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const menuItems = [
    { label: 'New Task', icon: <ListAltIcon />, action: onNewTask },
    { label: 'New Habit', icon: <AutorenewIcon />, action: onNewHabit },
    { label: 'New Note', icon: <DescriptionIcon />, action: onNewNote },
    { label: 'New Project', icon: <CreateNewFolderIcon />, action: onNewProject },
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        aria-label="Create new item"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            <AddIcon className="text-2xl" />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Desktop Dropdown */}
          <div className="hidden md:block absolute top-full right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fade-in-down">
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button onClick={() => handleSelect(item.action)} className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Bottom Sheet */}
          <div className="md:hidden fixed inset-0 z-40">
              <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)}></div>
              <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl p-4 animate-slide-in-up">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Create New</h3>
                    <button onClick={() => setIsOpen(false)} className="p-2 -mr-2"><CloseIcon /></button>
                  </div>
                  <ul className="space-y-2">
                     {menuItems.map((item, index) => (
                        <li key={index}>
                        <button onClick={() => handleSelect(item.action)} className="w-full text-left flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <div className="w-8 h-8 flex items-center justify-center text-lg">{item.icon}</div>
                            <span className="font-medium">{item.label}</span>
                        </button>
                        </li>
                    ))}
                  </ul>
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateNewButton;
