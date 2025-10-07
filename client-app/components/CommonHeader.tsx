import AppColors from '@/constants/theme';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  isFav?: boolean;
  showCart?: boolean;
  handleToggleFavorite?: () => void;
}


const CommonHeader = ({ isFav, showCart, handleToggleFavorite }: Props) => {
  const router = useRouter();
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/");
    }
  };
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color={AppColors.text.primary} />
      </TouchableOpacity>
      <View style={styles.buttonView}>
        <TouchableOpacity
          style={[styles.favoriteButton, isFav && styles.activeFavoriteButton]}
        >
          <AntDesign
            name="heart"
            size={20}
            color={
              isFav ? AppColors.background.primary : AppColors.text.primary
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/cart")}
          style={[styles.favoriteButton, isFav && styles.activeFavoriteButton]}
        >
          <MaterialCommunityIcons
            name="cart-outline"
            size={24}
            color={
              isFav ? AppColors.background.primary : AppColors.text.primary
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default CommonHeader;


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  activeFavoriteButton: {
    backgroundColor: AppColors.error,
  },
  buttonView: {
    flexDirection: "row",
    // gap is not supported on older React Native versions; use margin for spacing
    alignItems: 'center',
  },
});