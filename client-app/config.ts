// Simple config wrapper that re-exports environment variables expected by the app.
// Expo injects env variables prefixed with EXPO_PUBLIC_ at build time.
export const EXPO_PUBLIC_SUPERBASE_URL = process.env.EXPO_PUBLIC_SUPERBASE_URL ?? '';
export const EXPO_PUBLIC_SUPERBASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPERBASE_ANON_KEY ?? '';

export default {
  EXPO_PUBLIC_SUPERBASE_URL,
  EXPO_PUBLIC_SUPERBASE_ANON_KEY,
};
