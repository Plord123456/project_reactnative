import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';
import { useEffect } from 'react';

// Ngăn màn hình splash tự động ẩn đi trong khi tải font
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
    // Thêm các font khác nếu cần
    // 'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
  });

  // If fonts fail to register (e.g. invalid/placeholder file), we should
  // avoid throwing and crashing the app. Instead log a warning and continue
  // rendering with system fonts as a graceful fallback.
  useEffect(() => {
    if (error) {
      // Log the font registration error for debugging
      // (Don't re-throw — that would crash the app)
      // eslint-disable-next-line no-console
      console.warn('Font load error, continuing with fallback fonts:', error);
      // Hide the splash screen so the app UI can render using fallback fonts
      SplashScreen.hideAsync().catch(() => {});
    }

    if (loaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  // Render immediately whether fonts loaded or errored — UI will use system
  // fonts until/if the custom font becomes available. This prevents the app
  // from showing a blank screen when a font file is invalid.

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