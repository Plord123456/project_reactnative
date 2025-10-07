import AppColors from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import React from "react";
import { Text,View, StyleSheet, TouchableOpacity } from "react-native"; 
const Logo = () => {
  const router = useRouter();
  return (
    <View>
      <TouchableOpacity style={styles.logoView} onPress={() => router.push('/')}>
    <MaterialIcons name="storefront" size={30} color={AppColors.primary[700]} />
    <Text style={styles.logoText}>BinhPP Shop</Text>
  </TouchableOpacity>
</View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  logoView: {
    flexDirection: "row",
    alignItems: "center",
  }
  ,
  logoText: {
    fontSize: 20,
    fontFamily: 'SpaceMono',
    marginLeft: 2,
    color: AppColors.primary[700],
  },
}
)