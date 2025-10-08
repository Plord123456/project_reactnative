import Constants from 'expo-constants';

// Try to read env variables from several possible sources so the values are
// available both in dev (Expo) and in unit tests / node tools.
const extras: any = (Constants.expoConfig && (Constants.expoConfig as any).extra) || (Constants.manifest && (Constants.manifest as any).extra) || {};

// Fallback values (present in .env in this repo). Keep these only as last-resort
// defaults to avoid crashes during local dev when env vars aren't injected.
const FALLBACK_SUPABASE_URL = 'https://qumpqvqrzqdglzyrmmnl.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bXBxdnFyenFkZ2x6eXJtbW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NTc1MjMsImV4cCI6MjA3NTQzMzUyM30.a_Q8bEE7HbW_-V-zUy1Lbb9lg6InXFsGOETYoWHisHU';

const EXPO_PUBLIC_SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL || extras.EXPO_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extras.EXPO_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;
const API_URL = process.env.API_URL || extras.API_URL || 'https://fakestoreapi.com';

export { API_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY, EXPO_PUBLIC_SUPABASE_URL };