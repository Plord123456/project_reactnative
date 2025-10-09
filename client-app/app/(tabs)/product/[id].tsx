import { StyleSheet, Text, View, Image, Dimensions, TouchableOpacity, ScrollView } from "react-native"; // Import ScrollView từ react-native
import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import CommonHeader from "@/components/CommonHeader";
import { Product } from "@/type";
import { getProduct } from "@/lib/api";
import AppColors from "@/constants/theme";
import LoadingSpinner from "@/components/LoadingSpinner";
import Wrapper from "@/components/Wrapper";
import Rating from "@/components/Rating";
import { AntDesign } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useCartStore } from "@/store/CartStore";
import { useFavoritesStore } from "@/store/favortieStore";
import  { useCallback } from "react"; // Thêm useCallback
import { useFocusEffect } from "expo-router"; // Thêm useFocusEffect
import { useNavigation } from "@react-navigation/native"; // Thêm useNavigation // Sửa lỗi import

const { width } = Dimensions.get("window");

const SingleProductScreen = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const idNum = Number(id);

    const { addItem } = useCartStore();
    const { isFavorite, toggleFavorite } = useFavoritesStore();
    const navigation = useNavigation(); // <-- Add this line
    
useFocusEffect(
  useCallback(() => {
    // Try hiding tab bar on both parent and grandparent (covers common nesting layouts)
    const parent = navigation.getParent?.();
    const grandParent = parent?.getParent?.();

    // Apply hide to both if available
    parent?.setOptions?.({ tabBarStyle: { display: "none" } });
    grandParent?.setOptions?.({ tabBarStyle: { display: "none" } });

    // Cleanup: restore by removing tabBarStyle override (let navigator fall back to default)
    return () => {
      parent?.setOptions?.({ tabBarStyle: undefined });
      grandParent?.setOptions?.({ tabBarStyle: undefined });
    };
  }, [navigation])
);


    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const data = await getProduct(idNum);
                setProduct(data);
            } catch (error) {
                setError("Failed to fetch product data");
                console.log("Error: ", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchProductData();
        }
    }, [id]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (error || !product) {
        return (
            <Wrapper>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || "Product not found"}</Text>
                    <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
                        <Text style={styles.primaryButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </Wrapper>
        );
    }

    const isFav = isFavorite(product.id);

    const handleAddToCart = () => {
        addItem(product, quantity);
        Toast.show({
            type: "success",
            text1: "Product added to cart",
            text2: `${product?.title} has been added to your cart`,
            visibilityTime: 2000,
        });
    };

    const handleToggleFavorite = () => {
        if (product) {
            toggleFavorite(product);
        }
    };

    return (
        <Wrapper>
            <CommonHeader isFav={isFav} handleToggleFavorite={handleToggleFavorite} />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.productInfo}>
                    <Text style={styles.category}>{product.category}</Text>
                    <Text style={styles.title}>{product.title}</Text>
                    
                    <View style={styles.ratingContainer}>
                         <Rating
                            rating={product.rating.rate}
                            count={product.rating.count}
                            size={20}
                        />
                    </View>
                   
                    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
                    
                    <View style={styles.divider} />
                    
                    <Text style={styles.descriptionTitle}>Description</Text>
                    <Text style={styles.description}>{product.description}</Text>
                    
                    <View style={styles.quantityContainer}>
                        <Text style={styles.quantityTitle}>Quantity</Text>
                        <View style={styles.quantityControls}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => { if (quantity > 1) setQuantity(prev => prev - 1) }}
                                disabled={quantity <= 1}
                            >
                                <AntDesign name="minus" size={20} color={AppColors.primary[600]} />
                            </TouchableOpacity>
                            <Text style={styles.quantityValue}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity((prev) => prev + 1)}
                            >
                                <AntDesign name="plus" size={20} color={AppColors.primary[600]} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            
          <View style={styles.footer}>
    {/* Nhóm giá lại */}
    <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>Total Price</Text>
        <Text style={styles.totalPrice}>
            ${(product.price * quantity).toFixed(2)}
        </Text>
    </View>
    
    <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
    </TouchableOpacity>
</View>
        </Wrapper>
    );
};

export default SingleProductScreen;

const styles = StyleSheet.create({
    // --- Layout Containers ---
    imageContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        backgroundColor: AppColors.background.secondary, // Cho ảnh có nền
    },
    productImage: {
        width: width * 0.7, // Chiếm 70% chiều rộng màn hình
        height: width * 0.7,
    },
    productInfo: {
        padding: 24,
        paddingBottom: 120, // Chừa không gian cho footer
        gap: 16, // Tạo khoảng cách đều giữa các phần tử
    },
    // footer style (first definition) removed due to duplication

    // --- Text Styles ---
    category: {
        fontSize: 14,
        color: AppColors.text.secondary,
        textTransform: "capitalize",
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: AppColors.text.primary,
    },
    price: {
        fontSize: 24,
        fontWeight: 'bold',
        color: AppColors.primary[600],
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
    description: {
        fontSize: 16,
        color: AppColors.text.secondary,
        lineHeight: 24,
    },

    // --- Components ---
    ratingContainer: {
        alignSelf: 'flex-start', // Đảm bảo rating không chiếm cả hàng
    },
    divider: {
        height: 1,
        backgroundColor: AppColors.gray[200],
    },

    // --- Quantity Controls ---
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    quantityTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: AppColors.gray[100],
        alignItems: "center",
        justifyContent: "center",
    },
    quantityValue: {
        fontSize: 16,
        fontWeight: '500',
        color: AppColors.text.primary,
    },
    
    // --- Buttons ---
    primaryButton: {
        backgroundColor: AppColors.primary[500],
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },

    // --- Error State ---
    errorContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
    },
    errorText: {
        fontSize: 16,
        color: AppColors.error,
        textAlign: "center",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: AppColors.background.primary,
        borderTopWidth: 1,
        borderTopColor: AppColors.gray[200],
        paddingHorizontal: 24,
        paddingVertical: 12, // Giảm padding dọc
        paddingBottom: 20, // Giữ lại một chút cho home indicator
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    priceContainer: {
        flex: 1, // Chiếm không gian còn lại
    },
    priceLabel: {
        fontSize: 14,
        color: AppColors.text.secondary,
        marginBottom: 2,
    },
    addToCartButton: {
        backgroundColor: AppColors.primary[500],
        paddingVertical: 12, // Giảm padding dọc của nút
        paddingHorizontal: 32, // Giảm padding ngang của nút
        borderRadius: 10, // Bo góc nhỏ hơn
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToCartButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    totalPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppColors.primary[600],
    },
});