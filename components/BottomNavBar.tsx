import React from 'react';
import { TodayIcon, NewHabitIcon, ListAltIcon, DescriptionIcon, FolderIcon, ChatAddOnIcon, CalendarMonthIcon } from './icons';
import { AppView } from '../types';

interface NavItemProps {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={
      [
        'group flex flex-col items-center justify-center gap-0 w-16 h-full transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2',
        'ring-offset-gray-100 dark:ring-offset-gray-900'
      ].join(' ')
    }
  >
    <span className="flex items-center justify-center">
      <Icon
        className={
          [
            'text-[22px] leading-none',
            isActive
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600'
              : 'text-gray-400 group-hover:text-gray-200'
          ].join(' ')
        }
      />
    </span>
    <span
      className={
        [
          'text-[11px] font-medium leading-none mt-0.5 transition-colors',
          isActive
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600'
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
    { view: 'dashboard' as const, Icon: TodayIcon, label: t('dashboard') },
    { view: 'habits' as const, Icon: NewHabitIcon, label: t('habits') },
    { view: 'calendar' as const, Icon: CalendarMonthIcon, label: t('calendar') },
    { view: 'lists' as const, Icon: ListAltIcon, label: t('tasks') },
    { view: 'notes' as const, Icon: DescriptionIcon, label: t('notes') },
    { view: 'projects' as const, Icon: FolderIcon, label: t('projects') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700/50 z-40">
      <div className="flex items-center justify-around h-full">
          {navItems.map(item => (
            <NavItem
              key={item.view}
              Icon={item.Icon}
              label={item.label}
              isActive={currentView === item.view}
              onClick={() => onSelectView(item.view)}
            />
          ))}
      </div>
    </div>
  );
};

export default BottomNavBar;