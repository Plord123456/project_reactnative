import { create } from 'zustand';
import { Product } from '@/type';
import { getCategories, getProducts } from '@/lib/api';

// Định nghĩa kiểu cho việc sắp xếp
type SortByType = "price-asc" | "price-desc" | "rating" | null;

interface ProductsState {
    products: Product[];           // Master list: Chỉ fetch 1 lần và giữ nguyên
    filteredProducts: Product[];   // Danh sách sản phẩm hiển thị trên UI
    categories: string[];          // Danh sách các danh mục
    query: string;
    loading: boolean;
    selectedCategory: string | null;
    sortBy: SortByType;

    fetchInitialData: () => Promise<void>; // Gộp fetch products và categories
    setCategory: (category: string | null) => void;
    searchProducts: (query: string) => void;
    sortProducts: (sortBy: SortByType) => void;
    applyFilters: () => void; // Thêm hàm helper vào interface
}

export const useProductStore = create<ProductsState>(

    (set, get) => ({
    products: [],
    filteredProducts: [],
    categories: [],
    query: '',
    loading: false,
    selectedCategory: null,
    sortBy: null,

    // --- HELPER FUNCTION ---
    // Hàm nội bộ để áp dụng tất cả các bộ lọc và sắp xếp đang có
    applyFilters: () => {
        const { products, query, selectedCategory, sortBy } = get();
        let filtered = [...products];

        // 1. Lọc theo danh mục
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // 2. Lọc theo từ khóa tìm kiếm
        if (query) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query.toLowerCase())
            );
        }

        // 3. Sắp xếp
        if (sortBy === "price-asc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-desc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
            // Giả sử rating là một object { rate: number, count: number }
            filtered.sort((a, b) => b.rating.rate - a.rating.rate);
        }

        set({ filteredProducts: filtered });
    },

    // --- ACTIONS ---
    fetchInitialData: async () => {
        try {
            set({ loading: true });
            // Fetch đồng thời cả products và categories để tối ưu
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories()
            ]);
            
            set({
                products: productsData,
                filteredProducts: productsData, // Ban đầu hiển thị tất cả
                categories: categoriesData,
                loading: false,
            });
        } catch (error: any) {
            console.error("Failed to fetch initial data:", error);
            set({ loading: false });
        }
    },

    setCategory: (category: string | null) => {
        set({ selectedCategory: category, query: '' }); // Reset query khi đổi category
        get().applyFilters(); // Gọi hàm helper để áp dụng lại tất cả bộ lọc
    },

    searchProducts: (query: string) => {
        set({ query });
        get().applyFilters(); // Gọi hàm helper
    },

    sortProducts: (sortBy: SortByType) => {
        set({ sortBy });
        get().applyFilters(); // Gọi hàm helper
    },
}));