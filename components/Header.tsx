import React from 'react';
import { WidthNormalIcon } from './icons';

interface HeaderProps {
  title: React.ReactNode;
  onToggleSidebar: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, onToggleSidebar, children }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <WidthNormalIcon className="w-6 h-6" />
        </button>
        <div className="text-xl font-semibold truncate">{title}</div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-4">
        {children}
      </div>
    </header>
  );
};

export default Header;