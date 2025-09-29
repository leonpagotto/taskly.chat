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
    aria-current={isActive ? 'page' : undefined}
    className={
      [
        'group flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2',
        'ring-offset-gray-100 dark:ring-offset-gray-900'
      ].join(' ')
    }
  >
    <span
      className={
        [
          'w-12 h-12 rounded-[var(--radius-button)] flex items-center justify-center transition-all transform group-hover:-translate-y-0.5',
          isActive
            ? 'bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white shadow-md'
            : 'text-gray-400 group-hover:text-gray-200 group-hover:bg-gray-700/50'
        ].join(' ')
      }
    >
      {icon}
    </span>
    <span
      className={
        [
          'text-[11px] font-medium leading-tight transition-all transform',
          isActive
            ? 'text-[var(--color-primary-700)] dark:text-[var(--color-primary-400)]'
            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-300'
        ].join(' ')
      }
    >
      {label}
    </span>
  </button>
);

interface BottomNavBarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  t: (key: string) => string;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onSelectView, t }) => {
  const navItems = [
    { view: 'dashboard', icon: <TodayIcon className="text-2xl" />, label: t('dashboard') },
    { view: 'habits', icon: <NewHabitIcon className="text-2xl" />, label: t('habits') },
    { view: 'calendar', icon: <CalendarMonthIcon className="text-2xl" />, label: t('calendar') },
    { view: 'lists', icon: <ListAltIcon className="text-2xl" />, label: t('tasks') },
    { view: 'notes', icon: <DescriptionIcon className="text-2xl" />, label: t('notes') },
    { view: 'projects', icon: <FolderIcon className="text-2xl" />, label: t('projects') },
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