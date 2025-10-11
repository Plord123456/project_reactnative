import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Alert, Pressable, Button, ActivityIndicator } from 'react-native';
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
  const { id } = useLocalSearchParams();
  const orderId = Number(id);
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [timelineExpanded, setTimelineExpanded] = useState(false);
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

    const handleStartShipping = async () => {
        if (!orderId) return;
        Alert.alert("Xác nhận", "Bạn có muốn bắt đầu giao đơn hàng này?", [
          { text: "Huỷ" },
          {
            text: "Bắt đầu",
            onPress: async () => {
              const { data, error } = await supabase.functions.invoke("start-shipping-simulation", {
                body: { order_id: orderId },
              });
              if (error) {
                Alert.alert("Lỗi", error.message);
                return;
              }
              Alert.alert("Thành công", data?.message ?? "Đã khởi tạo vận đơn.");
            },
          },
        ]);
      };
    
      const simulateUpdate = async (status: string) => {
        if (!orderId) return;
        const { error } = await supabase.functions.invoke("update-shipping-status", {
          body: { order_id: orderId, new_status: status },
        });
        if (error) {
          Alert.alert("Lỗi", error.message);
          return;
        }
        Alert.alert("Thành công", `Đã cập nhật trạng thái thành: ${status}`);
      };

    useEffect(() => {
        if (!orderId) return;
        const channel = supabase
          .channel(`orders:${orderId}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
            (payload) => {
              setOrder(payload.new as Order);
            },
          )
          .subscribe();
        return () => {
          supabase.removeChannel(channel);
        };
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

    // Render timeline entries
    const renderTimeline = () => {
      const history = (order?.tracking_history ?? []).slice(); // copy
      if (!history.length) {
        return <Text style={styles.noTimeline}>No tracking history</Text>;
      }
      // newest first
      history.reverse();
      const visible = timelineExpanded ? history : history.slice(0, 5);
      return (
        <View style={styles.timelineContainer}>
          {visible.map((h, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{h.status}</Text>
                <Text style={styles.timelineMeta}>
                  {new Date(h.updated_at).toLocaleString()} • {h.location}
                </Text>
              </View>
            </View>
          ))}
          {history.length > 5 && (
            <TouchableOpacity onPress={() => setTimelineExpanded((s) => !s)} style={styles.loadMoreBtn}>
              <Text style={styles.loadMoreText}>{timelineExpanded ? 'Show less' : `Load ${history.length - 5} more`}</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    };
    
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
                                                        {/* Lightweight timeline rendered below shipping details */}
                                                        <View style={{ marginTop: 12 }}>
                                                          <Text style={styles.addressTitle}>Tracking timeline</Text>
                                                          {renderTimeline()}
                                                        </View>
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
            <Button title="Bắt đầu Giao hàng" onPress={handleStartShipping} />
            <View style={{ marginTop: 20, gap: 12 }}>
                <Button title="Cập nhật: Đang vận chuyển" onPress={() => simulateUpdate("Đang vận chuyển")} />
                <Button title="Cập nhật: Giao hàng thành công" onPress={() => simulateUpdate("Giao hàng thành công")} />
            </View>
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
    timelineContainer: {
    marginTop: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
    marginTop: 6,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 2,
  },
  timelineMeta: {
    color: AppColors.text.secondary,
    fontSize: 12,
  },
  noTimeline: {
    color: AppColors.text.secondary,
    marginTop: 8,
  },
  loadMoreBtn: {
    marginTop: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  loadMoreText: {
    color: AppColors.primary[500],
    fontWeight: '600',
  },
});