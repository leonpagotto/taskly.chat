import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

type ResetPasswordPageProps = {
	onComplete: () => void;
	onCancel: () => void;
};

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onComplete, onCancel }) => {
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Check if we have a valid reset token (Supabase will handle this internally)
	useEffect(() => {
		// If user lands here without a token in URL, Supabase will handle it
		// The token is extracted from the URL hash by Supabase automatically
		console.log('🔐 [ResetPassword] Reset password page loaded');
	}, []);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setStatus('loading');
		setError(null);
		setMessage(null);

		// Validate passwords
		if (newPassword.length < 8) {
			setError('Password must be at least 8 characters long.');
			setStatus('error');
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match.');
			setStatus('error');
			return;
		}

		try {
			console.log('🔐 [ResetPassword] Updating password...');
			const result = await authService.updatePassword(newPassword);
			
			if (result.error) {
				console.error('🔐 [ResetPassword] Update failed:', result.error);
				setError(result.error);
				setStatus('error');
				return;
			}

			console.log('🔐 [ResetPassword] Password updated successfully');
			setStatus('success');
			setMessage('Password updated successfully! Redirecting...');
			
			// Redirect after a short delay
			setTimeout(() => {
				onComplete();
			}, 2000);
		} catch (err) {
			console.error('🔐 [ResetPassword] Unexpected error:', err);
			setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
			setStatus('error');
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
			<div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md p-6">
				<h2 className="text-2xl font-bold mb-2">Reset Your Password</h2>
				<p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm text-gray-300 mb-1">New Password</label>
						<input
							type="password"
							required
							value={newPassword}
							onChange={e => setNewPassword(e.target.value)}
							minLength={8}
							placeholder="Enter at least 8 characters"
							className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
							disabled={status === 'loading' || status === 'success'}
						/>
					</div>

					<div>
						<label className="block text-sm text-gray-300 mb-1">Confirm New Password</label>
						<input
							type="password"
							required
							value={confirmPassword}
							onChange={e => setConfirmPassword(e.target.value)}
							minLength={8}
							placeholder="Re-enter your password"
							className="w-full bg-gray-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-600)]"
							disabled={status === 'loading' || status === 'success'}
						/>
						{confirmPassword && newPassword !== confirmPassword && (
							<p className="text-xs text-amber-300 mt-1">Passwords don't match yet.</p>
						)}
					</div>

					{error && <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3">{error}</div>}
					{message && <div className="text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg p-3">{message}</div>}

					<div className="flex gap-3">
						<button
							type="submit"
							disabled={status === 'loading' || status === 'success' || !newPassword || !confirmPassword}
							className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-end)] text-white rounded-[var(--radius-button)] font-semibold hover:shadow-lg disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition"
						>
							{status === 'loading' ? 'Updating...' : status === 'success' ? 'Success!' : 'Update Password'}
						</button>
						
						{status !== 'success' && (
							<button
								type="button"
								onClick={onCancel}
								className="px-4 py-2 bg-gray-700 text-white rounded-[var(--radius-button)] font-semibold hover:bg-gray-600 transition"
								disabled={status === 'loading'}
							>
								Cancel
							</button>
						)}
					</div>
				</form>

				<div className="mt-6 pt-6 border-t border-gray-700">
					<p className="text-xs text-gray-400">
						If you didn't request a password reset, you can safely ignore this page.
					</p>
				</div>
			</div>
		</div>
	);
};

export default ResetPasswordPage;
