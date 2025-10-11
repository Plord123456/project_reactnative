// store/addressStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/superbase';
import { useAuthStore } from './auth';

// 1. Định nghĩa lại Type cho đơn giản hơn
// Không cần 'id' và 'is_default' nữa vì user_id là khóa chính
export interface Address {
  user_id: string;
  phone: string;
  street: string;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  created_at?: string; // Tùy chọn
}

// Các trường dữ liệu cần để tạo hoặc cập nhật
type AddressUpsert = Omit<Address, 'user_id' | 'created_at'>;

// 2. Định nghĩa State mới, chỉ quản lý một địa chỉ (address)
interface AddressState {
  address: Address | null;
  loading: boolean;
  error: string | null;
  fetchAddress: () => Promise<void>;
  updateAddress: (addressData: AddressUpsert) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set) => ({
  address: null,
  loading: false,
  error: null,

  // 3. Hàm fetchAddress được đơn giản hóa
  fetchAddress: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ address: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .single(); // Dùng .single() để lấy MỘT bản ghi duy nhất

      // Lỗi 'PGRST116' của Supabase có nghĩa là không tìm thấy dòng nào.
      // Đây là trường hợp hợp lệ (người dùng chưa có địa chỉ), không phải là lỗi.
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      set({ address: data, loading: false });
    } catch (error: any) {
      console.error("Error fetching address:", error.message);
      set({ error: error.message, loading: false });
    }
  },

  // 4. Hàm update/add được gộp thành một hàm upsert duy nhất
  updateAddress: async (addressData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("User is not authenticated.");

    set({ loading: true });
    try {
      // Dùng .upsert() để tạo mới nếu chưa có hoặc cập nhật nếu đã tồn tại
      // Dựa trên khóa chính là `user_id`
      const { data, error } = await supabase
        .from('addresses')
        .upsert({ ...addressData, user_id: user.id })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Cập nhật lại state với dữ liệu mới nhất
      set({ address: data, loading: false });
    } catch (error: any) {
      console.error("Error updating address:", error.message);
      set({ error: error.message, loading: false });
      // Ném lỗi ra để component có thể bắt và hiển thị Alert
      throw error;
    }
  },
}));