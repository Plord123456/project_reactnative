import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from "react-native";
import React from "react";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "expo-router";
import Wrapper from "@/components/Wrapper";
import AppColors from "@/constants/theme";
import { FontAwesome, Foundation, Feather, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import Button from "@/components/Button";


const ProfileScreen = () => {
    const { user, isLoading, logout, checkSession } = useAuthStore();
    const router = useRouter();

    const menuItems = [
        {
            id: "cart",
            icon: <Foundation name="shopping-cart" size={20} color={AppColors.gray[500]} />,
            title: "My Cart",
            onPress: () => router.push('/cart'), // Điều hướng đến trang cart
        },
        {
            id: "orders",
            icon: <FontAwesome name="archive" size={20} color={AppColors.gray[500]} />,
            title: "My Orders",
            onPress: () => router.push('/(tabs)/order'), // Điều hướng đến trang order
        },
        {
            id: 'payment',
            icon: <FontAwesome name="credit-card" size={20} color={AppColors.gray[500]} />,
            title: "Payment Methods",
            onPress: () => {},
        },
        {
            id: 'shipping',
            icon: <MaterialIcons name="local-shipping" size={20} color={AppColors.gray[500]} />,
            title: "Shipping Addresses",
            onPress: () => {},
        },
        {
            id: 'settings',
            icon: <Foundation name="widget" size={20} color={AppColors.gray[500]} />,
            title: "Settings",
            onPress: () => {}
        },
    ];

    React.useEffect(() => {
        if (!user) {
            checkSession();
        }
    }, []);

   


 const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [{

        text: "Cancel",
        style: "cancel",
       },
       {
           text: "Log Out",
           onPress: async () => {
              try {
                  const result = await logout();
                  Toast.show({
                      type: 'success',
                      text1: 'Logged out successfully',
                      text2: 'You have been logged out.',
                      visibilityTime: 2000,

                  });
              } catch (error) {
                  console.error("Logout failed:", error);
                  Alert.alert("Error", "Failed to log out. Please try again.");
              }
           }
       }
   ]
    );
}; // <-- Close handleLogout function

    if (isLoading && !user) {
        return (
            <Wrapper>
                <View style={[styles.container, styles.centered]}>
                    <ActivityIndicator size="large" color={AppColors.primary?.[500]} />
                </View>
            </Wrapper>
        );
    }
    
    // Giao diện khi chưa đăng nhập (giữ nguyên)
    const WelcomeView = () => (
         <View style={[styles.container, styles.centered]}>
            <View style={styles.welcomeBox}>
                <Text style={styles.title}>Welcome</Text>
                <Text style={styles.message}>
                    Please log in or sign up to access your profile and enjoy all features.
                </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.baseButton, styles.loginButton]}
                        onPress={() => router.push('/(tabs)/login')}
                    >
                        <Text style={styles.buttonText}>Log In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.baseButton, styles.signupButton]}
                        onPress={() => router.push('/(tabs)/signup')}
                    >
                        <Text style={styles.signupButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
         </View>
    );

    return (
        <Wrapper>
            {user ? (
                 // ---- GIAO DIỆN MỚI KHI ĐÃ ĐĂNG NHẬP ----
                <ScrollView style={styles.container}>
                    {/* 1. Header */}
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>My Profile</Text>
                    </View>

                    {/* 2. User Info Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <Feather name="user" size={40} color={AppColors.gray[500]} />
                        </View>
                        <View style={styles.userInfoContainer}>
                            <Text style={styles.nameText}>{user.email}</Text>
                            <TouchableOpacity>
                                <Text style={styles.editProfileText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 3. Menu List */}
                    <View style={styles.menuContainer}>
                        {menuItems.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                                    <View style={styles.menuItemLeft}>
                                        <View style={styles.menuItemIcon}>{item.icon}</View>
                                        <Text style={styles.menuItemText}>{item.title}</Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color={AppColors.gray[400]} />
                                </TouchableOpacity>
                                {index < menuItems.length - 1 && <View style={styles.separator} />}
                            </React.Fragment>
                        ))}
                    </View>

                    {/* 4. Logout Button */}
                   <View style={styles.logoutContainer}>
                    <Button
                        title="Logout"
                        onPress={handleLogout}
                        variant="outline"
                        fullWidth
                        style={styles.logoutButton}
                        textStyle={styles.logoutButtonText}
                        disabled={isLoading} // Vô hiệu hóa nút khi đang loading
                    />
                </View>
                </ScrollView>
            ) : (
                <WelcomeView />
            )}
        </Wrapper>
    );
} // <-- Add missing closing brace for ProfileScreen component

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.background.primary,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    // --- Header Styles ---
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: AppColors.text.primary,
    },
    // --- Profile Card Styles ---
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AppColors.background.secondary,
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    avatarContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: AppColors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    userInfoContainer: {
        flex: 1,
    },
    nameText: {
        fontSize: 18,
        fontWeight: '600',
        color: AppColors.text.primary,
    },
    editProfileText: {
        fontSize: 14,
        color: AppColors.primary[500],
        marginTop: 4,
    },
    // --- Menu List Styles ---
    menuContainer: {
        marginTop: 30,
        marginHorizontal: 20,
        backgroundColor: AppColors.background.secondary,
        borderRadius: 12,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemIcon: {
        width: 30,
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: AppColors.text.primary,
        marginLeft: 16,
    },
    separator: {
        height: 1,
        backgroundColor: AppColors.gray[200],
        marginLeft: 46, // Căn lề với text
    },
    // --- Logout Button Styles ---
    logoutContainer: {
        marginHorizontal: 20,
        marginTop: 30,
        marginBottom: 40,
    },
    logoutButton: {
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: AppColors.error,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: AppColors.error,
        fontSize: 16,
        fontWeight: '600',
    },
    
    // --- Welcome View (Khi chưa đăng nhập) Styles ---
    welcomeBox: {
        width: '100%',
        padding: 20,
        borderRadius: 12,
        backgroundColor: AppColors.background.secondary,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: AppColors.text.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: AppColors.text.secondary ?? AppColors.text.primary,
        textAlign: 'center',
        marginVertical: 12,
        lineHeight: 24,
    },
    buttonContainer: {
        marginTop: 24,
        width: '100%',
        alignItems: 'center',
    },
    baseButton: {
        width: '90%',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    loginButton: {
        backgroundColor: AppColors.primary?.[500] ?? AppColors.primary,
        marginBottom: 12,
    },
    signupButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: AppColors.primary?.[500] ?? AppColors.primary,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    signupButtonText: {
        color: AppColors.primary?.[500] ?? AppColors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});

