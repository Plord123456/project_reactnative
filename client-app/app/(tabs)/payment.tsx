import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Wrapper from '@/components/Wrapper';
import AppColors from '@/constants/theme';
import { Button } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from '@/.expo/types/router';
import { useAuthStore } from '@/store/auth';
import StripePayment from '@/components/StripePayment';

  const router = useRouter();
   const { paymentIntent, ephemeralKey, customer, total, orderId } = useLocalSearchParams();
  const {user}=useAuthStore();
  // Utility function
const getStringParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] : value || "";
  const totalValue= Number(getStringParam(total));

  const  stripe= StripePayment({
    paymentIntent: getStringParam(paymentIntent),
    ephemeralKey: getStringParam(ephemeralKey),
    customer: getStringParam(customer),
    orderId: getStringParam(orderId),
    userEmail: user?.email || "",
    onSuccess: () => {
      // Điều hướng người dùng đến trang đơn hàng sau khi thanh toán thành công
      router.replace('/(tabs)/order');
    }

   
  });

const paymentScreen = () => {

   return (
   <Wrapper >
     <View style={styles.container}>
      <Text style={styles.title}>Complete Your Payment</Text>
      <Text style={styles.subtitle}>
        Please confirm your payment details and proceed to checkout.
      </Text>
      <Text style={styles.totalPrice}>
        Total: ${totalValue.toFixed(2)}
      </Text>
      <Button
        onPress={ ()=>{stripe.handlePayment}}
        style={styles.button}

      >
        Confirm Payment
      </Button>
    </View>
   </Wrapper>
  );
};

export default paymentScreen;

const styles = StyleSheet.create({
container: {
  flex: 1,
  padding: 20,
  backgroundColor: AppColors.background.primary,
  justifyContent: "center",
},
title: {
  fontFamily: "Inter-Bold",
  fontSize: 24,
  textAlign: "center",
  marginBottom: 16,
},
subtitle: {
  fontFamily: "Inter-Regular",
  fontSize: 16,
  color: AppColors.text.secondary,
  textAlign: "center",
  marginBottom: 12,
},
totalPrice: {
  fontFamily: "Inter-Bold",
  fontSize: 30,
  color: AppColors.text.primary,
  textAlign: "center",
  marginBottom: 20,
},
button: {
  marginTop: 20,
},

});