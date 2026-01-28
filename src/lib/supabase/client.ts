import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Use environment variables or fallbacks to prevent crashes during build/initialization
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
