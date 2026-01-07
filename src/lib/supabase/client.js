import { createBrowserClient } from '@supabase/ssr';

let supabaseClient = null

export function createClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  return supabaseClient
}
function supabase(...args) {
  // eslint-disable-next-line no-console
  console.warn('Placeholder: supabase is not implemented yet.', args);
  return null;
}

export { supabase };