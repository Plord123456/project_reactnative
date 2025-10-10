// app/settings.tsx
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

const SettingsScreen = () => {
  const [colorScheme, setColorScheme] = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const router = useRouter();

  const toggleTheme = () => {
    setColorScheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

     

      {/* Tùy chọn đổi Mật khẩu */}
      <TouchableOpacity 
        style={styles.optionItem} 
        onPress={() => router.push('/change-password')}
      >
        <View style={styles.optionTextContainer}>
          <FontAwesome5 name="key" size={20} color="#555" />
          <Text style={styles.optionText}>Change Password</Text>
        </View>
        <FontAwesome5 name="chevron-right" size={16} color="#aaa" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
});

export default SettingsScreen;