import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured =
  typeof supabaseUrl === 'string' &&
  typeof supabaseAnonKey === 'string' &&
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon');

if (!isConfigured) {
  console.warn(
    'Supabase is not configured. Cloud sync is disabled. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to enable.'
  );
}

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const isSupabaseConfigured = isConfigured;
