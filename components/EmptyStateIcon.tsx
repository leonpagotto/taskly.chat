import React from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const sizeMap: Record<Size, string> = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-20 h-20',
  xl: 'w-24 h-24',
};

const iconSizeMap: Record<Size, string> = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

interface EmptyStateIconProps {
  icon: React.ReactElement;
  size?: Size;
  circleClassName?: string;
  iconClassName?: string;
}

/**
 * Renders a perfect light-gray circle with a centered icon whose glyph uses the primary gradient.
 * Usage: <EmptyStateIcon icon={<SomeIcon className="text-4xl" />} size="lg" />
 */
const EmptyStateIcon: React.FC<EmptyStateIconProps> = ({ icon, size = 'lg', circleClassName = '', iconClassName = '' }) => {
  // Add a small default margin-bottom (~10px) to create breathing room before titles
  const circleClasses = `${sizeMap[size]} rounded-full bg-gray-200 dark:bg-gray-700/50 flex items-center justify-center shadow-sm mb-[10px] ${circleClassName}`;
  const gradientClasses = `bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 bg-clip-text text-transparent`;
  const enforcedSize = iconSizeMap[size];

  const iconWithGradient = React.cloneElement(icon, {
    className: `${icon.props.className ?? ''} ${gradientClasses} ${enforcedSize} ${iconClassName}`.trim(),
  });

  return (
    <div className={circleClasses}>
      {iconWithGradient}
    </div>
  );
};

export default EmptyStateIcon;
