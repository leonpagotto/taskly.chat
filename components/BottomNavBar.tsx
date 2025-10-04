import React from 'react';
import { TodayIcon, NewHabitIcon, ListAltIcon, DescriptionIcon, FolderIcon, CalendarMonthIcon, Icon } from './icons';
const FeedbackIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="rate_review" className={className} />;

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
  onOpenFeedback?: () => void;
  t: (key: string) => string;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onSelectView, onOpenFeedback, t }) => {
  const navItems: Array<{ key: string; Icon: React.ComponentType<{ className?: string }>; label: string; isActive: boolean; onClick: () => void }> = [
    { key: 'dashboard', Icon: TodayIcon, label: t('dashboard'), onClick: () => onSelectView('dashboard'), isActive: currentView === 'dashboard' },
    { key: 'habits', Icon: NewHabitIcon, label: t('habits'), onClick: () => onSelectView('habits'), isActive: currentView === 'habits' },
    { key: 'calendar', Icon: CalendarMonthIcon, label: t('calendar'), onClick: () => onSelectView('calendar'), isActive: currentView === 'calendar' },
    { key: 'lists', Icon: ListAltIcon, label: t('tasks'), onClick: () => onSelectView('lists'), isActive: currentView === 'lists' },
    { key: 'notes', Icon: DescriptionIcon, label: t('notes'), onClick: () => onSelectView('notes'), isActive: currentView === 'notes' },
  ];

  // Feedback removed from bottom nav (still available in sidebar)

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700/50 z-40">
      <div className="flex items-center justify-around h-full">
          {navItems.map(item => (
            <NavItem
              key={item.key}
              Icon={item.Icon}
              label={item.label}
              isActive={item.isActive}
              onClick={item.onClick}
            />
          ))}
      </div>
    </div>
  );
};

export default BottomNavBar;