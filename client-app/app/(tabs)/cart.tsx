import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter, Link } from "expo-router";
import { useCartStore } from "@/store/CartStore";
import { useAuthStore } from "@/store/auth";
import MainLayout from "@/components/Main.layout";
import EmptyState from "@/components/EmptySate";
import AppColors from "@/constants/theme";
import { Title } from "@/components/Titile";
import { Product } from "@/type";
import CartItem from "@/components/CartItem";
import Toast from "react-native-toast-message";
import { supabase } from "@/lib/superbase";
import axios from "axios";
import { BACKEND_URL } from "@/config";

const CartScreen = () => {
    const router = useRouter();
    const { items, getTotalPrice, clearCart } = useCartStore();
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState<any>(null);

    const subtotal = getTotalPrice();
    const shippingCost = subtotal > 500 ? 0 : 5.99;
    const total = subtotal + shippingCost;

    useEffect(() => {
        if (user) {
            fetchAddress(user.id);
        }
    }, [user]);

    const fetchAddress = async (id: string) => {
        // Replace this with your actual address fetching logic
        // Example: fetch from supabase or your backend
        try {
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', id)
                .single();
            if (error) {
                setAddress(null);
            } else {
                setAddress(data);
            }
        } catch (err) {
            setAddress(null);
        }
    };

    const handlePress = (product: Product) => {
        router.push(`/product/${product.id}`);
    };
const handlePlaceOrder = async () => {
    if (!user) {
        Toast.show({
            type: "error",
            text1: "Login Required",
            text2: "Please login to place an order.",
            position: "bottom",
            visibilityTime: 3000,
        });
        return; // Dừng hàm tại đây
    }

    const requiredAddressFields: Array<keyof typeof address> = ['phone', 'street', 'city', 'state', 'postal_code', 'country'];
    const missingFields = !address
        ? requiredAddressFields
        : requiredAddressFields.filter((field) => !address?.[field]);

    if (!address || missingFields.length > 0) {
        const message = !address
            ? 'Please add a shipping address before proceeding to checkout.'
            : 'Please complete your shipping details (phone, address, city, state, postal code, country) before placing an order.';

        Alert.alert(
            'No Shipping Address',
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Add Address', onPress: () => router.push('/(tabs)/shipping-detail') }
            ]
        );
        return;
    }

    // Khai báo biến ở đây để có thể truy cập ở cuối hàm
    let paymentIntent, ephemeralKey, customer, orderId;
    const backendUrl = BACKEND_URL?.replace(/\/$/, "");

    try {
        setLoading(true);
        const orderData = {
            user_email: user.email,
            total_price: total,
            items: items.map(item => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
                image: item.product.image,
                title: item.product.title,
            })),
            payment_status: "pending",
            shipping_address: {
                phone: address.phone,
                street: address.street,
                city: address.city,
                state: address.state,
                postal_code: address.postal_code,
                country: address.country,
            },
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Gán orderId từ data trả về
        orderId = data?.id;

        const payload = {
            price: total,
            email: user?.email,
            order_id: orderId,
        };
        
        if (!backendUrl) {
            throw new Error("Backend URL is not configured. Set EXPO_PUBLIC_BACKEND_URL.");
        }

        const response = await axios.post(`${backendUrl}/checkout`, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000,
        });

        // Gán giá trị cho các biến đã khai báo ở trên
        paymentIntent = response.data.paymentIntent;
        ephemeralKey = response.data.ephemeralKey;
        customer = response.data.customer;

        if (!paymentIntent || !ephemeralKey || !customer) {
            throw new Error("Missing payment data received from server.");
        }
        
        Toast.show({
            type: "success",
            text1: "Order created",
            text2: "Proceeding to payment...",
            position: "bottom",
            visibilityTime: 3000,
        });

        // Nếu mọi thứ ổn, điều hướng sang trang thanh toán
        router.push({
            pathname: '/(tabs)/payment', // Sửa lại đường dẫn nếu cần
            params: {
                paymentIntent,
                ephemeralKey,
                customer,
                orderId: orderId, // Truyền orderId để cập nhật sau
                total: total, // Truyền tổng tiền để hiển thị trên trang thanh toán
            },
        });
        clearCart(); // Xóa giỏ hàng sau khi đặt hàng thành công

    } catch (err: any) {
        console.error("Order placement error:", err);
        const isNetworkError = axios.isAxiosError(err) && !err.response;
        
        Toast.show({
            type: "error",
            text1: isNetworkError ? "Network Error" : "Order Failed",
            text2: isNetworkError
                ? `Cannot reach backend at ${BACKEND_URL}. Ensure the server is running and accessible.`
                : (err?.message ?? "Something went wrong. Please try again."),
            position: "bottom",
            visibilityTime: 5000,
        });
    } finally {
        setLoading(false);
    }
};

    // return JSX phải nằm ở đây
    return (
        <MainLayout>
            {items?.length > 0 ? (
                <>
                    {/* --- Header --- */}
                    <View style={styles.header}>
                        <View>
                            <Title>Shopping Cart</Title>
                            <Text style={styles.itemCount}>{items?.length} items</Text>
                        </View>
                        <TouchableOpacity onPress={clearCart}>
                            <Text style={styles.clearButtonText}>Clear Cart</Text>
                        </TouchableOpacity>
                    </View>

                    {/* --- Danh sách sản phẩm --- */}
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.product.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => handlePress(item.product)}>
                                <CartItem {...item} />
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.cartItemContainer}
                    />

                    {/* --- Phần tóm tắt --- */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryText}>Subtotal</Text>
                            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                        </View>

                        {shippingCost > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Shipping</Text>
                                <Text style={styles.summaryValue}>${shippingCost.toFixed(2)}</Text>
                            </View>
                        )}
                        
                        <View style={styles.divider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>

                        {/* Nút Place Order */}
                        <TouchableOpacity
                            style={[styles.placeOrderButton, (!user || loading) && styles.disabledButton]}
                            disabled={!user || loading}
                            onPress={handlePlaceOrder}
                        >
                            <Text style={styles.placeOrderButtonText}>{loading ? "Placing Order..." : "Place Order"}</Text>
                        </TouchableOpacity>
                            
                        {!user && (
                            <View style={styles.alertView}>
                                <Text style={styles.alertText}>Please log in to place your order: </Text>
                                <Link href="/login" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.linkText}>Log in</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        )}
                    </View>
                </>
            ) : (
                <EmptyState
                    type="cart"
                    message="Your cart is empty"
                    actionLabel="Go to Shop"
                    onAction={() => router.push('/(tabs)/shop')}
                />
            )}
        </MainLayout>
    );
};

export default CartScreen;

// CSS Styles không thay đổi
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 5,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.gray[100],
    },
    clearButtonText: {
        color: AppColors.error,
        fontSize: 14,
        fontWeight: '500',
    },
    itemCount: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: AppColors.text.secondary,
        marginTop: 4,
    },
    cartItemContainer: {
        paddingHorizontal: 16,
    },
    summaryContainer: {
        paddingVertical: 20,
        paddingHorizontal: 16,
        borderTopWidth: 1,
        borderTopColor: AppColors.gray[200],
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    summaryText: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    summaryLabel: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    summaryValue: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: AppColors.text.primary,
    },
    divider: {
        height: 1,
        backgroundColor: AppColors.gray[200],
        marginVertical: 6,
    },
    totalLabel: {
        fontFamily: "Inter-SemiBold",
        fontSize: 16,
        color: AppColors.text.primary,
    },
    totalValue: {
        fontFamily: "Inter-Bold",
        fontSize: 18,
        color: AppColors.primary[600],
    },
    placeOrderButton: {
        backgroundColor: AppColors.primary[500],
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    placeOrderButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: AppColors.gray[300],
    },
    alertView: {
        marginTop: 8,
        padding: 10,
// fetchAddress is now defined inside the component and uses setAddress state.
        flexDirection: 'row',
        justifyContent: 'center',
    },
    alertText: {
        fontFamily: "Inter-Regular",
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    linkText: {
        fontFamily: "Inter-Medium",
        fontSize: 14,
        color: AppColors.primary[600],
        textDecorationLine: "underline",
        marginLeft: 4,
    },
});

function fetchAddress(id: string) {
    throw new Error("Function not implemented.");
}
