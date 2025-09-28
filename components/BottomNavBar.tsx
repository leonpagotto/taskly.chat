import React from 'react';
import { TodayIcon, NewHabitIcon, ListAltIcon, DescriptionIcon, FolderIcon, ChatAddOnIcon, CalendarMonthIcon } from './icons';
import { AppView } from '../types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive ? 'text-[var(--color-primary-600)]' : 'text-gray-400 hover:text-gray-200'}`}
  >
    <span
      className={`w-11 h-11 rounded-full flex items-center justify-center ${isActive ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50'}`}
    >
      {icon}
    </span>
    <span className="text-[10px] font-medium leading-tight">{label}</span>
  </button>
);

interface BottomNavBarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  t: (key: string) => string;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onSelectView, t }) => {
  const navItems = [
    { view: 'dashboard', icon: <TodayIcon className="text-xl" />, label: t('dashboard') },
    { view: 'habits', icon: <NewHabitIcon className="text-xl" />, label: t('habits') },
    { view: 'calendar', icon: <CalendarMonthIcon className="text-xl" />, label: t('calendar') },
    { view: 'lists', icon: <ListAltIcon className="text-xl" />, label: t('tasks') },
    { view: 'notes', icon: <DescriptionIcon className="text-xl" />, label: t('notes') },
    { view: 'projects', icon: <FolderIcon className="text-xl" />, label: t('projects') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700/50 z-40">
      <div className="flex items-center justify-around h-full">
          {navItems.map(item => (
            <NavItem 
              key={item.view}
              icon={item.icon}
              label={item.label}
              isActive={currentView === item.view}
              onClick={() => onSelectView(item.view as AppView)}
            />
          ))}
      </div>
    </div>
  );
};

export default BottomNavBar;