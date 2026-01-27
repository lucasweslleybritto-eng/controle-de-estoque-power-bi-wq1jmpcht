import { createClient } from '@supabase/supabase-js'

// Attempt to resolve Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to validate URL structure
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Determine final credentials to use
// If invalid, fallback to placeholder to prevent crashes, but warn in console
const finalUrl = isValidUrl(supabaseUrl)
  ? supabaseUrl!
  : 'https://placeholder.supabase.co'
const finalKey = supabaseKey || 'placeholder-key'

if (!isValidUrl(supabaseUrl) || !supabaseKey) {
  console.warn(
    'Supabase Client Warning: Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Application will run in offline/demo mode.',
  )
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
