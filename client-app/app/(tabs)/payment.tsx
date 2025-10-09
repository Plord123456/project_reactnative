import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Wrapper from '@/components/Wrapper';
import AppColors from '@/constants/theme';
import { Button } from '@react-navigation/elements';

const payment = () => {
  return (
   <Wrapper >
     <View style={styles.container}>
      <Text style={styles.title}>Complete Your Payment</Text>
      <Text style={styles.subtitle}>
        Please confirm your payment details and proceed to checkout.
      </Text>
      <Text style={styles.totalPrice}>
        Total: 100$
      </Text>
      <Button
        onPress={ ()=>{}}
        style={styles.button}
      >
        Confirm Payment
      </Button>
    </View>
   </Wrapper>
  );
};

export default payment;

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