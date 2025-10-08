import React from 'react';

interface TasklyLogoProps {
  /** Optional Tailwind or custom classes for layout tweaks */
  className?: string;
  /** Size in pixels; the logo scales proportionally */
  size?: number;
  /** Accessible label announced to screen readers (defaults to “Taskly”) */
  label?: string;
  /** When true, hides the logo from assistive tech while keeping it visible in the UI */
  decorative?: boolean;
  /** Enables a subtle glow to help the logo pop against dark surfaces */
  glow?: boolean;
  /** Render a simplified monochrome mark when a single-color treatment is required */
  variant?: 'brand' | 'mono';
  /** Color used for the monochrome variant; ignored for the brand gradient */
  monoColor?: string;
}

const MONO_VIEWBOX = '0 -960 960 960';
const MONO_PATH =
  'M76.41-114.5v-87.41H234.5v-154.5h-78.09v-87.18h82.09q12.48-76.19 67.93-130.81 55.46-54.62 131.66-67.1V-851H725.5v163.59H521.91v45.88q76.2 12.51 131.66 67.13 55.45 54.62 67.93 130.81h82.09v87.18H725.5v154.5h158.09v87.41H76.41Zm245.5-87.41h114.5v-154.5h-114.5v154.5Zm201.68 0h114.5v-154.5h-114.5v154.5ZM328.63-443.59h302.74q-14.48-51.08-56.64-82.79-42.16-31.71-94.73-31.71-52.57 0-94.73 31.71-42.16 31.71-56.64 82.79Zm151.37 0Z';

const TasklyLogo: React.FC<TasklyLogoProps> = ({
  className = '',
  size = 24,
  label = 'Taskly',
  decorative = false,
  glow = true,
  variant = 'brand',
  monoColor = '#FFFFFF'
}) => {
  const resolvedVariant = variant;
  const dimension = size;
  const boxShadow = glow
    ? '0 14px 32px rgba(21, 7, 51, 0.35)'
    : undefined;

  if (resolvedVariant === 'mono') {
    return (
      <svg
        role={decorative ? 'presentation' : 'img'}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : label}
        className={`inline-block align-middle ${className}`.trim()}
        width={dimension}
        height={dimension}
        viewBox={MONO_VIEWBOX}
        style={{
          width: dimension,
          height: dimension,
          display: 'inline-block'
        }}
      >
        {!decorative && <title>{label}</title>}
        <path fill={monoColor} d={MONO_PATH} />
      </svg>
    );
  }

  return (
    <img
      src="/taskly_symbol.svg"
      width={dimension}
      height={dimension}
      alt={decorative ? '' : label}
      aria-hidden={decorative || undefined}
      className={`inline-block align-middle ${className}`.trim()}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension * 0.25,
        display: 'inline-block',
        boxShadow,
        filter: glow ? 'saturate(1.05)' : undefined
      }}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
};

export default TasklyLogo;
