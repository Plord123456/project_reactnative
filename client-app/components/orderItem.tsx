import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import AppColors from '@/constants/theme';
import { Feather } from '@expo/vector-icons';
import Wrapper from './Wrapper';
import { Title } from './Titile';
import axios from 'axios';
import { BASE_URL } from '@/config';
import { useRouter } from 'expo-router';
interface Order {
  id: number;
  total_price: number;
  payment_status: string;
  created_at: string;
  items: {
    product_id: number;
    title: string;
    price: number;
    quantity: number;
    image: string;
  }[];
}

interface Props {
  order: Order;
  onDelete: (id: number) => void;
  email: string | undefined;
  onViewDetail?: (order: Order) => void;
}

const styles = StyleSheet.create({
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  payNowButton: {
    marginTop: 8,
    backgroundColor: AppColors.primary[500],
    paddingVertical: 6,
    width: 80,
    borderRadius: 4,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  payNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderView: {
    padding: 10,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  orderItem: {
    marginBottom: 8,
  },
  orderId: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  orderStatus: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemsContainer: {
    marginTop: 12,
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: AppColors.gray[50],
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.text.primary,
  },
  itemMeta: {
    fontSize: 12,
    color: AppColors.text.secondary,
    marginTop: 2,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginLeft: 8,
  },
  viewDetailsButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AppColors.primary[500],
  },
  viewDetailsText: {
    color: AppColors.primary[500],
    fontWeight: '600',
    fontSize: 14,
  },
});

const OrderItem = ({ order, onDelete, email, onViewDetail }: Props) => {
  const isPaid = order?.payment_status === 'paid' || order?.payment_status === 'success';
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState(false);
  const router = useRouter();
  const handleViewDetails = () => {
    if (onViewDetail) {
      onViewDetail(order);
    }
  };
const handlePayNow = async () => {
  setLoading(true);
  setDisable(false);
  const payload = {
    price: order?.total_price,
    email: email,
  };
  try {
const response = await axios.post(`${BASE_URL}/checkout`, payload, {
  headers: { "Content-Type": "application/json" },
});

const { paymentIntent, ephemeralKey, customer } = response.data;
if (response?.data) {
  Alert.alert("Pay Now", `Initiating payment for order #${order?.id}`, [
    { text: "Cancel" },
    { text: "Pay", onPress: () => {
      router.push({
    pathname: "/payment",
    params: {
      paymentIntent,
      ephemeralKey,
      customer,
      orderId: order?.id,
      total: order?.total_price,
    }
  });
    }},
  ]);
}

  } catch (error) {
    
  } finally {
    setLoading(false);
    setDisable(false);
  }
};


const handleDelete = () => {
  Alert.alert(
    "Delete Order",
    `Are you sure you want to delete Order #${order?.id}`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(order?.id),
      },
    ]
  );
};
return (
  <View style={[styles.orderView, { borderColor: isPaid ? AppColors.success : AppColors.error, borderWidth: 1 }]}>
    <View style={styles.orderItem}>
      <Text style={styles.orderId}>Order #{order?.id}</Text>
      <Text>Total: ${order?.total_price.toFixed(2)}</Text>
      <Text style={[styles.orderStatus, { color: isPaid ? AppColors.success : AppColors.error }]}>
        {isPaid ? 'Paid' : 'Unpaid'}
      </Text>
      <Text style={styles.orderDate}>Placed: {new Date(order?.created_at).toLocaleString()}</Text>
    </View>
    {onViewDetail && (
      <TouchableOpacity onPress={handleViewDetails} style={styles.viewDetailsButton}>
        <Text style={styles.viewDetailsText}>View Details</Text>
      </TouchableOpacity>
    )}
    {!isPaid && (
      <TouchableOpacity
      disabled={disable}
        onPress={handlePayNow}
        style={[styles.payNowButton]}>
        {loading ? <ActivityIndicator size="small" color={AppColors.background.primary} /> : (
          <Text style={styles.payNowText}>Pay Now</Text>
        )}
      </TouchableOpacity>
    )}
        {order.items?.length ? (
          <View style={styles.itemsContainer}>
            {order.items.map((item) => (
              <View key={`${order.id}-${item.product_id}`} style={styles.itemRow}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
                ) : (
                  <View style={[styles.itemImage, { justifyContent: 'center', alignItems: 'center' }]}> 
                    <Feather name="image" size={20} color={AppColors.gray[300]} />
                  </View>
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.itemMeta}>${item.price.toFixed(2)} × {item.quantity}</Text>
                </View>
                <Text style={styles.itemSubtotal}>
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
    <TouchableOpacity
    onPress={handleDelete}
style={styles.deleteButton}
    >
      <Feather

        name="trash-2"
        size={20}
        color={AppColors.error} />
      
    </TouchableOpacity>
  </View>
);
}

export default OrderItem;