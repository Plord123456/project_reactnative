import { persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';
import { Product } from '@/type';
import AsycnStorange from '@react-native-async-storage/async-storage';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}


export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          if (existingItem) {
            return{
              items: state.items.map((item) =>
              item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
              )
            }
          }else{
            return{
              items: [...state.items, { product, quantity }]
            }
          }
        })
      },
      removeItem: (productId: number) => {
        set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) }));
      },
      updateQuantity: (productId: number, quantity: number) => {
        if(quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        }))
      },
      clearCart: () => set({ items: [] }),
      
getTotalPrice: () => {
  return get().items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
},
getItemCount: () => {
  return get().items.reduce((count, item) => count + item.quantity, 0);
},
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsycnStorange),
    }
  )
);
