// store/auth.ts (Phiên bản hoàn thiện)

import { supabase } from "@/lib/superbase";
import { create } from "zustand";

export interface User {
    id: string;
    email: string;
    full_name?: string; 
    avatar_url?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>; // Trả về boolean cho dễ xử lý ở component
    signup: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    refreshUser: () => Promise<void>;
    setError: (error: string | null) => void; // Thêm hàm để xóa lỗi thủ công
}
const fetchUserProfile = async (userId: string): Promise<Partial<User>> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle();

    if (error && error.code !== 'PGRST116') { // PGRST116: result returned 0 rows when single
        console.error("Error fetching profile:", error.message);
        return {};
    }
    return data || {};
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isLoading: true, // Bắt đầu với isLoading = true để checkSession chạy lần đầu
    error: null,

    setError: (error: string | null) => set({ error }),

    login: async (email, password) => {
        try {
            set({ isLoading: true, error: null });
            const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;
            if (!user) throw new Error("An unexpected error occurred during login.");

            // 2. Lấy profile sau khi đăng nhập thành công
            const profile = await fetchUserProfile(user.id);

            set({
                user: {
                    id: user.id,
                    email: user.email || "",
                    ...profile // Gộp thông tin profile vào user
                },
                isLoading: false,
            });
            console.log("Đăng nhập thành công!");
            return true;

        } catch (error: any) {
            const errMsg = error?.message ?? "An unknown error occurred.";
            console.error("Lỗi đăng nhập:", errMsg);
            set({ error: errMsg, isLoading: false });
            return false;
        }
    },

    signup: async (email, password) => {
      // Giữ nguyên hàm signup của bạn vì nó đã tốt
       try {
            set({ isLoading: true, error: null });
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
            if (data) {
                set({ isLoading: false });
                // Nhớ rằng trigger sẽ tạo profile ở phía Supabase
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
        await supabase.auth.signOut();
        set({ user: null, isLoading: false, error: null });
    },

    checkSession: async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;

            if (session?.user) {
                // 3. Lấy profile khi kiểm tra session
                const profile = await fetchUserProfile(session.user.id);
                set({
                    user: {
                        id: session.user.id,
                        email: session.user.email || "",
                        ...profile
                    },
                    isLoading: false
                });
            } else {
                set({ user: null, isLoading: false });
            }
        } catch (error: any) {
             set({ user: null, isLoading: false, error: error.message });
        }
    },

    // 4. Hàm để refresh lại thông tin user từ DB
    refreshUser: async () => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
            const profile = await fetchUserProfile(currentUser.id);
            set(state => ({
                user: state.user ? { ...state.user, ...profile } : null
            }));
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    }
}));

// Gọi checkSession ngay khi store được khởi tạo
useAuthStore.getState().checkSession();