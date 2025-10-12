import { Alert, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import Wrapper from '@/components/Wrapper';
import AppColors from '@/constants/theme';
import { Button } from '@react-navigation/elements';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import useStripePayment from '@/components/StripePayment';
import { supabase } from '@/lib/superbase';
import Toast from 'react-native-toast-message'; // <--- DÒNG QUAN TRỌNG BỊ THIẾU

const getStringParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] : value || "";

const PaymentScreen = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuthStore();
    const [updatingOrder, setUpdatingOrder] = useState(false);

    const paymentIntentParam = getStringParam(params.paymentIntent);
    const ephemeralKeyParam = getStringParam(params.ephemeralKey);
    const customerParam = getStringParam(params.customer);
    const totalParam = getStringParam(params.total);
    const orderIdParam = getStringParam(params.orderId);

    const totalValue = Number(totalParam);
    const missingParam =
      !paymentIntentParam || !ephemeralKeyParam || !customerParam || !orderIdParam;

    const paymentArgs = {
        paymentIntent: paymentIntentParam,
        ephemeralKey: ephemeralKeyParam,
        customer: customerParam,
        orderId: orderIdParam,
        onSuccess: async (paymentIntentId: string) => {
            if (!orderIdParam) return;

            setUpdatingOrder(true);
            try {
                const { error: updateError } = await supabase
                    .from('orders')
                    .update({ payment_status: 'paid' })
                    .eq('id', orderIdParam);

                if (updateError) throw updateError;

                Toast.show({ type: 'success', text1: 'Payment Successful!', position: 'bottom' });

                router.replace({
                    pathname: '/(tabs)/orderDetail',
                    params: { id: orderIdParam }
                });
            } catch (err: any) {
                Alert.alert("Lỗi", "Không thể cập nhật trạng thái đơn hàng.");
            } finally {
                setUpdatingOrder(false);
            }
        },
    };

    const { handlePayment, isProcessing } = useStripePayment(paymentArgs);

    const handleConfirmPress = () => {
        if (missingParam) {
            Alert.alert('Payment Error', 'Missing payment details. Please return to your cart and try again.');
            return;
        }
        handlePayment();
    };

    const handlePayLater = () => {
        if (missingParam) {
            Alert.alert('Error', 'Cannot find order details. Please try again.');
            return;
        }
        router.replace({
            pathname: '/(tabs)/orderDetail',
            params: { id: orderIdParam },
        });
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
                    disabled={isProcessing || updatingOrder || !user || missingParam}
                >
                    {isProcessing || updatingOrder ? 'Processing…' : 'Confirm Payment'}
                </Button>
                <Button
                    onPress={handlePayLater}
                    style={styles.button}
                    disabled={isProcessing || updatingOrder}
                >
                    Pay Later
                </Button>
            </View>
            <Toast />
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