import { createClient, SupabaseClient } from '@supabase/supabase-js';

type GlobalWithSupabase = typeof globalThis & {
  __tasklySupabaseClient?: SupabaseClient;
};

const getGlobalClient = (): SupabaseClient | null => {
  if (typeof globalThis === 'undefined') return null;
  return (globalThis as GlobalWithSupabase).__tasklySupabaseClient ?? null;
};

const setGlobalClient = (instance: SupabaseClient) => {
  if (typeof globalThis === 'undefined') return;
  (globalThis as GlobalWithSupabase).__tasklySupabaseClient = instance;
};

// Avoid spamming the console if env vars are missing
let hasLoggedMissingEnv = false;

// Singleton Supabase client for the app
let client: SupabaseClient | null = getGlobalClient();

export function getSupabase() {
  if (!client) {
    client = getGlobalClient();
  }

  if (client) {
    return client;
  }

  const env = (import.meta as any).env ?? {};
  const url = env.VITE_SUPABASE_URL;
  const anon = env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    if (!hasLoggedMissingEnv) {
      console.warn('🔐 [supabaseClient] Supabase disabled: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. Falling back to local-only mode.');
      hasLoggedMissingEnv = true;
    }
    return null;
  }

  try {
    console.log('🔐 [supabaseClient] Initializing Supabase client');
    console.log('🔐 [supabaseClient] Testing localStorage access...');
    
    // Test localStorage access
    try {
      const testKey = '__supabase_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      console.log('🔐 [supabaseClient] ✅ localStorage is accessible');
    } catch (e) {
      console.warn('🔐 [supabaseClient] ⚠️ localStorage NOT accessible:', e);
    }
    
    let fetchCounter = 0;
    const loggingFetch: typeof fetch = async (input, init) => {
      const id = ++fetchCounter;
      const method = init?.method ?? 'GET';
      const startedAt = Date.now();
      console.log(`🌐 [supabaseClient][fetch ${id}] ${method} ${typeof input === 'string' ? input : input.toString()}`);
      try {
        const response = await fetch(input, init);
        console.log(`🌐 [supabaseClient][fetch ${id}] status ${response.status} in ${Date.now() - startedAt}ms`);
        return response;
      } catch (err) {
        console.error(`🌐 [supabaseClient][fetch ${id}] failed after ${Date.now() - startedAt}ms`, err);
        throw err;
      }
    };

    client = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: loggingFetch,
      },
    });

    setGlobalClient(client);

    console.log('🔐 [supabaseClient] ✅ Client created successfully');
    return client;
  } catch (error) {
    console.error('🔐 [supabaseClient] ❌ Failed to create client:', error);
    return null;
  }
}

export const hasSupabaseEnv = (): boolean => {
  return !!(import.meta as any).env?.VITE_SUPABASE_URL && !!(import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
};
