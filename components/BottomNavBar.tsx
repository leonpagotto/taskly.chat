import React from 'react';
import { TodayIcon, NewHabitIcon, ListAltIcon, DescriptionIcon, FolderIcon, CalendarMonthIcon, Icon, FilePresentIcon } from './icons';

import { AppView, BottomNavItemKey } from '../types';
import { subscriptionService } from '../services/subscriptionService';

const RequestsIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="concierge" className={className} />;
const StoriesIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="auto_stories" className={className} />;
const CategoriesIcon: React.FC<{ className?: string }> = ({ className }) => <Icon name="category" className={className} />;

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
    className={[
      'group flex flex-col items-center justify-center gap-0 w-16 h-full transition-transform transition-colors duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(139,92,246,0.45)] focus-visible:ring-offset-2',
      'ring-offset-transparent'
    ].join(' ')}
  >
    <span className="flex items-center justify-center">
      <Icon
        className={
          [
            'text-[22px] leading-none drop-shadow-[0_6px_18px_rgba(124,58,237,0.28)]',
            isActive
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)]'
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
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] drop-shadow-[0_6px_18px_rgba(124,58,237,0.25)]'
            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-200'
        ].join(' ')
      }
    >
      {label}
    </span>
  </button>
);

const BOTTOM_NAV_CANONICAL_ORDER: BottomNavItemKey[] = ['dashboard', 'lists', 'habits', 'notes', 'requests', 'calendar', 'stories', 'files', 'projects', 'categories'];
const DEFAULT_BOTTOM_NAV_ITEMS: BottomNavItemKey[] = ['dashboard', 'lists', 'habits', 'notes', 'requests', 'calendar'];
const MAX_BOTTOM_NAV_ITEMS = 6;

const resolveNavKeys = (keys?: BottomNavItemKey[] | null): BottomNavItemKey[] => {
  if (Array.isArray(keys) && keys.length) {
    const cleaned: BottomNavItemKey[] = [];
    const seen = new Set<BottomNavItemKey>();
    for (const key of keys) {
      if (!BOTTOM_NAV_CANONICAL_ORDER.includes(key)) continue;
      if (seen.has(key)) continue;
      cleaned.push(key);
      seen.add(key);
      if (cleaned.length >= MAX_BOTTOM_NAV_ITEMS) break;
    }
    if (cleaned.length) {
      return cleaned;
    }
  }
  return [...DEFAULT_BOTTOM_NAV_ITEMS];
};

interface BottomNavBarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenFeedback?: () => void;
  t: (key: string) => string;
  selectedItems?: BottomNavItemKey[] | null;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onSelectView, onOpenFeedback: _onOpenFeedback, t, selectedItems }) => {
  const navConfig: Record<BottomNavItemKey, { Icon: React.ComponentType<{ className?: string }>; label: string; view: AppView }> = {
    dashboard: { Icon: TodayIcon, label: t('dashboard'), view: 'dashboard' },
    lists: { Icon: ListAltIcon, label: t('tasks'), view: 'lists' },
    habits: { Icon: NewHabitIcon, label: t('habits'), view: 'habits' },
    notes: { Icon: DescriptionIcon, label: t('notes'), view: 'notes' },
    requests: { Icon: RequestsIcon, label: 'Requests', view: 'requests' },
    calendar: { Icon: CalendarMonthIcon, label: t('calendar'), view: 'calendar' },
    stories: { Icon: StoriesIcon, label: 'Stories', view: 'stories' },
    files: { Icon: FilePresentIcon, label: t('files'), view: 'files' },
    projects: { Icon: FolderIcon, label: t('projects'), view: 'projects' },
    categories: { Icon: CategoriesIcon, label: 'Categories', view: 'categories' },
  };

  const subscriptionInfo = subscriptionService.getSubscriptionInfo();
  // Stories is tied to Enterprise access—hide the entry gracefully when not available.
  const hasStoriesFeature = !!subscriptionInfo?.limits?.storiesFeature;

  const navItems = resolveNavKeys(selectedItems).map(key => {
    if (key === 'stories' && !hasStoriesFeature) return null;
    const config = navConfig[key];
    if (!config) return null;
    return {
      key,
      Icon: config.Icon,
      label: config.label,
      isActive: currentView === config.view,
      onClick: () => onSelectView(config.view),
    };
  }).filter(Boolean) as Array<{ key: BottomNavItemKey; Icon: React.ComponentType<{ className?: string }>; label: string; isActive: boolean; onClick: () => void }>;

  return (
  <div className="fixed bottom-0 left-0 right-0 h-16 resend-glass-panel shadow-xl backdrop-blur-2xl border-0 z-40" data-elevated={true} style={{ border: 'none' }}>
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