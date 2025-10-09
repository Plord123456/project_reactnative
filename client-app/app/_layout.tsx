// app/_layout.tsx

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StripeProvider } from "@stripe/stripe-react-native";
import { EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY } from "@/config";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  // 2. Bọc toàn bộ ứng dụng của bạn trong GestureHandlerRootView
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <Toast />
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
