import { StyleSheet, View, Text, TextInput, TouchableOpacity, Platform, FlatList, ActivityIndicator, Image } from "react-native";
import React, { useEffect, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { AntDesign } from "@expo/vector-icons";
import AppColors from "@/constants/theme";
import { ScrollView } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useProductStore } from "@/store/productStrore"; // Đảm bảo đường dẫn đúng
import { Product } from "@/type"; // Import Product type

// Component con để render mỗi sản phẩm
const ProductItem = ({ item }: { item: Product }) => {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.productCard} onPress={() => router.push(`/product/${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.productImage} resizeMode="contain" />
            <Text style={styles.productTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        </TouchableOpacity>
    );
};


const ShopScreen = () => {
    const {
        filteredProducts,
        categories,
        selectedCategory,
        loading,
        error,
        fetchProducts,
        fetchCategories,
        setCategory,
        searchProducts, // Lấy thêm hàm search
    } = useProductStore();

    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();

    // 1. Lấy dữ liệu sản phẩm và danh mục khi component được mount
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const handleSearch = () => {
        searchProducts(searchQuery);
    };

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Text style={styles.title}>All Products</Text>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor={AppColors.gray[400]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch} // Tìm kiếm khi người dùng nhấn Enter
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <AntDesign name="search1" size={20} color={AppColors.primary[500]} />
                    </TouchableOpacity>
                </View>

                {/* 2. Render danh sách category động */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryContainer}
                >
                    <TouchableOpacity
                        style={[
                            styles.categoryButton,
                            selectedCategory === null && styles.activeButton
                        ]}
                        onPress={() => setCategory(null)}
                    >
                        <Text style={[styles.categoryText, selectedCategory === null && styles.activeText]}>All</Text>
                    </TouchableOpacity>
                    {categories.map(category => (
                        <TouchableOpacity
                            key={category}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category && styles.activeButton
                            ]}
                            onPress={() => setCategory(category)}
                        >
                            <Text style={[styles.categoryText, selectedCategory === category && styles.activeText]}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    if (error) {
        return (
            <Wrapper>
                <View style={styles.centeredContainer}>
                    <Text style={styles.errorText}>Failed to load products. Please try again.</Text>
                </View>
            </Wrapper>
        );
    }

    return (
        <Wrapper>
            {/* 3. Hiển thị danh sách sản phẩm */}
            <FlatList
                data={filteredProducts}
                renderItem={({ item }) => <ProductItem item={item} />}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                numColumns={2} // Hiển thị 2 cột
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={() => (
                    // Hiển thị loading hoặc thông báo không có sản phẩm
                    <View style={styles.centeredContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color={AppColors.primary[500]} />
                        ) : (
                            <Text>No products found.</Text>
                        )}
                    </View>
                )}
            />
        </Wrapper>
    );
};
export default ShopScreen;

const styles = StyleSheet.create({
    header: {
        paddingTop: Platform.OS === 'android' ? 16 : 0,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
        paddingBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: AppColors.text.primary,
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: AppColors.gray[50],
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 12,
        color: AppColors.text.primary,
    },
    searchButton: {
        padding: 8,
    },
    categoryContainer: {
        paddingVertical: 12,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: AppColors.gray[100],
        marginRight: 8,
        borderWidth: 1,
        borderColor: AppColors.gray[200],
    },
    categoryText: {
        fontSize: 14,
        color: AppColors.text.secondary,
        textTransform: 'capitalize',
    },
    activeButton: {
        backgroundColor: AppColors.primary[500],
        borderColor: AppColors.primary[500],
    },
    activeText: {
        color: "#fff",
        fontWeight: '600',
    },
    // Styles for product list
    listContainer: {
        paddingHorizontal: 10,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    errorText: {
        color: AppColors.error,
        fontSize: 16,
    },
    // Styles for ProductItem
    productCard: {
        flex: 1,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    productImage: {
        width: '100%',
        height: 120,
        marginBottom: 8,
    },
    productTitle: {
        fontSize: 14,
        color: AppColors.text.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: AppColors.primary[600],
    },
});