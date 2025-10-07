import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist,createJSONStorage } from 'zustand/middleware';
import { Product } from '@/type';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import { getCategories, getProducts } from '@/lib/api';

interface ProductState {
  products: Product[];
  categories: string[];
  loading: boolean;
  filteredProducts: Product[];
  error: string | null;
  //Product actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;   

}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      categories: [],
      loading: false,
      filteredProducts: [],
      error: null,
      fetchProducts: async () => {
        try {
          set({ loading: true, error: null });
          const products = await getProducts(); 
          set({ 
            products, 
            loading: false, 
            filteredProducts: products 
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      fetchCategories: async () => {
        try {
          set({ loading: true, error: null });
          const categories = await getCategories(); 
          set({ 
            categories, 
            loading: false, 
          });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
    }),
    {
      name: 'product-storage',
      storage: createJSONStorage(() => AsyncStorage),
    })
);
