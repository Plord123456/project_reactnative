import { StyleSheet, Text, View, FlatList, Image, Pressable, Alert, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/superbase';
import Wrapper from '@/components/Wrapper';
import Loader from '@/components/loader';
import AppColors from '@/constants/theme';
import { Order } from '../(tabs)/order';
import CommonHeader from '@/components/CommonHeader';
import { useAuthStore } from '@/store/auth';

const getStatusStyles = (status?: string) => {
    const normalized = status?.toLowerCase();
    switch (normalized) {
        case 'pending':
            return { badge: { backgroundColor: '#FEE2E2' }, text: { color: '#B91C1C' } };
        case 'paid':
        case 'success':
            return { badge: { backgroundColor: '#DCFCE7' }, text: { color: '#047857' } };
        default:
            return { badge: { backgroundColor: AppColors.gray[100] }, text: { color: AppColors.text.secondary } };
    }
};

const OrderDetailScreen = () => {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const orderIdParam = Array.isArray(params.id) ? params.id?.[0] ?? "" : params.id ?? "";
    const router = useRouter();
     const { user, isInitialized } = useAuthStore();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    const handleBackToOrders = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.push('/(tabs)/order');
    };

    const handleDeleteOrder = () => {
        Alert.alert(
            "Delete Order",
            "Are you sure you want to permanently delete this order? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (!order) return;
                        try {
                            const { error } = await supabase
                                .from('orders')
                                .delete()
                                .eq('id', order.id);

                            if (error) throw error;

                            router.back(); // Go back to the list
                        } catch (error: any) {
                            Alert.alert("Error", "Could not delete the order.");
                        }
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (!isInitialized) return; // Wait for auth to be initialized

        if (!orderIdParam || !user?.id) {
            setLoading(false);
            return;
        }
        const fetchOrderDetails = async () => {
            try {
                const numericId = Number(orderIdParam);
                if (isNaN(numericId)) {
                    throw new Error("Invalid order ID");
                }
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', numericId)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;
                setOrder(data ?? null);
            } catch (error: any) {
                Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderIdParam, user?.id, isInitialized]); // Add isInitialized dependency

    useEffect(() => {
        if (!isInitialized || !orderIdParam || !user?.id) return; // Wait for auth and user

        const numericId = Number(orderIdParam);
        if (isNaN(numericId)) return;

        const channel = supabase
            .channel(`orders:${numericId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${numericId}` },
                (payload) => setOrder(payload.new as Order),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [orderIdParam, user?.id, isInitialized]); // Add isInitialized dependency

    if (loading || !isInitialized) return <Loader />; // Show loader while initializing

    if (!order) {
        return (
            <Wrapper>
                <CommonHeader onBackPress={handleBackToOrders} />
                <View style={styles.centerContainer}><Text>Không tìm thấy đơn hàng.</Text></View>
            </Wrapper>
        );
    }
    
    const statusStyles = getStatusStyles(order.payment_status);
    const formattedDate = new Date(order.created_at).toLocaleDateString();
    const itemCount = order.items?.length ?? 0;

    return (
        <Wrapper>
            <CommonHeader
                title={`Chi tiết đơn #${order.id}`}
                onBackPress={handleBackToOrders}
                rightComponent={
                    <TouchableOpacity onPress={handleDeleteOrder}>
                        <Text style={styles.hideButtonText}>Delete</Text>
                    </TouchableOpacity>
                }
            />
            <FlatList
                ListHeaderComponent={
                    <View style={styles.mainContainer}>
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Tổng tiền</Text><Text style={styles.summaryValue}>${order.total_price.toFixed(2)}</Text></View>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Trạng thái</Text><View style={[styles.statusBadge, statusStyles.badge]}><Text style={[styles.statusText, statusStyles.text]}>{order.payment_status}</Text></View></View>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Ngày đặt</Text><Text style={styles.summaryValue}>{formattedDate}</Text></View>
                            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Số lượng</Text><Text style={styles.summaryValue}>{itemCount} sản phẩm</Text></View>
                        </View>

                        {order.shipping_address && (
                            <View style={styles.addressSection}>
                                <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
                                <View style={styles.addressRow}><Text style={styles.addressLabel}>SĐT:</Text><Text style={styles.addressValue}>{order.shipping_address?.phone ?? '—'}</Text></View>
                                <View style={styles.addressRow}><Text style={styles.addressLabel}>Địa chỉ:</Text><Text style={styles.addressValue}>{`${order.shipping_address?.street}, ${order.shipping_address?.city}`}</Text></View>
                            </View>
                        )}
                        <Text style={styles.sectionTitle}>Sản phẩm</Text>
                    </View>
                }
                data={order.items}
                keyExtractor={(item) => item.product_id.toString()}
                renderItem={({ item }) => (
                    <Pressable style={styles.itemContainer} onPress={() => router.push(`/product/${item.product_id}`)}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemInfo}><Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text><Text style={styles.itemDetails}>${item.price.toFixed(2)} x {item.quantity}</Text></View>
                        <Text style={styles.itemSubtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Pressable>
                )}
            />
        </Wrapper>
    );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
    mainContainer: { paddingHorizontal: 16, paddingTop: 16 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    summaryContainer: { padding: 16, backgroundColor: AppColors.gray[50], borderRadius: 12, marginBottom: 24, gap: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryLabel: { fontSize: 14, color: AppColors.text.secondary },
    summaryValue: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: AppColors.text.primary, marginBottom: 12 },
    addressSection: { marginBottom: 24 },
    addressRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 4 },
    addressLabel: { fontSize: 14, color: AppColors.text.secondary },
    addressValue: { fontSize: 14, color: AppColors.text.primary, flexShrink: 1 },
    itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: AppColors.background.secondary, padding: 12, borderRadius: 8, marginBottom: 12, marginHorizontal: 16 },
    itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: '500', color: AppColors.text.primary, marginBottom: 4 },
    itemDetails: { fontSize: 12, color: AppColors.text.secondary },
    itemSubtotal: { fontSize: 14, fontWeight: '600', color: AppColors.text.primary },
    hideButtonText: {
        color: AppColors.error,
        fontSize: 16,
        fontWeight: '600',
    },
});