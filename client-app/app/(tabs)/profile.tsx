import { StyleSheet,View,Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
import Wrapper from "@/components/Wrapper";
import AppColors from "@/constants/theme";
import { Button } from "@react-navigation/elements";

const ProfileScreen = () => {
  const { user, isLoading, checkSession } = useAuthStore();
  const router = useRouter();
  React.useEffect(() => {
    if (!user) {
      checkSession();
    
    }
  }, [user]);
    

return (
<Wrapper>
      <Text>User available</Text>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.message}>
          Please log in or sign up to access your profile and enjoy all features.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            style={styles.loginButton}
            onPress={() => router.push('/(tabs)/login')}
          >
            {"Log In"}
          </Button>
          <Button
            variant="filled"
            style={styles.signupButton}
            onPress={() => router.push('/(tabs)/signup')}
          >
            {"Signup"}
          </Button>
        </View>
      </View>
    </Wrapper>

);
};
export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },

  // Card chứa thông tin user
  profileCard: {
    width: '100%',
    backgroundColor: AppColors.background.secondary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Avatar giả lập
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E6E6E6',
    marginBottom: 12,
  },

  // Tên user
  nameText: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text.primary,
    marginBottom: 4,
  },

  // Email / mô tả phụ
  subtitleText: {
    fontSize: 14,
    color: AppColors.text.tertiary ?? AppColors.text.primary,
    marginBottom: 12,
  },

  // Các nút hành động (row)
  actionsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  // Nút chung
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: AppColors.primary?.[500] ?? AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Nút phụ (ví dụ: logout)
  actionButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: AppColors.background.primary,
    borderWidth: 1,
    borderColor: AppColors.primary?.[500] ?? AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12, // spacing between buttons
  },

  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  actionTextSecondary: {
    color: AppColors.primary?.[500] ?? AppColors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Khi chưa login (welcome)
  welcomeBox: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: AppColors.background.secondary,
    alignItems: 'center',
  },

  welcomeText: {
    color: AppColors.text.primary,
    fontSize: 16,
  },

  message: {
    fontSize: 16,
    color: AppColors.text.secondary ?? AppColors.text.primary,
    textAlign: 'center',
    marginVertical: 12,
  },
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: AppColors.primary?.[500] ?? AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  signupButton: {
    backgroundColor: AppColors.primary?.[500] ?? AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});