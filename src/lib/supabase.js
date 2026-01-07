import { createClient } from './supabase/client';

// Create and export a singleton Supabase client instance
export const supabase = createClient()