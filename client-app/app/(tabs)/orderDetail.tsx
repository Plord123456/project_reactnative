import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/superbase';
import Wrapper from '@/components/Wrapper';
import Loader from '@/components/loader';
import AppColors from '@/constants/theme';
import { Order } from '../(tabs)/order';
import CommonHeader from '@/components/CommonHeader';

const getStatusStyles = (status?: string) => {
  const normalized = status?.toLowerCase();

  switch (normalized) {
    // Trạng thái 'pending' bây giờ sẽ có màu đỏ
    case 'pending':
      return {
        badge: { backgroundColor: '#FEE2E2' }, // Nền đỏ nhạt
        text: { color: '#B91C1C' },          // Chữ đỏ đậm
      };
      
    case 'paid':
    case 'success': // Thêm cả 'success' để linh hoạt hơn
      return {
        badge: { backgroundColor: '#DCFCE7' }, // Nền xanh nhạt
        text: { color: '#047857' },          // Chữ xanh đậm
      };
    default:
      return {
        badge: { backgroundColor: AppColors.gray[100] },
        text: { color: AppColors.text.secondary },
      };
  }
};
const OrderDetailScreen = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const handleBackToOrders = () => {
        if (router.canGoBack()) {
            router.back();
            return;
        }
        router.push('/(tabs)/order');
    };

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();

                if (error) throw error;
                setOrder(data);
            } catch (error: any) {
                Alert.alert('Error', 'Failed to fetch order details.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) return <Loader />;

    if (!order) {
        return (
            <Wrapper>
                <CommonHeader onBackPress={handleBackToOrders} />
                <View style={styles.centerContainer}>
                    <Text>Order not found.</Text>
                </View>
            </Wrapper>
        );
    }
    
    const statusStyles = getStatusStyles(order.payment_status);
    const formattedDate = new Date(order.created_at).toLocaleDateString();
    const itemCount = order.items?.length ?? 0;

    return (
        <Wrapper>
            <CommonHeader title={`Order #${order.id} Details`} onBackPress={handleBackToOrders} />
            <FlatList
                ListHeaderComponent={
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Total</Text>
                            <Text style={styles.summaryValue}>${order.total_price.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Status</Text>
                            <View style={[styles.statusBadge, statusStyles.badge]}>
                                <Text style={[styles.statusText, statusStyles.text]}>{order.payment_status}</Text>
                            </View>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Placed</Text>
                            <Text style={styles.summaryValue}>{formattedDate}</Text>
                        </View>
                                                <View style={styles.summaryRow}>
                                                        <Text style={styles.summaryLabel}>Items</Text>
                                                        <Text style={styles.summaryValue}>{itemCount}</Text>
                                                </View>
                                                {order.shipping_address ? (
                                                    <View style={styles.addressSection}>
                                                        <Text style={styles.addressTitle}>Shipping details</Text>
                                                        <View style={styles.addressRow}>
                                                            <Text style={styles.addressLabel}>Phone</Text>
                                                            <Text style={styles.addressValue}>{order.shipping_address?.phone ?? '—'}</Text>
                                                        </View>
                                                        <View style={styles.addressRow}>
                                                            <Text style={styles.addressLabel}>Address</Text>
                                                            <Text style={styles.addressValue}>
                                                                {(() => {
                                                                    const parts = [
                                                                        order.shipping_address?.street,
                                                                        [order.shipping_address?.city, order.shipping_address?.state].filter(Boolean).join(', '),
                                                                        order.shipping_address?.postal_code,
                                                                        order.shipping_address?.country,
                                                                    ].filter(Boolean);
                                                                    return parts.length ? parts.join('\n') : '—';
                                                                })()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ) : null}
                    </View>
                }
                data={order.items}
                keyExtractor={(item) => item.product_id.toString()}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.itemContainer}
                        onPress={() => router.push(`/product/${item.product_id}`)}
                    >
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                            <Text style={styles.itemDetails}>${item.price.toFixed(2)} x {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemSubtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </Pressable>
                )}
                contentContainerStyle={styles.container}
            />
        </Wrapper>
    );
};

export default OrderDetailScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryContainer: {
        padding: 16,
        backgroundColor: AppColors.gray[50],
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
    },
    addressSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: AppColors.gray[100],
        gap: 12,
    },
    addressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
    addressRow: {
        gap: 4,
    },
    addressLabel: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: AppColors.text.secondary,
    },
    addressValue: {
        fontSize: 14,
        color: AppColors.text.primary,
        lineHeight: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
    summaryText: {
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    statusBadge: { 
        paddingVertical: 4, 
        paddingHorizontal: 10, 
        borderRadius: 20, 
        alignSelf: 'flex-start' 
    },
    statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.background.secondary,
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: AppColors.text.primary,
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 12,
        color: AppColors.text.secondary,
    },
    itemSubtotal: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
});