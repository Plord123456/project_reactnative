import { Product } from '@/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Interface không thay đổi
interface FavoritesState {
  favoriteItems: Product[];
  addFavorite(product: Product): void;
  removeFavorite(productId: number): void;
  isFavorite(productId: number): boolean;
  resetFavorite(): void;
  toggleFavorite(product: Product): void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteItems: [],

      addFavorite: (product: Product) => {
        set(state => {
          if (state.favoriteItems.some(i => i.id === product.id)) return state;
          return { favoriteItems: [...state.favoriteItems, product] };
        });
      },

      removeFavorite: (productId: number) => {
        set(state => ({ favoriteItems: state.favoriteItems.filter(item => item.id !== productId) }));
      },

      isFavorite: (productId: number) => {
        return get().favoriteItems.some(item => item.id === productId);
      },

      resetFavorite: () => {
        set({ favoriteItems: [] });
      },

      toggleFavorite: (product: Product) => {
        const exists = get().favoriteItems.some(i => i.id === product.id);
        if (exists) {
          set(state => ({ favoriteItems: state.favoriteItems.filter(i => i.id !== product.id) }));
        } else {
          set(state => ({ favoriteItems: [...state.favoriteItems, product] }));
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
export default useFavoritesStore;



