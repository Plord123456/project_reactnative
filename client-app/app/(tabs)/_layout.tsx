import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Foundation, FontAwesome } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => <Foundation size={28} name="shopping-cart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) =>
             <Feather size={28} name="user" color={color} />,
        }}
      />
  
      <Tabs.Screen
        name="search"
        options={{
         href: null,   
        }}
      />
         <Tabs.Screen
        name="cart"
        options={{
         href: null,
        }}
      />
         <Tabs.Screen
        name="favorites"
        options={{
         href: null,
        }}
      />
         <Tabs.Screen
        name="product/[id]"
        options={{
         href: null,
       
        }}
      />

   <Tabs.Screen
        name="login"
        options={{
         href: null,
        }}
      />
         <Tabs.Screen
        name="signup"
        options={{
         href: null,
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
         href: null,
        }}
      />
      <Tabs.Screen
        name="orderDetail"
        options={{
         href: null,
        }}
      />

        <Tabs.Screen
        name="payment"
        options={{
         href: null,
        }}
      />
        <Tabs.Screen
        name="edit-profile"
        options={{
         href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
         href: null,
        }}
      />
      <Tabs.Screen
        name="shipping-address"
        options={{
         href: null,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
         href: null,
        }}
      />
      
      
      
    </Tabs>
  );
}
