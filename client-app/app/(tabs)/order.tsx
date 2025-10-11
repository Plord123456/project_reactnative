import { Alert, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/superbase';
import Wrapper from '@/components/Wrapper';
import { Title } from '@/components/Titile';
import EmptyState from '@/components/EmptySate';
import OrderItem from '@/components/orderItem';
import Toast from 'react-native-toast-message';
import Loader from '@/components/loader';
import AppColors from '@/constants/theme';
import axios from 'axios';
import { BACKEND_URL } from '@/config';

// Định nghĩa kiểu dữ liệu Order (có thể chuyển vào file type.ts)
export interface Order {
  id: number;
  total_price: number;
  payment_status: string;
  created_at: string;
  items: {
    product_id: number;
    price: number;
    title: string;
    quantity: number;
    image: string;
  }[];
    shipping_address?: {
        phone?: string;
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    } | null;
}

const OrdersScreen = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingOrderId, setPayingOrderId] = useState<number | null>(null);

    const fetchOrders = async () => {
        if (!user) {
            setOrders([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('id, total_price, payment_status, created_at, items, shipping_address')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error fetching orders', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchOrders();
    }, [user]));
    
    // Điều hướng sang trang chi tiết
    const handleViewDetail = (orderId: number) => {
        router.push({
            pathname: '/(tabs)/orderDetail',
            params: { orderId: orderId.toString() },
        });
    };

    const handlePayNow = async (order: Order) => {
        if (payingOrderId) {
            return;
        }

        const backendUrl = BACKEND_URL?.replace(/\/$/, '');
        if (!backendUrl) {
            Toast.show({ type: 'error', text1: 'Payment Error', text2: 'Backend URL is not configured.' });
            return;
        }

        setPayingOrderId(order.id);
        try {
            const payload = {
                price: order.total_price,
                email: user?.email,
                order_id: order.id,
            };

            const response = await axios.post(`${backendUrl}/checkout`, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000,
            });

            const { paymentIntent, ephemeralKey, customer } = response.data;
            if (!paymentIntent || !ephemeralKey || !customer) {
                throw new Error('Failed to create payment session.');
            }

            router.push({
                pathname: '/(tabs)/payment',
                params: {
                    paymentIntent,
                    ephemeralKey,
                    customer,
                    orderId: order.id.toString(),
                    total: order.total_price.toString(),
                },
            });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Payment Error', text2: error.message });
        } finally {
            setPayingOrderId(null);
        }
    };

    const handleDeleteOrder = (orderId: number) => {
        Alert.alert(
            'Delete Order',
            'Are you sure you want to remove this order? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const { error } = await supabase
                                .from('orders')
                                .delete()
                                .eq('id', orderId)
                                .eq('user_email', user?.email ?? '');

                            if (error) {
                                throw error;
                            }

                            setOrders((prev) => prev.filter((order) => order.id !== orderId));
                            Toast.show({
                                type: 'success',
                                text1: 'Order deleted',
                                text2: `Order #${orderId} has been removed.`,
                            });
                        } catch (error: any) {
                            Toast.show({
                                type: 'error',
                                text1: 'Delete failed',
                                text2: error.message ?? 'Unable to delete order.',
                            });
                        }
                    },
                },
            ]
        );
    };

    if (loading) return <Loader />;

    if (!user) return (
        <EmptyState
            type="profile"
            message="Please log in to see your orders"
            actionLabel="Log In"
            onAction={() => router.push("/login")}
        />
    );

    return (
        <Wrapper>
            <View style={styles.container}>
                <Title >My Orders</Title>
                {orders.length > 0 ? (
                    <FlatList
                        data={orders}
                        keyExtractor={(item) => item.id.toString()}
                        onRefresh={fetchOrders}
                        refreshing={loading}
                        renderItem={({ item }) => (
                            <OrderItem
                                order={item}
                                onPayNow={() => handlePayNow(item)}
                                onViewDetail={() => handleViewDetail(item.id)}
                                isPaying={payingOrderId === item.id}
                                onDelete={handleDeleteOrder}
                            />
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <EmptyState
                        type="orders"
                        message="You have no orders yet"
                        actionLabel="Start Shopping"
                        onAction={() => router.push("/(tabs)/shop")}
                    />
                )}
            </View>
        </Wrapper>
    );
};

export default OrdersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: AppColors.background.primary,
    },
    pageTitle: {
        marginTop: 16,
        marginBottom: 20,
    },
});