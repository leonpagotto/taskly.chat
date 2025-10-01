import React from 'react';

type ModalOverlayProps = {
	children?: React.ReactNode;
	onClick?: () => void;
	className?: string;
	role?: 'dialog' | 'alertdialog';
};

/**
 * ModalOverlay
 * - Centralized overlay to ensure consistent z-index above the sidebar and other UI.
 * - Default z-index is 100 (sidebar uses 60). Can be overridden via className (e.g., "z-[110]").
 * - Includes a subtle backdrop blur for visual polish and click-to-dismiss support when onClick provided.
 */
const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClick, className = '', role = 'dialog' }) => {
	const baseClasses = 'fixed inset-0 bg-gray-900/70 backdrop-blur-[2px] z-[100]';
	return (
		<div className={`${baseClasses} ${className}`} onClick={onClick} aria-modal="true" role={role}>
			{children}
		</div>
	);
};

export default ModalOverlay;

