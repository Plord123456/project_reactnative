import {
  EXPO_PUBLIC_SUPERBASE_URL,
EXPO_PUBLIC_SUPERBASE_ANON_KEY,
} from "@/config";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";


const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Initialize the Supabase client
const supabaseUrl = EXPO_PUBLIC_SUPERBASE_URL || "";
const supabaseAnonKey = EXPO_PUBLIC_SUPERBASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});