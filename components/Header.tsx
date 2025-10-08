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
  <header className="flex items-center justify-between px-4 py-3 flex-shrink-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-400 hover:text-gray-100 transition-transform duration-150 hover:scale-105"
        >
          <WidthNormalIcon className="w-6 h-6" />
        </button>
        <div className="text-xl font-semibold truncate flex items-center gap-4" style={{ color: '#FFFFFF' }}>
          <span>{title}</span>
          {leftExtras && (
            <div className="hidden md:flex items-center gap-3">
              {leftExtras}
            </div>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
        {onOpenSearch && (
          <button
            onClick={onOpenSearch}
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius-button)] resend-secondary"
            title="Search (⌘/Ctrl+K)"
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        )}
        {children}
      </div>
    </header>
  );
};

export default Header;