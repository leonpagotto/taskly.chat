import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton Supabase client for the app
let client: SupabaseClient | null = null;

export function getSupabase() {
  if (client) {
    return client;
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error('Missing Supabase environment variables');
  }

  try {
    console.log('🔐 [supabaseClient] Initializing Supabase client with custom storage');
    
    // Custom storage that handles localStorage errors gracefully
    const customStorage = {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.warn('🔐 [supabaseClient] localStorage.getItem failed:', e);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('🔐 [supabaseClient] localStorage.setItem failed:', e);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('🔐 [supabaseClient] localStorage.removeItem failed:', e);
        }
      },
    };
    
    client = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: customStorage,
      },
    });

    console.log('🔐 [supabaseClient] ✅ Client created successfully');
    return client;
  } catch (error) {
    console.error('🔐 [supabaseClient] ❌ Failed to create client:', error);
    throw error;
  }
}

export const hasSupabaseEnv = (): boolean => {
  return !!(import.meta as any).env?.VITE_SUPABASE_URL && !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
};
