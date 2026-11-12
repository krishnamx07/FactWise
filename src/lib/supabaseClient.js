import { createClient } from '@supabase/supabase-js';

// NOTE: In a real deployment replace these placeholders with actual Supabase project URL and anon key.
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
