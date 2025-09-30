import React, { useEffect } from 'react';
import { WidthNormalIcon, SearchIcon } from './icons';

interface HeaderProps {
  title: React.ReactNode;
  onToggleSidebar: () => void;
  children?: React.ReactNode; // right side actions
  leftExtras?: React.ReactNode; // content placed just after the title (e.g., filters)
  onOpenSearch?: () => void; // optional global search trigger
}

const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar, children, leftExtras, onOpenSearch }) => {
  useEffect(() => {
    if (!onOpenSearch) return;
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      if ((isMac && e.metaKey && e.key.toLowerCase() === 'k') || (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onOpenSearch]);
  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <WidthNormalIcon className="w-6 h-6" />
        </button>
        <div className="text-xl font-semibold truncate flex items-center gap-4">
          <span>{title}</span>
          {leftExtras && (
            <div className="hidden md:flex items-center gap-3">
              {leftExtras}
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
        {children}
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-button)] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            title="Search (⌘/Ctrl+K)"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;