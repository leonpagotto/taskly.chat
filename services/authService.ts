import { getSupabase } from './supabaseClient';

export type AuthSession = {
	userId: string;
	email?: string | null;
	emailConfirmed: boolean;
	lastSignInAt?: string | null;
};

type AuthResult = { error?: string; requiresVerification?: boolean; session?: AuthSession | null };

const mapUserToSession = (user: any | null): AuthSession | null => {
	if (!user) return null;
	return {
		userId: user.id,
		email: user.email,
		emailConfirmed: Boolean(user.email_confirmed_at),
		lastSignInAt: user.last_sign_in_at || null,
	};
};

export const VERIFICATION_STORAGE_KEY = 'taskly.pendingVerificationEmail';

const cacheVerificationTimestamp = (email: string) => {
	if (typeof window === 'undefined') return;
	try {
		const payload = { email: email.toLowerCase(), sentAt: new Date().toISOString() };
		window.localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// ignore storage failures
	}
};

// Helper to add timeout to async operations
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> => {
	return Promise.race([
		promise,
		new Promise<T>((_, reject) => 
			setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs}ms. Please check your internet connection and try again.`)), timeoutMs)
		)
	]);
};

export const authService = {
	isEnabled(): boolean { return !!getSupabase(); },
	async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
		try {
			const { data, error } = await withTimeout(
				supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: redirectTo,
					},
				}),
				10000,
				'Sign up'
			);
			if (error) return { error: error.message };
			const requiresVerification = !data.session;
			cacheVerificationTimestamp(email);
			return { requiresVerification };
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Sign up failed' };
		}
	},
	async signInWithPassword(email: string, password: string): Promise<AuthResult> {
		console.log('🔐 [authService] signInWithPassword called');
		const supabase = getSupabase();
		if (!supabase) {
			console.error('🔐 [authService] Supabase not configured!');
			return { error: 'Supabase not configured' };
		}
		
		try {
			console.log('🔐 [authService] About to call signInWithPassword...');
			console.log('🔐 [authService] Email:', email);
			
			// Add explicit promise wrapping to track execution
			const startTime = Date.now();
			console.log('🔐 [authService] START TIME:', new Date(startTime).toISOString());
			
			const signInPromise = supabase.auth.signInWithPassword({ email, password });
			console.log('🔐 [authService] Promise created, awaiting response...');
			
			const result = await signInPromise;
			const endTime = Date.now();
			console.log('🔐 [authService] END TIME:', new Date(endTime).toISOString(), 'Duration:', endTime - startTime, 'ms');
			
			const { data, error } = result;
			console.log('🔐 [authService] ✅ Sign-in completed');
			
			if (error) {
				const message = error.message || 'Unable to sign in';
				const requiresVerification = /confirm your email/i.test(message) || error.status === 400;
				console.error('🔐 [authService] Sign-in error:', message, 'requiresVerification:', requiresVerification);
				return { error: message, requiresVerification };
			}
			
			let mappedSession: AuthSession | null = null;
			if (data?.session) {
				console.log('🔐 [authService] ✅ Session created successfully');
				mappedSession = mapUserToSession(data.session.user);
			}

			const returnResult: AuthResult = { requiresVerification: !data.session, session: mappedSession };
			console.log('🔐 [authService] Sign-in successful, result:', returnResult);
			return returnResult;
		} catch (err) {
			console.error('🔐 [authService] ❌ Sign-in exception:', err);
			return { error: err instanceof Error ? err.message : 'Sign in failed' };
		}
	},
	async resendVerification(email: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		try {
			const { error } = await withTimeout(
				supabase.auth.resend({ type: 'signup', email }),
				10000,
				'Resend verification'
			);
			if (error) return { error: error.message };
			cacheVerificationTimestamp(email);
			return {};
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Failed to resend verification' };
		}
	},
	async signInWithMagicLink(email: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		try {
			const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
			const { error } = await withTimeout(
				supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } }),
				10000,
				'Magic link sign in'
			);
			if (error) return { error: error.message };
			return {};
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Failed to send magic link' };
		}
	},
	async resetPassword(email: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		try {
			const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/reset-password` : undefined;
			const { error } = await withTimeout(
				supabase.auth.resetPasswordForEmail(email, { redirectTo }),
				10000,
				'Password reset'
			);
			if (error) return { error: error.message };
			return {};
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Failed to send password reset email' };
		}
	},
	async updatePassword(newPassword: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		try {
			const { error } = await withTimeout(
				supabase.auth.updateUser({ password: newPassword }),
				10000,
				'Password update'
			);
			if (error) return { error: error.message };
			return {};
		} catch (err) {
			return { error: err instanceof Error ? err.message : 'Failed to update password' };
		}
	},
		async signInWithGoogle(): Promise<{ error?: string }> {
			const supabase = getSupabase();
			if (!supabase) return { error: 'Supabase not configured' };
			const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined } });
			if (error) return { error: error.message };
			return {};
		},
		async linkWithGoogle(): Promise<{ error?: string }> {
			const supabase = getSupabase();
			if (!supabase) return { error: 'Supabase not configured' };
			const { error } = await supabase.auth.linkIdentity({ provider: 'google' as any });
			if (error) return { error: error.message };
			return {};
		},
	async signOut(): Promise<void> {
		const supabase = getSupabase();
		if (!supabase) return;
		await supabase.auth.signOut();
	},
	async getSession(): Promise<AuthSession | null> {
		const supabase = getSupabase();
		if (!supabase) return null;
		const { data, error } = await supabase.auth.getSession();
		if (error) {
			console.error('🔐 [authService] getSession error:', error);
			return null;
		}
		return mapUserToSession(data.session?.user ?? null);
	},
	onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
		const supabase = getSupabase();
		if (!supabase) return () => {};
		const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log('🔐 [authService] onAuthStateChange event:', event, 'session:', session);
			if (session?.user) {
				callback(mapUserToSession(session.user));
				return;
			}
			const { data, error } = await supabase.auth.getUser();
			if (error) {
				console.error('🔐 [authService] getUser error inside onAuthStateChange:', error);
			}
			callback(mapUserToSession(data.user));
		});
		return () => subscription.subscription.unsubscribe();
	}
};

