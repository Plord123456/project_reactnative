import Constants from "expo-constants";

const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const EXPO_PUBLIC_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";
const API_URL = process.env.API_URL || "https://fakestoreapi.com";
const EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

const resolveDefaultBackendUrl = () => {
  const hostUri =
    Constants.expoGoConfig?.debuggerHost || Constants.expoConfig?.hostUri || "";

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:8000`;
  }

  return "http://127.0.0.1:8000";
};

const BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || "").trim() || resolveDefaultBackendUrl();
export const BASE_URL = "http://localhost:8000";
export {
  API_URL,
  BACKEND_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
};