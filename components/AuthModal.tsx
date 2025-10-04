import React, { useMemo, useState } from 'react';
import { CloseIcon } from './icons';
import ModalOverlay from './ModalOverlay';

type AuthMode = 'sign-in' | 'sign-up';

type AuthModalProps = {
	onClose: () => void;
	onSignIn: (email: string, password: string) => Promise<{ error?: string; requiresVerification?: boolean }>;
	onSignUp: (email: string, password: string) => Promise<{ error?: string; requiresVerification?: boolean }>;
	onResendVerification: (email: string) => Promise<{ error?: string }>;
	onMagicLink?: (email: string) => Promise<{ error?: string }>;
	onGoogle?: () => Promise<{ error?: string }>;
};

const passwordsMatch = (password: string, confirm: string): boolean => password.trim().length > 0 && password === confirm;

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSignIn, onSignUp, onResendVerification, onMagicLink, onGoogle }) => {
	const [mode, setMode] = useState<AuthMode>('sign-in');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

	const title = mode === 'sign-in' ? 'Welcome back' : 'Create your account';

	const disablePrimary = useMemo(() => {
		if (status === 'loading') return true;
		if (!email || !password) return true;
		if (mode === 'sign-up' && !passwordsMatch(password, confirmPassword)) return true;
		return false;
	}, [status, email, password, confirmPassword, mode]);

	const resetFeedback = () => {
		setError(null);
		setMessage(null);
		setStatus('idle');
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setStatus('loading');
		setError(null);
		setMessage(null);
		const trimmedEmail = email.trim().toLowerCase();
		const trimmedPassword = password.trim();
		const action = mode === 'sign-in' ? onSignIn : onSignUp;
		if (mode === 'sign-up' && !passwordsMatch(trimmedPassword, confirmPassword.trim())) {
			setError('Passwords do not match.');
			setStatus('error');
			return;
		}
		const result = await action(trimmedEmail, trimmedPassword);
		if (result.error) {
			setError(result.error);
			if (result.requiresVerification) {
				setPendingVerificationEmail(trimmedEmail);
				setMessage('Please confirm your email to continue. We can resend the verification email below.');
			}
			setStatus('error');
			return;
		}
		if (result.requiresVerification) {
			setStatus('success');
			setPendingVerificationEmail(trimmedEmail);
			setMessage(mode === 'sign-up'
				? 'Check your inbox to verify your email. You can sign in after confirmation.'
				: 'Your email is not yet verified. Please confirm it from your inbox.');
			if (mode === 'sign-up') {
				setMode('sign-in');
				setPassword('');
				setConfirmPassword('');
			}
		} else {
			// Successful sign-in without verification required
			setStatus('success');
			setMessage('Signing you in...');
			// Modal will be closed by parent component when authSession is set
		}
	};

	const handleMagicLink = async () => {
		if (!onMagicLink) return;
		resetFeedback();
		setStatus('loading');
		const trimmedEmail = email.trim().toLowerCase();
		const res = await onMagicLink(trimmedEmail);
		if (res.error) {
			setError(res.error);
			setStatus('error');
			return;
		}
		setStatus('success');
		setMessage('Check your email for the magic link to finish signing in.');
	};

	const handleResend = async () => {
		if (!pendingVerificationEmail) return;
		setStatus('loading');
		const res = await onResendVerification(pendingVerificationEmail);
		if (res.error) {
			setError(res.error);
			setStatus('error');
			return;
		}
		setStatus('success');
		setMessage('Verification email sent again. Please check your inbox.');
	};

	return (
		<ModalOverlay className="flex items-center justify-center p-4" onClick={onClose}>
			<div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md" onClick={e => e.stopPropagation()}>
				<header className="p-4 flex items-center justify-between border-b border-gray-700">
					<h2 className="text-lg font-semibold">{title}</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
				</header>
				<div className="px-6 pt-4">
					<div className="flex bg-gray-900/40 rounded-lg p-1 text-sm">
						<button
							type="button"
							className={`flex-1 py-1 rounded-md transition ${mode === 'sign-in' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
							onClick={() => { setMode('sign-in'); resetFeedback(); }}
						>
							Sign in
						</button>
						<button
							type="button"
							className={`flex-1 py-1 rounded-md transition ${mode === 'sign-up' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white'}`}
							onClick={() => { setMode('sign-up'); resetFeedback(); }}
						>
							Create account
						</button>
					</div>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm text-gray-300">Email</label>
						<input
							type="email"
							required
							value={email}
							onChange={e => setEmail(e.target.value)}
							placeholder="you@example.com"
							className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
						/>
					</div>
					<div>
						<label className="block text-sm text-gray-300">Password</label>
						<input
							type="password"
							required
							value={password}
							onChange={e => setPassword(e.target.value)}
							minLength={8}
							placeholder="Enter at least 8 characters"
							className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
						/>
					</div>
					{mode === 'sign-up' && (
						<div>
							<label className="block text-sm text-gray-300">Confirm password</label>
							<input
								type="password"
								required
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								minLength={8}
								className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
							/>
							{confirmPassword && !passwordsMatch(password, confirmPassword) && (
								<p className="text-xs text-amber-300 mt-1">Passwords don’t match yet.</p>
							)}
						</div>
					)}
					{error && <div className="text-sm text-red-400">{error}</div>}
					{message && <div className="text-sm text-emerald-400">{message}</div>}
					<button
						type="submit"
						disabled={disablePrimary}
						className="w-full px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-purple-600 text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed"
					>
						{status === 'loading' ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
					</button>
					{mode === 'sign-in' && onMagicLink && (
						<button
							type="button"
							className="w-full text-sm text-gray-300 hover:text-white underline-offset-2"
							onClick={handleMagicLink}
						>
							Prefer a magic link instead?
						</button>
					)}
					{pendingVerificationEmail && (
						<div className="border border-gray-700 rounded-lg p-3 text-sm text-gray-200 bg-gray-700/40 space-y-2">
							<p>Email verification required for <span className="font-semibold">{pendingVerificationEmail}</span>.</p>
							<button
								type="button"
								className="text-[var(--color-primary-400)] hover:text-[var(--color-primary-200)] underline-offset-2"
								onClick={handleResend}
							>
								Resend verification email
							</button>
						</div>
					)}
					{onGoogle && (
						<div className="pt-2">
							<button
								type="button"
								onClick={async () => {
								resetFeedback();
								setStatus('loading');
								const res = await onGoogle();
								if (res?.error) {
									setError(res.error);
									setStatus('error');
								} else {
									setStatus('success');
									setMessage('Continue in the browser to finish Google authentication.');
								}
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

