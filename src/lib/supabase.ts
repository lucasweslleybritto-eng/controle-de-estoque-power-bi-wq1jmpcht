import { createClient } from '@supabase/supabase-js'

// Attempt to resolve Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Helper to validate URL structure and keys
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  if (url.includes('your-anon-key') || url.includes('placeholder')) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

const isValidKey = (key: string | undefined): boolean => {
  if (!key) return false
  if (key === 'your-anon-key' || key === 'placeholder-key') return false
  return true
}

export const isSupabaseConfigured =
  isValidUrl(supabaseUrl) && isValidKey(supabaseKey)

// Determine final credentials to use
// If invalid, fallback to placeholder to prevent crashes during static analysis or initial load
// The App component will handle blocking the UI if isSupabaseConfigured is false
const finalUrl = isSupabaseConfigured
  ? supabaseUrl!
  : 'https://placeholder.supabase.co'
const finalKey = isSupabaseConfigured ? supabaseKey! : 'placeholder'

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase Client Warning: Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Application will run in offline/demo mode or show error.',
  )
}

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
