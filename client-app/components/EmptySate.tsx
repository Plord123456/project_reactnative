import { Button, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppColors from '@/constants/theme';
import { AntDesign } from '@expo/vector-icons';

type EmptyStateType = 'search' | 'favorites' | 'cart' | 'orders' | 'profile';
interface EmptyStateProps {
  type?: EmptyStateType;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}
const EmptyState: React.FC<EmptyStateProps> = ({ type, message, actionLabel, onAction }) => {
  const size = 64;
  const color = AppColors.gray[400];
  const getIcon = () => {
    switch (type) {
      case 'search':
        return (<AntDesign name="search" size={size} color={color} />);
      case 'favorites':
        return (<AntDesign name="heart" size={size} color={color} />);
      case 'cart':
        return (<AntDesign name="shopping-cart" size={size} color={color} />);
      case 'orders':
        return (<AntDesign name="shopping-cart" size={size} color={color} />);
      default:
        return (<AntDesign name="user" size={size} color={color} />);
    }
  };
  const getDefaultMessage = () => {
    switch (type) {
      case 'search':
        return 'No results found';
      case 'favorites':
        return 'No favorite items yet';
      case 'cart':
        return 'Your cart is empty';
      case 'orders':
        return 'No orders placed yet';
      default:
        return 'No profile information available';
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getIcon()}
        <Text style={styles.message}>
          {message || getDefaultMessage()}
          </Text>
        {actionLabel && onAction && (
         <View style={styles.button}>
           <Button
            title={actionLabel}
            onPress={onAction}
           />
         </View>
        )}
      </View>
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
  },
  iconContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 18,
    color: AppColors.text.secondary,
    textAlign: "center",
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});