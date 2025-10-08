import React from 'react';
import EmptyStateIcon from './EmptyStateIcon';
import { emptyStatePrimaryButtonClass, emptyStateSecondaryButtonClass } from './buttonStyles';

type ActionVariant = 'primary' | 'secondary';

interface EmptyStateAction {
	label: React.ReactNode;
	onClick: () => void;
	icon?: React.ReactNode;
	variant?: ActionVariant;
}

interface EmptyStateProps {
	icon: React.ReactElement;
	title: React.ReactNode;
	description?: React.ReactNode;
	primaryAction?: EmptyStateAction;
	secondaryAction?: EmptyStateAction;
	className?: string;
	children?: React.ReactNode;
	variant?: 'elevated' | 'minimal';
}

const actionClassMap: Record<ActionVariant, string> = {
	primary: `${emptyStatePrimaryButtonClass} disabled:opacity-60 disabled:pointer-events-none`,
	secondary: `${emptyStateSecondaryButtonClass} disabled:opacity-60 disabled:pointer-events-none`,
};

const renderAction = (action: EmptyStateAction, fallbackVariant: ActionVariant) => {
	const variant = action.variant ?? fallbackVariant;
	return (
		<button
			key={String(action.label)}
			type="button"
			onClick={action.onClick}
			className={actionClassMap[variant]}
		>
			{action.icon && <span className="text-base">{action.icon}</span>}
			<span>{action.label}</span>
		</button>
	);
};

const EmptyState: React.FC<EmptyStateProps> = ({
	icon,
	title,
	description,
	primaryAction,
	secondaryAction,
	className = '',
	children,
	variant = 'elevated',
}) => {
	const isElevated = variant === 'elevated';
	const containerClassName = [
		'relative flex flex-col items-center justify-center text-center gap-5',
		isElevated
			? 'rounded-[32px] px-8 py-14 shadow-[0_28px_80px_rgba(15,0,40,0.45)] bg-[rgba(14,10,26,0.92)] border border-white/12 backdrop-blur-2xl'
			: 'px-4 sm:px-6 py-12 sm:py-16 rounded-[28px] bg-transparent border-none shadow-none',
		className,
	]
		.filter(Boolean)
		.join(' ')
		.trim();

	const titleClassName = isElevated
		? 'text-3xl font-semibold text-slate-50 tracking-tight leading-tight'
		: 'text-2xl sm:text-3xl font-semibold text-slate-100 tracking-tight';

	const descriptionClassName = isElevated
		? 'max-w-xl text-base text-slate-300/95 mx-auto leading-relaxed'
		: 'max-w-2xl text-base sm:text-lg text-slate-300/90 mx-auto leading-relaxed';

	return (
		<div className={containerClassName} data-elevated={isElevated ? 'true' : undefined}>
			{isElevated && (
				<div
					className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-br from-[var(--color-primary-600)]/22 via-transparent to-white/6 opacity-90"
					aria-hidden="true"
				/>
			)}
			<div className="relative flex flex-col items-center justify-center gap-4">
				<EmptyStateIcon icon={icon} size="lg" />
				<div className="space-y-3">
					<h2 className={titleClassName}>{title}</h2>
					{description && <p className={descriptionClassName}>{description}</p>}
				</div>
				{(primaryAction || secondaryAction) && (
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
						{primaryAction && renderAction(primaryAction, 'primary')}
						{secondaryAction && renderAction(secondaryAction, 'secondary')}
					</div>
				)}
				{children}
			</div>
		</div>
	);
};

export default EmptyState;
