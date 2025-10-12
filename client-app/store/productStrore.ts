import { create } from 'zustand';
import { Product } from '@/type';
import { getCategories, getProducts, getProductsByCategory } from '@/lib/api';

// Định nghĩa kiểu cho việc sắp xếp
type SortByType = "price-asc" | "price-desc" | "rating" | null;

interface ProductsState {
    products: Product[];
    filteredProducts: Product[];
    categories: string[];
    query: string;
    loading: boolean;
    error: string | null; // Thêm state `error`
    selectedCategory: string | null;
    sortBy: SortByType;
    isInitialized: boolean; // Add initialization tracking

    // Các hàm được đặt lại tên theo yêu cầu
    fetchProducts: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    setCategory: (category: string | null) => void;
    searchProducts: (query: string) => void;
    sortProducts: (sortBy: SortByType) => void;
    applyFilters: () => void; // Thêm hàm applyFilters vào interface
    searchProductsRealtime: (query: string) => Promise<void>;
}

export const useProductStore = create<ProductsState>((set, get) => ({
    products: [],
    filteredProducts: [],
    categories: [],
    query: '',
    loading: false,
    error: null, // Giá trị ban đầu cho error
    selectedCategory: null,
    sortBy: null,
    isInitialized: false, // Default to false

    // --- HELPER FUNCTION (Giữ nguyên logic tối ưu) ---
    applyFilters: () => {
        const { products, query, selectedCategory, sortBy } = get();
        let filtered = [...products];

        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }
        if (query) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query.toLowerCase())
            );
        }
        if (sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            filtered.sort((a, b) => b.rating.rate - a.rating.rate);
        }

        set({ filteredProducts: filtered });
    },

    // --- ACTIONS (Đã được đổi tên và tách ra) ---
    fetchProducts: async () => {
        try {
            set({ loading: true, error: null }); // Reset lỗi trước khi fetch
            const productsData = await getProducts();
            set({
                products: productsData,
                filteredProducts: productsData,
            });
        } catch (error: any) {
            console.error("Failed to fetch products:", error);
            set({ error: error.message });
        } finally {
            set({ loading: false, isInitialized: true }); // Mark as initialized
        }
    },

    fetchCategories: async () => {
        try {
            set({ loading: true, error: null });
            const categoriesData = await getCategories();
            set({
                categories: categoriesData,
                loading: false,
            });
        } catch (error: any) {
            console.error("Failed to fetch categories:", error);
            set({ loading: false, error: error.message });
        }
    },

    setCategory: async (category: string | null) => {
  try {
    set({ selectedCategory: category, loading: true, error: null });

    if (category) {
      set({ loading: true, error: null });
      const products = await getProductsByCategory(category);
      set({ filteredProducts: products, loading: false });
    } else {
      set({ filteredProducts: get().products, loading: false });
    }
  } catch (error: any) {
    set({ error: error.message, loading: false });
  }
},

    searchProducts: (query: string) => {
        set({ query });
        get().applyFilters();
    },

    sortProducts: (sortBy: SortByType) => {
        set({ sortBy });
        get().applyFilters();
    },

 searchProductsRealtime: async (query: string) => {
    set({ loading: true, error: null });

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
        // Nếu query ngắn hơn 2 ký tự, xóa kết quả cũ và dừng lại
        set({ filteredProducts: [], loading: false });
        return;
    }

    try {
        // 2. Gọi API để tìm kiếm sản phẩm
        // Dòng dưới đây vẫn là mô phỏng. Khi có backend thật,
        // bạn sẽ thay thế bằng một hàm gọi API search thực sự, ví dụ:
        // const searchResults = await searchProductsApi(trimmedQuery);

        const allProducts = await getProducts();
        const searchResults = allProducts.filter(p =>
            p.title.toLowerCase().includes(trimmedQuery.toLowerCase())
        );

        // 3. Cập nhật state với kết quả tìm được
        set({ filteredProducts: searchResults, loading: false });

    } catch (error: any) {
        // 4. Xử lý lỗi nếu có
        console.error("Failed to search products:", error);
        set({ error: error.message, loading: false });
    }
},
}));