import { getSupabase } from './supabaseClient';

// The app uses a single JSON blob per user for simplicity.
// Table: app_state (user_id uuid primary key, data jsonb, updated_at timestamptz)

type AppStatePayload = {
	projects: any;
	conversations: any;
	checklists: any;
	habits: any;
	events: any;
	stories: any;
	requests: any;
	userCategories: any;
	preferences: any;
	notes: any;
	projectFiles: any;
};

export const databaseService = {
	isEnabled(): boolean { return !!getSupabase(); },
	async loadAppState(userId: string): Promise<AppStatePayload | null> {
		const supabase = getSupabase();
		if (!supabase) return null;
		const { data, error } = await supabase
			.from('app_state')
			.select('data')
			.eq('user_id', userId)
			.single();
		if (error || !data) return null;
		return (data as any).data as AppStatePayload;
	},
	async saveAppState(userId: string, payload: AppStatePayload): Promise<void> {
		const supabase = getSupabase();
		if (!supabase) return;
		const { error } = await supabase
			.from('app_state')
			.upsert({ user_id: userId, data: payload }, { onConflict: 'user_id' });
		if (error) throw error;
	},
};

