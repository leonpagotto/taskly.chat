import React from 'react';
import { CloseIcon } from './icons';

interface ImprovedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  fullScreenOnMobile?: boolean;
}

/**
 * ImprovedModal - Mobile-first responsive modal component
 * 
 * Features:
 * - Mobile: Full screen with slide-up animation from bottom
 * - Desktop: Centered with max-width, fade-in animation
 * - Sticky header and footer for better scrolling
 * - Backdrop blur effect
 * - Proper z-index stacking
 */
const ImprovedModal: React.FC<ImprovedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'lg',
  fullScreenOnMobile = true
}) => {
  if (!isOpen) return null;

  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div 
      className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 md:flex md:items-center md:justify-center md:p-4"
      onClick={onClose}
    >
      <div 
        className={`
          ${fullScreenOnMobile ? 'fixed inset-0 md:relative md:inset-auto' : 'relative'}
          bg-gray-800 
          ${fullScreenOnMobile ? 'rounded-none md:rounded-2xl' : 'rounded-2xl'}
          border ${fullScreenOnMobile ? 'border-0 md:border' : 'border'} border-gray-700 
          w-full ${maxWidthClasses[maxWidth]}
          ${fullScreenOnMobile ? 'h-full md:h-auto' : 'h-auto'}
          md:max-h-[90vh]
          flex flex-col
          animate-slide-in-up md:animate-fade-in-down
          shadow-2xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-xl border-b border-gray-700 p-4 md:p-5 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Sticky Footer (if provided) */}
        {footer && (
          <footer className="sticky bottom-0 z-10 bg-gray-800/95 backdrop-blur-xl border-t border-gray-700 p-4 md:p-5">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default ImprovedModal;
