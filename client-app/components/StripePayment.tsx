import { Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/superbase';
import * as Linking from 'expo-linking';

type StripePaymentArgs = {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  orderId: string;
  onSuccess: () => void;
};

const useStripePayment = ({
  paymentIntent,
  ephemeralKey,
  customer,
  orderId,
  onSuccess,
}: StripePaymentArgs) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const returnUrl = Linking.createURL('/(tabs)/order');

  const updatePaymentStatus = useCallback(async () => {
    const { error } = await supabase
      .from('orders')
      .update({ payment_status: 'paid' })
      .eq('id', orderId);

    if (error) {
      console.warn('Supabase update warning:', error);
    }
  }, [orderId]);

  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    try {
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent,
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        merchantDisplayName: 'Shopcart Store',
        allowsDelayedPaymentMethods: true,
        returnURL: returnUrl,
      });

      if (initError) {
        console.error('Stripe initPaymentSheet error:', initError);
        throw new Error(`Init payment sheet error: ${initError.message}`);
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Stripe presentPaymentSheet error:', presentError);
        Alert.alert('Payment Canceled', presentError.message);
        return;
      }

      await updatePaymentStatus();

      Alert.alert('Payment Successful', 'Thank you for your purchase!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess();
            router.replace('/(tabs)/order');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Stripe payment flow error:', error);
      Alert.alert('Payment Error', error?.message ?? 'An unknown error occurred.');
    } finally {
      setIsProcessing(false);
    }
  }, [customer, ephemeralKey, initPaymentSheet, onSuccess, paymentIntent, presentPaymentSheet, router, updatePaymentStatus]);

  return {
    handlePayment,
    isProcessing,
  };
};

export default useStripePayment;