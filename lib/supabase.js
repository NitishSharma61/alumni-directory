import { createBrowserClient } from '@supabase/ssr'

// These environment variables are automatically loaded from .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a single supabase client for interacting with your database
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)