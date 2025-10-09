import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/superbase';
import Wrapper from '@/components/Wrapper';
import { Title } from '@/components/Titile';
import EmptyState from '@/components/EmptySate';
import OrderItem from '@/components/orderItem';
import Toast from 'react-native-toast-message';
import Loader from '@/components/loader';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import AppColors from '@/constants/theme';
import { Feather } from '@expo/vector-icons';

// Định nghĩa kiểu dữ liệu Order
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
}

// Component Modal chi tiết đơn hàng
const OrderDetailsModal = ({ visible, order, onClose }: { visible: boolean; order: Order | null; onClose: () => void }) => {
    const translateY = useSharedValue(500);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 18 });
            opacity.value = withTiming(1);
        } else {
            translateY.value = withTiming(500);
            opacity.value = withTiming(0);
        }
    }, [visible]);

    const animatedModalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (!order) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
                <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Order #{order.id}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color={AppColors.text.primary} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.modalContent}>
                        {/* Sửa lỗi cú pháp: Tách các Text ra riêng */}
                        <View style={styles.modalSummary}>
                            <Text style={styles.modalText}>Total: ${order.total_price.toFixed(2)}</Text>
                            <Text style={styles.modalText}>
                                Status: {order.payment_status === "paid" ? "Paid" : "Pending"}
                            </Text>
                            <Text style={styles.modalText}>
                                Placed: {new Date(order.created_at).toLocaleDateString()}
                            </Text>
                        </View>

                        <Text style={styles.modalSectionTitle}>Items</Text>

                        <FlatList
                            data={order.items}
                            keyExtractor={(item) => item.product_id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.modalItemContainer}>
                                    <Image source={{ uri: item.image }} style={styles.modalItemImage} />
                                    <View style={styles.modalItemInfo}>
                                        <Text style={styles.modalItemTitle} numberOfLines={1}>{item.title}</Text>
                                        <Text style={styles.modalItemDetails}>${item.price.toFixed(2)} x {item.quantity}</Text>
                                    </View>
                                    <Text style={styles.modalItemSubtotal}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </Text>
                                </View>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

// Màn hình chính
const OrdersScreen = () => {
    const { user } = useAuthStore();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showModal, setShowModal] = useState(false);

    const fetchOrders = async () => {
        if (!user) {
            setLoading(false);
            setOrders([]);
            return;
        }
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('id, total_price, payment_status, created_at, items')
                .eq('user_email', user.email)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error: any) {
            Toast.show({ type: 'error', text1: 'Error', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => {
        fetchOrders();
    }, [user]));

    const handleDeleteOrder = (orderId: number) => {
        Alert.alert("Delete Order", "Are you sure you want to delete this order?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    const { error } = await supabase.from("orders").delete().eq("id", orderId);
                    if (error) {
                        Toast.show({ type: "error", text1: "Error", text2: error.message });
                    } else {
                        setOrders(prev => prev.filter(o => o.id !== orderId));
                        Toast.show({ type: "success", text1: "Order Deleted" });
                    }
                }
            }
        ]);
    };

    const handleViewDetail = (order: Order) => {
        setSelectedOrder(order);
        setShowModal(true);
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
                                onDelete={handleDeleteOrder}
                                email={user?.email}
                                onViewDetail={handleViewDetail}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
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
            <OrderDetailsModal
                visible={showModal}
                order={selectedOrder}
                onClose={() => setShowModal(false)}
            />
        </Wrapper>
    );
};

export default OrdersScreen;

// StyleSheet đã được hoàn thiện
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    pageTitle: {
        marginTop: 16,
        marginBottom: 20,
    },
    // --- Modal Styles ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: AppColors.background.primary,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: AppColors.gray[100],
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: AppColors.text.primary,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    modalContent: {
        padding: 20,
    },
    modalSummary: {
        marginBottom: 20,
        padding: 16,
        backgroundColor: AppColors.gray[50],
        borderRadius: 12,
        gap: 8,
    },
    modalText: {
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.text.primary,
        marginBottom: 12,
    },
    modalItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalItemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#fff',
    },
    modalItemInfo: {
        flex: 1,
    },
    modalItemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: AppColors.text.primary,
    },
    modalItemDetails: {
        fontSize: 12,
        color: AppColors.text.secondary,
    },
    modalItemSubtotal: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
});