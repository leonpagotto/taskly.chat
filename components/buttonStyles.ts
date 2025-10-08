const emptyStateActionBaseClass = "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgba(12,16,32,0.72)]";

// Empty state buttons now use gradient style matching header buttons, slightly bigger for visibility
export const emptyStatePrimaryButtonClass = `px-6 py-3 ${emptyStateActionBaseClass} bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white hover:shadow-lg`;

export const emptyStateSecondaryButtonBaseClass = `${emptyStateActionBaseClass} resend-secondary shadow-[0_14px_42px_rgba(10,12,34,0.45)] hover:shadow-[0_18px_54px_rgba(10,12,34,0.52)]`;

export const emptyStateSecondaryButtonClass = `px-6 py-3 ${emptyStateSecondaryButtonBaseClass}`;
