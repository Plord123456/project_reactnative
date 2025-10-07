import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';
import { SplashScreen } from 'expo-router';

// Ngăn màn hình splash tự động ẩn đi
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Đảm bảo rằng việc tải lại sẽ điều hướng về (tabs)
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router sẽ bắt lỗi và hiển thị màn hình lỗi
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Không render gì cho đến khi font được tải xong
  if (!loaded) {
    return null;
  }

  return (
      <>
       <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <Toast />
      </>
  );
}