import React, { useState, useEffect, useRef } from 'react';

interface ImprovedSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface ImprovedSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ImprovedSelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * ImprovedSelect - Mobile-friendly dropdown with proper chevron and styling
 * 
 * Features:
 * - Custom chevron with smooth rotation
 * - Better touch targets for mobile
 * - Smooth animations
 * - Proper z-index stacking
 * - Click-outside handling
 */
const ImprovedSelect: React.FC<ImprovedSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  icon,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-2
          bg-gray-700/50 rounded-lg px-3 py-2.5
          text-sm text-left
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]
          transition-all
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/70 cursor-pointer'}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && <span className="flex-shrink-0 text-gray-400">{icon}</span>}
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <span className={`truncate ${selectedOption ? 'text-white' : 'text-gray-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        
        {/* Improved Chevron */}
        <svg 
          className={`
            w-5 h-5 flex-shrink-0 text-gray-400
            transition-transform duration-200
            ${isOpen ? 'rotate-180' : 'rotate-0'}
          `}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="
            absolute z-20 w-full mt-1
            bg-gray-700 border border-gray-600 rounded-lg 
            shadow-xl
            max-h-60 overflow-y-auto
            animate-fade-in-down
          "
        >
          <ul className="py-1">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  disabled={option.disabled}
                  className={`
                    w-full text-left flex items-center gap-2 px-3 py-2.5
                    transition-colors text-sm
                    ${option.disabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-600 cursor-pointer'
                    }
                    ${option.value === value ? 'bg-gray-600/50 text-white' : 'text-gray-200'}
                  `}
                >
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <span className="truncate">{option.label}</span>
                  {option.value === value && (
                    <svg className="w-4 h-4 ml-auto flex-shrink-0 text-[var(--color-primary-600)]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImprovedSelect;
