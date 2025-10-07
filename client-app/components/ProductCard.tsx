import { StyleSheet,View,Text, StyleProp, ViewStyle } from "react-native";
import React from "react";
import { Product } from "@/type";
import AppColors from "@/constants/theme";

interface ProductCardProps {
  product:Product;
  customStyle?:StyleProp<ViewStyle>;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  customStyle,
  compact = false,
}) => {

  return (

      <View>
        <Text>Product Card</Text>
      </View>

  );
};
export default ProductCard;


const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.background.primary,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
    width: "48%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.gray[200],
  },
  compactCard: {
    width: 150,
    marginRight: 12,
  },
  imageContainer: {
    position: "relative",
    height: 150,
    backgroundColor: AppColors.background.primary,
    padding: 5,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderColor: AppColors.warning,
  },
  content: {
    padding: 12,
    backgroundColor: AppColors.background.secondary,
  },
  category: {
    fontSize: 12,
    color: AppColors.text.tertiary,
    textTransform: "capitalize",
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text.primary,
    marginBottom: 8,
  },
  footer: {
    justifyContent: "space-between",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.primary[600],
  },
});