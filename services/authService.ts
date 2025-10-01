import { getSupabase } from './supabaseClient';

export type AuthSession = {
	userId: string;
	email?: string | null;
};

export const authService = {
	isEnabled(): boolean { return !!getSupabase(); },
	async signInWithMagicLink(email: string): Promise<{ error?: string }> {
		const supabase = getSupabase();
		if (!supabase) return { error: 'Supabase not configured' };
		const { error } = await supabase.auth.signInWithOtp({ email });
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
		if (!data.user) return null;
		return { userId: data.user.id, email: data.user.email };
	},
	onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
		const supabase = getSupabase();
		if (!supabase) return () => {};
		const { data: subscription } = supabase.auth.onAuthStateChange(async () => {
			const { data } = await supabase.auth.getUser();
			callback(data.user ? { userId: data.user.id, email: data.user.email } : null);
		});
		return () => subscription.subscription.unsubscribe();
	}
};

