import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, Modal, TouchableWithoutFeedback ,Pressable} from "react-native";
import React, { useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { AntDesign } from "@expo/vector-icons";
import AppColors from "@/constants/theme";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useProductStore } from "@/store/productStrore";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptySate";
import ProductCard from "@/components/ProductCard";
import CustomTextInput from "@/components/Textinput";
import { useLocalSearchParams } from "expo-router";
const ShopScreen = () => {
  const router = useRouter();
  const {
    filteredProducts,
    categories,
    selectedCategory,
    loading,
    error,
    products,
    fetchProducts,
    fetchCategories,
    setCategory,
    sortProducts,
  } = useProductStore();
const { categoryParam } = useLocalSearchParams<{ categoryParam?: string }>();
  const [showSortModal, setShowSortModal] = useState(false);
  const [activeSortOption, setActiveSortOption] = useState<string | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    if (categoryParam) {
        setCategory(categoryParam);
    }
  }, []);



  const handleSort = (sortBy: "price-asc" | "price-desc" | "rating") => {
    sortProducts(sortBy);
    setActiveSortOption(sortBy);
    setShowSortModal(false);
    setIsFilterActive(true);
  };

  const handleResetFilters = () => {
    fetchProducts(); // Refetch or reset to the original unsorted list
    setActiveSortOption(null);
    setIsFilterActive(false);
    setShowSortModal(false);
  };

  if (error) {
    return (
      <Wrapper>
        <View style={styles.errorContainer}>
          <Text>Error: {error}</Text>
        </View>
      </Wrapper>
    );
  }
  
  return (
    <Wrapper>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>All Products</Text>
        
        {/* Search and Filter Container */}
        <View style={styles.searchFilterContainer}>
          
         <TouchableOpacity 
  style={styles.searchContainer} 
  activeOpacity={0.8}
  onPress={() => router.push('/(tabs)/search')}
>
  <AntDesign name="search" size={20} color={AppColors.gray[400]} />
  {/* Dùng Text để hiển thị placeholder thay vì TextInput */}
  <Text style={styles.searchInput}>Search products...</Text>
</TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={[styles.filterButton, isFilterActive && styles.activeButton]}
          >
            <AntDesign
              name="filter"
              size={20}
              color={isFilterActive ? AppColors.primary[500] : AppColors.text.primary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Categories Scroller */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          <TouchableOpacity
            onPress={() => setCategory(null)}
            style={[
              styles.categoryButton,
              selectedCategory === null && styles.selectedCategory,
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && styles.selectedCategoryText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              onPress={() => setCategory(category)}
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategory,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Content: Loading, Empty State, or Products Grid */}
      {loading ? (
        <View style={styles.centered}>
          <LoadingSpinner fullScreen />
        </View>
      ) : filteredProducts?.length === 0 ? (
        <EmptyState type="search" message="No products found" />
      ) : (
        <FlatList
          data={filteredProducts || products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={styles.productCardContainer}>
              <ProductCard product={item} customStyle={{ width: "100%" }} />
            </View>
          )}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Sort Options Modal */}
      <Modal
        visible={showSortModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowSortModal(false)}>
           <Pressable
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
            }}
            onPress={() => setShowSortModal(false)}
        />
             <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Sort By</Text>
                    <TouchableOpacity onPress={() => setShowSortModal(false)}>
                        <AntDesign name="close" size={24} color={AppColors.text.primary} />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity
                    style={[styles.sortOption, activeSortOption === "price-asc" && styles.activeButton]}
                    onPress={() => handleSort("price-asc")}
                >
                    <Text style={[styles.sortOptionText, activeSortOption === "price-asc" && styles.activeText]}>Price: Low to High</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sortOption, activeSortOption === "price-desc" && styles.activeButton]}
                    onPress={() => handleSort("price-desc")}
                >
                    <Text style={[styles.sortOptionText, activeSortOption === "price-desc" && styles.activeText]}>Price: High to Low</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sortOption, activeSortOption === "rating" && styles.activeButton]}
                    onPress={() => handleSort("rating")}
                >
                    <Text style={[styles.sortOptionText, activeSortOption === "rating" && styles.activeText]}>Highest Rated</Text>
                </TouchableOpacity>
                
                {isFilterActive && (
                    <TouchableOpacity style={[styles.sortOption, styles.resetButton]} onPress={handleResetFilters}>
                        <Text style={styles.resetButtonText}>Reset Filters</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
      </Modal>
    </Wrapper>
  );
};

export default ShopScreen;

// Complete and refined StyleSheet
const styles = StyleSheet.create({
  // --- Layout & Containers ---
  header: {
    paddingTop: Platform.OS === "android" ? 16 : 0,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray[100],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  productsGrid: {
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  productCardContainer: {
    flex: 1,
    padding: 6,
  },

  // --- Header Elements ---
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.text.primary,
    marginBottom: 16,
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.gray[50],
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: AppColors.text.primary,
    marginLeft: 8,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.gray[50],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // --- Categories ---
  categoryContainer: {
    paddingVertical: 4,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: AppColors.gray[100],
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    color: AppColors.text.secondary,
    fontWeight: "500",
  },
  selectedCategory: {
    backgroundColor: AppColors.primary[100],
    borderColor: AppColors.primary[500],
  },
  selectedCategoryText: {
    color: AppColors.primary[600],
    fontWeight: 'bold',
  },
  
  // --- Active State ---
  activeButton: {
    backgroundColor: AppColors.primary[100],
    borderColor: AppColors.primary[500],
  },
  activeText: {
      color: AppColors.primary[600],
      fontWeight: 'bold',
  },

  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 30, // Extra space for home indicator
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    width: "100%",
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.gray[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.text.primary,
  },
  sortOption: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: AppColors.gray[50],
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortOptionText: {
    fontSize: 16,
    color: AppColors.text.primary,
    fontWeight: "500",
  },
  resetButton: {
    backgroundColor: AppColors.error[50],
    borderColor: AppColors.error,
  },
  resetButtonText: {
    fontSize: 16,
    color: AppColors.error,
    fontWeight: "bold",
  },
});