import { ActivityIndicator, StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native';
import React from 'react';
import { Order } from '@/app/(tabs)/order';
import AppColors from '@/constants/theme';
import { useRouter } from 'expo-router';

interface Props {
  order: Order;
  onPayNow: (order: Order) => void;
  onViewDetail: (orderId: number) => void;
  isPaying?: boolean;
  onDelete?: (orderId: number) => void;
}

const getStatusStyles = (status?: string) => {
  const normalized = status?.toLowerCase();

  switch (normalized) {
    // Trạng thái 'pending' bây giờ sẽ có màu đỏ
    case 'pending':
      return {
        badge: { backgroundColor: '#FEE2E2' }, // Nền đỏ nhạt
        text: { color: '#B91C1C' },          // Chữ đỏ đậm
      };
      
    // Trạng thái 'paid' (hoặc 'success') bây giờ sẽ có màu xanh
    case 'paid':
    case 'success': // Thêm cả 'success' để linh hoạt hơn
      return {
        badge: { backgroundColor: '#DCFCE7' }, // Nền xanh nhạt
        text: { color: '#047857' },          // Chữ xanh đậm
      };
      
    // Mặc định không thay đổi
    default:
      return {
        badge: { backgroundColor: AppColors.gray[100] },
        text: { color: AppColors.text.secondary },
      };
  }
};

const OrderItem = ({ order, onPayNow, onViewDetail, isPaying = false, onDelete }: Props) => {
  const firstItem = order.items?.[0];
  const statusStyles = getStatusStyles(order.payment_status);
  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.date}>{new Date(order.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, statusStyles.badge]}>
          <Text style={[styles.statusText, statusStyles.text]}>{order.payment_status}</Text>
        </View>
      </View>

      {firstItem && (
        <Pressable
          style={styles.itemRow}
          onPress={() => router.push(`/product/${firstItem.product_id}`)}
        >
          <Image source={{ uri: firstItem.image }} style={styles.itemImage} />
          <View style={styles.itemDetails}>
            <Text style={styles.itemTitle} numberOfLines={1}>{firstItem.title}</Text>
            {order.items.length > 1 && (
              <Text style={styles.moreItemsText}>+ {order.items.length - 1} more items</Text>
            )}
          </View>
        </Pressable>
      )}

      <View style={styles.cardFooter}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total_price.toFixed(2)}</Text>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.viewDetailsButton} onPress={() => onViewDetail(order.id)}>
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
          </TouchableOpacity>
          {order.payment_status !== 'paid' && (
            <TouchableOpacity
              style={[styles.payNowButton, isPaying && styles.payNowButtonDisabled]}
              onPress={() => onPayNow(order)}
              disabled={isPaying}
            >
              {isPaying ? (
                <ActivityIndicator size="small" color={AppColors.background.primary} />
              ) : (
                <Text style={styles.payNowButtonText}>Pay Now</Text>
              )}
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(order.id)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default OrderItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background.secondary,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.gray[100],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderId: { fontSize: 16, fontWeight: '600', color: AppColors.text.primary },
  date: { fontSize: 12, color: AppColors.text.secondary, marginTop: 4 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.gray[50],
  },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#fff' },
  itemDetails: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '500', color: AppColors.text.primary },
  moreItemsText: { fontSize: 12, color: AppColors.text.secondary, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: AppColors.gray[100],
    padding: 16,
    backgroundColor: AppColors.gray[50],
  },
  totalLabel: { fontSize: 14, color: AppColors.text.secondary },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: AppColors.text.primary },
  actionsContainer: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  viewDetailsButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.gray[200],
  },
  viewDetailsButtonText: { color: AppColors.text.primary, fontWeight: '500', fontSize: 14 },
  payNowButton: {
    backgroundColor: AppColors.primary[500],
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  payNowButtonDisabled: {
    opacity: 0.6,
  },
  payNowButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  deleteButton: {
    backgroundColor: AppColors.error,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});