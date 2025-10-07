import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import Toast from 'react-native-toast-message';


export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  // If the custom font isn't available or hasn't finished loading, don't return
  // null (which produces a blank screen). Instead render the navigation stack
  // as a fallback so the app UI appears while fonts load or until a real font
  // file is added to `assets/fonts`.
  if (!loaded) {
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

}

