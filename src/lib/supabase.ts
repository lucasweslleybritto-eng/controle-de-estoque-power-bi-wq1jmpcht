import { supabase } from '@/lib/supabase/client'

// Attempt to resolve Supabase credentials from environment variables for validation
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
  if (
    key === 'your-anon-key' ||
    key === 'placeholder-key' ||
    key === 'placeholder'
  )
    return false
  return true
}

// Export configuration status
export const isSupabaseConfigured =
  isValidUrl(supabaseUrl) && isValidKey(supabaseKey)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase Client Warning: Missing or invalid VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Application will run in offline/demo mode or show error.',
  )
}

// Re-export the singleton client to maintain backward compatibility and ensure single instance
export { supabase }
