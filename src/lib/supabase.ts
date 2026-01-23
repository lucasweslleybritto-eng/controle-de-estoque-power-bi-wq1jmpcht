import { createClient } from '@supabase/supabase-js'

// Attempt to resolve Supabase credentials from various environment variable patterns
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

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

// Helper to validate Key (avoid placeholders)
const isValidKey = (key: string | undefined): boolean => {
  if (!key) return false
  if (key === 'your-anon-key') return false
  if (key === 'placeholder') return false
  return true
}

const finalUrl = isValidUrl(supabaseUrl)
  ? supabaseUrl!
  : 'https://placeholder.supabase.co'
const finalKey = isValidKey(supabaseKey) ? supabaseKey! : 'placeholder'

if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseKey)) {
  console.warn(
    'Supabase Client Warning: Missing or invalid credentials. Please connect your Supabase project.',
  )
}

export const supabase = createClient(finalUrl, finalKey)
