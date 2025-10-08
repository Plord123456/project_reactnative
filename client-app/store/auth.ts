// store/auth.ts (Phiên bản hoàn thiện)

import { supabase } from "@/lib/superbase";
import { create } from "zustand";

export interface User {
    id: string;
    email: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>; // Trả về boolean cho dễ xử lý ở component
    signup: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    setError: (error: string | null) => void; // Thêm hàm để xóa lỗi thủ công
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,
    
    setError: (error: string | null) => set({ error }),

    login: async (email, password) => {
        try {
            set({ isLoading: true, error: null });
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            if (data?.user) {
                set({
                    user: { id: data.user.id, email: data.user.email || "" },
                    isLoading: false,
                });
                console.log("Đăng nhập thành công!");
                return true; // Trả về true khi thành công
            }
            // Trường hợp không có lỗi nhưng cũng không có user
            throw new Error("An unexpected error occurred during login.");

        } catch (error: any) {
            const errMsg = error?.message ?? "An unknown error occurred.";
            console.error("Lỗi đăng nhập:", errMsg);
            set({ error: errMsg, isLoading: false });
            return false; // Trả về false khi thất bại
        }
    },

    signup: async (email, password) => {
        try {
            set({ isLoading: true, error: null });
            const { data, error } = await supabase.auth.signUp({ email, password });

            if (error) throw error;

            // Đăng ký thành công thường sẽ yêu cầu xác thực email
            // Không set user ở đây, mà chỉ thông báo thành công
            if (data) {
                 set({ isLoading: false });
                 return true;
            }
            throw new Error("An unexpected error occurred during sign up.");

        } catch (error: any) {
            const errMsg = error?.message ?? "An unknown error occurred.";
            console.error("Lỗi đăng ký:", errMsg);
            set({ error: errMsg, isLoading: false });
            return false;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Lỗi đăng xuất:", error.message);
        }
        set({ user: null, isLoading: false, error: null });
    },

    checkSession: async () => {
        try {
            set({ isLoading: true });
            const { data, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (data?.session?.user) {
                set({
                    user: { id: data.session.user.id, email: data.session.user.email || "" },
                    isLoading: false
                });
            } else {
                set({ user: null, isLoading: false });
            }
        } catch (error: any) {
             set({ user: null, isLoading: false, error: error.message });
        }
    },
}));