import { Alert, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Wrapper from '@/components/Wrapper';
import AppColors from '@/constants/theme';
import { Button } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import useStripePayment from '@/components/StripePayment';

const getStringParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] : value || "";

const PaymentScreen = () => {
  const router = useRouter();
  const { paymentIntent, ephemeralKey, customer, total, orderId } = useLocalSearchParams();
  const { user } = useAuthStore();

  const totalValue = Number(getStringParam(total));

  const paymentArgs = {
    paymentIntent: getStringParam(paymentIntent),
    ephemeralKey: getStringParam(ephemeralKey),
    customer: getStringParam(customer),
    orderId: getStringParam(orderId),
    onSuccess: () => {
      router.replace('/order');
    },
  };

  const allParamsPresent = Object.values(paymentArgs).every(Boolean);

  const { handlePayment, isProcessing } = useStripePayment(paymentArgs);

  const handleConfirmPress = () => {
    if (!allParamsPresent) {
      Alert.alert('Payment Error', 'Missing payment details. Please return to your cart and try again.');
      return;
    }
    handlePayment();
  };

  return (
    <Wrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Complete Your Payment</Text>
        <Text style={styles.subtitle}>
          Please confirm your payment details and proceed to checkout.
        </Text>
        <Text style={styles.totalPrice}>
          Total: ${Number.isFinite(totalValue) ? totalValue.toFixed(2) : '0.00'}
        </Text>
        <Button
          onPress={handleConfirmPress}
          style={styles.button}
          disabled={isProcessing || !user}
        >
          {isProcessing ? 'Processing…' : 'Confirm Payment'}
        </Button>
      </View>
    </Wrapper>
  );
};

export default PaymentScreen;

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