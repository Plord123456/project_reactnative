// store/addressStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/superbase';
import { useAuthStore } from './auth';

export interface Address {
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface AddressState {
  address: Address | null;
  loading: boolean;
  fetchAddress: () => Promise<void>;
  updateAddress: (newAddress: Partial<Address>) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set) => ({
  address: null,
  loading: false,

  fetchAddress: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      set({ address: data, loading: false });
    } catch (error) {
      console.error('Error fetching address:', error);
      set({ address: null, loading: false });
    }
  },

  updateAddress: async (newAddress: Partial<Address>) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error('User not logged in');

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('addresses')
        .upsert({ user_id: user.id, ...newAddress })
        .select()
        .single();

      if (error) throw error;

      set({ address: data, loading: false });
    } catch (error) {
      console.error('Error updating address:', error);
      set({ loading: false });
      throw error;
    }
  },
}));