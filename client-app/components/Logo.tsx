import AppColors from "@/constants/theme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Image } from "react-native";

const Logo = () => {
  const router = useRouter();
  const [imgError, setImgError] = useState(false);

  return (
    <View>
      <TouchableOpacity style={styles.logoView} onPress={() => router.push('/')}>
        {/* Use a static relative path so Metro can resolve the asset */}
        {!imgError && (
          <Image
            source={require('../assets/images/logo/logo.png')}
            style={styles.logoImg}
            resizeMode="contain"
            onError={() => setImgError(true)}
          />
        )}
        <Text style={styles.logoText}>Monkey Shop</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  logoView: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImg: {
    width: 40,
    height: 40,
    marginRight: 4,
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'SpaceMono',
    marginLeft: 2,
    color: AppColors.primary[700],
  },
});