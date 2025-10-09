import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import AppColors from '@/constants/theme';
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; // Thêm các bộ icon khác

type EmptyStateType = 'search' | 'favorites' | 'cart' | 'orders' | 'profile' | 'empty';

interface EmptyStateProps {
  type?: EmptyStateType;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type = 'empty', message, actionLabel, onAction }) => {
  const iconSize = 64;
  const iconColor = AppColors.gray[300];

  const getIcon = () => {
    switch (type) {
      case 'search':
        return <AntDesign name="search" size={iconSize} color={iconColor} />;
      case 'favorites':
        return <AntDesign name="heart" size={iconSize} color={iconColor} />;
      case 'cart':
        return <Feather name="shopping-cart" size={iconSize} color={iconColor} />;
      case 'orders':
        return <Feather name="package" size={iconSize} color={iconColor} />;
      case 'profile':
          return <AntDesign name="user" size={iconSize} color={iconColor} />;
      default:
        return <MaterialCommunityIcons name="cloud-question-outline" size={iconSize} color={iconColor} />;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return 'No Results Found';
      case 'favorites':
        return 'You haven\'t added any favorites yet';
      case 'cart':
        return 'Your shopping cart is empty';
      case 'orders':
        return 'You have no orders yet';
      case 'profile':
        return 'Please log in to see your profile';
      default:
        return 'Oops! Nothing to see here.';
    }
  };

  return (
    <View style={styles.container}>
      {getIcon()}
      <Text style={styles.message}>
        {message || getDefaultMessage()}
      </Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionButtonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default EmptyState;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 24, // Tạo khoảng cách đều giữa các phần tử
  },
  message: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280, // Giới hạn chiều rộng để không quá dài
  },
  actionButton: {
    backgroundColor: AppColors.primary[500],
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});