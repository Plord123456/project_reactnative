import AppColors from '@/constants/theme';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface Props {
  title?: string;
  isFav?: boolean;
  handleToggleFavorite?: () => void;
  onBackPress?: () => void;
}


const CommonHeader = ({ title, isFav, handleToggleFavorite, onBackPress }: Props) => {
  const router = useRouter();
  const handleGoBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
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
      <View style={styles.titleContainer}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>
      {handleToggleFavorite ? (
        <View style={styles.buttonView}>
          <TouchableOpacity
            onPress={handleToggleFavorite}
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
            style={styles.favoriteButton}
          >
            <MaterialCommunityIcons
              name="cart-outline"
              size={24}
              color={
               AppColors.text.primary
              }
            />
          </TouchableOpacity>
        </View>
      ) : <View style={styles.placeholder} />}
    </View>
  );
};
export default CommonHeader;


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: 'center',
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
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text.primary,
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
  placeholder: {
    width: 40,
  },
});