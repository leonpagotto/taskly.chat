import { getSupabase } from './supabaseClient';

export type AuthSession = {
	userId: string;
	email?: string | null;
	emailConfirmed: boolean;
	lastSignInAt?: string | null;
};

type AuthResult = { error?: string; requiresVerification?: boolean };

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

export const authService = {
	isEnabled(): boolean { return !!getSupabase(); },
	async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: redirectTo,
			},
		});
		if (error) return { error: error.message };
		const requiresVerification = !data.session;
		cacheVerificationTimestamp(email);
		return { requiresVerification };
	},
	async signInWithPassword(email: string, password: string): Promise<AuthResult> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			const message = error.message || 'Unable to sign in';
			const requiresVerification = /confirm your email/i.test(message) || error.status === 400;
			return { error: message, requiresVerification };
		}
		return { requiresVerification: !data.session };
	},
	async resendVerification(email: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		const { error } = await supabase.auth.resend({ type: 'signup', email });
		if (error) return { error: error.message };
		cacheVerificationTimestamp(email);
		return {};
	},
	async signInWithMagicLink(email: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;
		const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
		if (error) return { error: error.message };
		return {};
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
		const { data } = await supabase.auth.getUser();
		return mapUserToSession(data.user);
	},
	onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
		const supabase = getSupabase();
		if (!supabase) return () => {};
		const { data: subscription } = supabase.auth.onAuthStateChange(async () => {
			const { data } = await supabase.auth.getUser();
			callback(mapUserToSession(data.user));
		});
		return () => subscription.subscription.unsubscribe();
	}
};

