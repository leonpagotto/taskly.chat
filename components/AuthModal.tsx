import React, { useState } from 'react';
import { CloseIcon } from './icons';
import ModalOverlay from './ModalOverlay';

export const AuthModal: React.FC<{ onClose: () => void; onSubmit: (email: string) => Promise<{ error?: string }>; onGoogle?: () => Promise<{ error?: string }>; }> = ({ onClose, onSubmit, onGoogle }) => {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('sending');
		setError(null);
		const res = await onSubmit(email.trim());
		if (res.error) {
			setError(res.error);
			setStatus('error');
		} else {
			setStatus('sent');
		}
	};

	return (
		<ModalOverlay className="flex items-center justify-center p-4" onClick={onClose}>
			<div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
				<header className="p-4 flex items-center justify-between border-b border-gray-700">
					<h2 className="text-lg font-semibold">Sign in</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
				</header>
				<form onSubmit={handleSubmit} className="p-6 space-y-3">
					<label className="block text-sm text-gray-300">Email</label>
					<input
						type="email"
						required
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="you@example.com"
						className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
					/>
					{error && <div className="text-sm text-red-400">{error}</div>}
					{status === 'sent' && <div className="text-sm text-green-400">Check your email for the sign-in link.</div>}
					<button
						type="submit"
						disabled={status === 'sending' || status === 'sent'}
						className="w-full px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600"
					>
						{status === 'sending' ? 'Sending…' : status === 'sent' ? 'Email sent' : 'Send magic link'}
					</button>
					{onGoogle && (
						<div className="pt-2">
							<button
								type="button"
								onClick={async () => {
									setStatus('sending');
									setError(null);
									const res = await onGoogle();
									if (res?.error) { setError(res.error); setStatus('error'); } else { setStatus('sent'); }
								}}
								className="w-full px-4 py-2 bg-white text-gray-900 rounded-[var(--radius-button)] font-semibold hover:shadow-lg flex items-center justify-center gap-2"
							>
								<span className="material-symbols-outlined">google</span>
								<span>Continue with Google</span>
							</button>
						</div>
					)}
				</form>
			</div>
		</ModalOverlay>
	);
};

export default AuthModal;

