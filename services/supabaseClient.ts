import { createClient } from '@supabase/supabase-js';

// Project details provided by user
const SUPABASE_URL = 'https://ufvanxiacrspfruqciyz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_F1WwQMlHQrlD9A68OdAYkA_AkL5cgTa';

// Initialize the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);