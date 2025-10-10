// store/addressStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/superbase';
import { useAuthStore } from './auth'; // Import auth store để lấy user_id

export interface Address {
  id: string;
  user_id: string;
  street?: string;
  city?: string;
  state?: string; // Tỉnh/Thành phố
  postal_code?: string;
  country?: string;
  is_default: boolean;
}

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (newAddress: Omit<Address, 'id' | 'user_id' | 'is_default'>) => Promise<boolean>;
  updateAddress: (addressId: string, updatedFields: Partial<Address>) => Promise<boolean>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ addresses: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error("Error fetching addresses:", error.message);
    }
  },

  addAddress: async (newAddress) => {
    const user = useAuthStore.getState().user;
    if (!user) return false;

    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...newAddress, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;

      if (data) {
        set(state => ({
          addresses: [data, ...state.addresses],
          isLoading: false,
        }));
        return true;
      }
      return false;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateAddress: async (addressId, updatedFields) => {
    // Tương tự, bạn có thể viết hàm update
    return true;
  },

  deleteAddress: async (addressId) => {
    // Và hàm delete
  },
  
  setDefaultAddress: async (addressId) => {
      // Logic để set 1 địa chỉ làm mặc định và unset các địa chỉ khác
  }
}));