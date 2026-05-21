import { createClient } from '@supabase/supabase-js';

// Publishable anon keys are designed to be exposed to browsers — they only
// grant the permissions allowed by Row-Level Security policies. Override via
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in a .env or Vercel project
// settings when you want to point at a different environment.
const SUPABASE_URL =
  (import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  'https://vennbviwdmcyhcmwdncd.supabase.co';
const SUPABASE_ANON_KEY =
  (import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_OYBl8Cm2xDTYedy73fsnug_expNcRQg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'kkk_auth',
  },
});
