import { Alert, StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/superbase';
import AppColors from '@/constants/theme';
import * as Linking from 'expo-linking';

type Props = {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  orderId: string;
  userEmail: string;
  onSuccess: () => void;
};

const StripePayment = ({ 
  paymentIntent,
  ephemeralKey, 
  customer, 
  orderId, 
  userEmail,
  onSuccess 
}: Props) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();

  const returnUrl = Linking.createURL('/(tabs)/order');

  // Sử dụng useEffect để tự động chạy luồng thanh toán khi component được render
  useEffect(() => {
    handlePayment();
  }, []);

  // Tách hàm cập nhật trạng thái ra ngoài
  const updatePaymentStatus = async () => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: "paid" }) // Cập nhật thành 'paid'
      .eq("id", orderId);
      
    if (error) {
      // Ném lỗi để block catch có thể bắt được
      throw new Error(`Error updating payment status: ${error.message}`);
    }
  };

  const handlePayment = async () => {
    try {
      // 1. Khởi tạo Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        merchantDisplayName: "Shopcart Store",
        allowsDelayedPaymentMethods: true, // Thêm tùy chọn này
      });

      if (initError) {
        throw new Error(`Init payment sheet error: ${initError.message}`);
      }

      // 2. Hiển thị Payment Sheet cho người dùng
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        // Nếu người dùng hủy hoặc có lỗi, không cần làm gì thêm
        Alert.alert("Payment Canceled", presentError.message);
        return;
      }

      // 3. Nếu thanh toán thành công, cập nhật trạng thái và thông báo
      await updatePaymentStatus();

      Alert.alert(
        "Payment Successful", 
        "Thank you for your purchase!",
        // Sửa lại cú pháp của nút bấm trong Alert
        [
          { 
            text: "OK", 
            onPress: () => { 
              onSuccess(); 
              router.replace('/(tabs)/order'); // Dùng replace để người dùng không back lại trang payment được
            } 
          }
        ]
      );

    } catch (error: any) {
      Alert.alert("Payment Error", error.message || "An unknown error occurred.");
      console.error("Payment failed:", error);
    }
  };

  return {
    handlePayment,
  };
};

export default StripePayment;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: AppColors.text.secondary,
  }
});