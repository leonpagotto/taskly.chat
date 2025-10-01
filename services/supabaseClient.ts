import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton Supabase client for the app
let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (client) return client;
  const url = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
  const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anon) return null;
  client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return client;
};

export const hasSupabaseEnv = (): boolean => {
  return !!(import.meta as any).env?.VITE_SUPABASE_URL && !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
};
