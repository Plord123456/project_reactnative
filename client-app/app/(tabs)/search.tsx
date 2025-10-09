import { StyleSheet,View,Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import Wrapper from "@/components/Wrapper";
import { useProductStore } from "@/store/productStrore";
import { AntDesign } from "@expo/vector-icons";
import AppColors from "@/constants/theme";
import CustomTextInput from "@/components/Textinput";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptySate";
import ProductCard from "@/components/ProductCard";

const SearchScreen = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const searchTimeoutRf = useRef<ReturnType<typeof setTimeout> | null>(null); // Sửa type cho an toàn hơn
    const {
        filteredProducts,
        loading,
        error,
        fetchProducts,
        searchProductsRealtime
    } = useProductStore();


    useEffect(() => {
        return () => {
            if (searchTimeoutRf.current) {
                clearTimeout(searchTimeoutRf.current);
            }
        };
    }, []);

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        if (searchTimeoutRf.current) {
            clearTimeout(searchTimeoutRf.current);
        }
        
        if (text.trim().length >= 3) {
            searchTimeoutRf.current = setTimeout(() => {
                searchProductsRealtime(text);
            }, 500);
        }
        else {
            // Xóa kết quả nếu người dùng xóa text
            searchProductsRealtime("");
        }
    };
    
    const handleClearSearch = () => {
        setSearchQuery("");
        searchProductsRealtime("");
    }

const renderHeader = () => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>Search Products</Text>
            
            {/* Gộp tất cả vào một container duy nhất */}
            <View style={styles.searchContainer}>
                {/* Icon Search giờ nằm bên trong */}
                <AntDesign
                    name="search"
                    size={20}
                    color={AppColors.gray[400]}
                    style={styles.searchIcon}
                />

                <CustomTextInput
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    placeholder="Search for products..."
                    style={styles.searchInput} // Dùng style này để reset
                />

                {/* Nút Clear (X) */}
                {searchQuery?.length > 0 && (
                    <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                        <AntDesign
                            name="close-circle"
                            size={18}
                            color={AppColors.gray[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

    return (
        <Wrapper>
            <View style={{flex: 1}}>
                {renderHeader()}

                {/* SỬA LỖI CÚ PHÁP: Viết lại toán tử ba ngôi cho đúng */}
                {loading ? (
                    <LoadingSpinner />
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : filteredProducts?.length === 0 && searchQuery.length >= 3 ? (
                    <EmptyState
                        type="search"
                        message="No products found matching your search" />
                ) : (
                    <FlatList
                        data={searchQuery.length >= 3 ? filteredProducts : []}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <View style={{flex: 1, margin: 4}}>
                                <ProductCard product={item} customStyle={{ width: "100%" }} />
                            </View>

                        )}
                        contentContainerStyle={styles.productsGrid}
                        // SỬA LỖI CÚ PHÁP: Di chuyển ListEmptyComponent ra làm prop chính
                        ListEmptyComponent={
                            !searchQuery || searchQuery.length < 3 ? (
                                <View style={styles.emptyStateContainer}>
                                    <Text style={styles.emptyStateText}>
                                        Type at least 3 characters to search products
                                    </Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </Wrapper>
    );
};
export default SearchScreen;
const styles = StyleSheet.create({
    header: {
        padding: 16,
        paddingBottom: 12,
        backgroundColor: AppColors.background.secondary, // Màu nền nhẹ nhàng
        borderBottomWidth: 1,
        borderBottomColor: AppColors.gray[100],
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: AppColors.text.primary,
        marginBottom: 16,
    },
    // Container chính cho thanh search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.background.primary, // Màu trắng
        borderRadius: 12,
        height: 50,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: AppColors.gray[200],
    },
    // Style cho icon search bên trái
    searchIcon: {
        marginRight: 8,
    },
    // Style để reset CustomTextInput, giúp nó nằm gọn trong container
    searchInput: {
        flex: 1,
        height: '100%',
        // Reset các style không cần thiết từ component
        margin: 0,
        padding: 0,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    // Nút xóa nằm ở cuối
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        fontSize: 16,
    },
    productsGrid: {
        paddingHorizontal: 10,
        paddingTop: 16,
    },
    emptyStateContainer: {
        flex: 1,
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyStateText: {
        fontSize: 16,
        color: AppColors.text.secondary ?? 'gray'
    }, 
});