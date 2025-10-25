import { KeyboardAvoidingView, StyleSheet, Text, View, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react'; // Thêm useEffect
import AppColors from '@/constants/theme';
import Wrapper from '@/components/Wrapper';
import { Foundation } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import TextInputCustom from '@/components/Textinput';
import Button from '@/components/Button';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
// *** QUAN TRỌNG: Xóa hoặc comment out import từ @react-native-google-signin nếu có ***
// import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/superbase';

WebBrowser.maybeCompleteAuthSession();

// --- ĐIỀN CÁC CLIENT ID CỦA BẠN VÀO ĐÂY ---
// Client ID dùng cho Web (và thường dùng cho Expo Go / Web build)
const WEB_CLIENT_ID = '136208304843-83v6vogeghceijnamsdlg1g3ec07q8id.apps.googleusercontent.com';
// Client ID bạn tạo riêng cho ứng dụng Android (dùng cho Development/Standalone build)
const ANDROID_CLIENT_ID = '136208304843-5og7q0k3iln2hh7ej8fs1ca3hjgpnvqc.apps.googleusercontent.com';
// const EXPO_CLIENT_ID = 'YOUR_EXPO_CLIENT_ID'; // Có thể không cần thiết nếu bạn dùng Web/Android/iOS IDs
// ------------------------------------------
const redirectUri = makeRedirectUri(); 

// Log ra để biết URL cần thêm vào Google Console
console.log('Your Expo Proxy Redirect URI:', redirectUri);
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const router = useRouter();
    const { login, isLoading, error, setError } = useAuthStore();

    // Sử dụng Expo Auth Session - Yêu cầu idToken
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({ // <-- Đổi thành useIdTokenAuthRequest
        clientId: WEB_CLIENT_ID, // <-- Dùng Web Client ID ở đây
        // --- Cung cấp các ID khác cho bản build standalone ---
        androidClientId: ANDROID_CLIENT_ID,
        // expoClientId: EXPO_CLIENT_ID, // Nếu cần
    });

    // Xử lý response từ Google OAuth
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params; // Lấy id_token từ params
            if (id_token) {
              handleGoogleSignInWithIdToken(id_token); // Gọi hàm xử lý với idToken
            } else {
              Alert.alert('Lỗi', 'Không nhận được ID token từ Google');
            }
        } else if (response?.type === 'error') {
            console.error("Lỗi Google Auth:", response.error);
            Alert.alert('Lỗi', response.error?.message || 'Đăng nhập Google thất bại');
        }
    }, [response]);

    // Hàm xử lý đăng nhập Supabase bằng idToken
    const handleGoogleSignInWithIdToken = async (idToken: string) => {
        setIsGoogleLoading(true);
        try {
            const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken, // Sử dụng idToken nhận được
            });

            console.log('Supabase Auth Data:', data);
            console.log('Supabase Auth Error:', supabaseError);

            if (supabaseError) {
                throw supabaseError;
            }

            if (data.session) {
                Alert.alert('Thành công', 'Đăng nhập bằng Google thành công!');
                router.replace('/(tabs)/profile');
                setEmail('');
                setPassword('');
            } else {
                Alert.alert('Lỗi', 'Không thể tạo phiên đăng nhập Supabase.');
            }
        } catch (error: any) {
            console.error('Lỗi đăng nhập Supabase với Google idToken:', error);
            Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google.');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const validateForm = () => {
        if (error) {
            setError(null);
        }

        let isValid = true;
        if (!email.trim()) {
            setEmailError('Email is required');
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Email address is wrong format');
            isValid = false;
        } else {
            setEmailError('');
        }
        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        } else {
            setPasswordError('');
        }
        return isValid;
    };

    const handleLogin = async () => {
        if (validateForm()) {
            const success = await login(email.trim(), password.trim());
            if (success) {
                router.replace('/(tabs)/profile');
                setEmail('');
                setPassword('');
            }
        }
    };

    const handleOnChangeText = (setter: Function, value: string) => {
        setter(value);
        if (error) {
            setError(null);
        }
    }

    const handleGoogleLogin = () => {
        promptAsync();
    };

    return (
        <Wrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Foundation
                                name="shopping-cart"
                                size={40}
                                color={AppColors.primary[500]}
                            />
                        </View>
                        <Text style={styles.title}>ShopApp</Text>
                        <Text style={styles.subtitle}>Sign in to your account</Text>
                    </View>
                    <View style={styles.form}>
                        {error && <Text style={styles.errorText}>{error}</Text>}
                        <TextInputCustom
                            label='Email'
                            value={email}
                            onChangeText={(text) => handleOnChangeText(setEmail, text)}
                            placeholder='Enter your email'
                            keyboardType='email-address'
                            autoCapitalize='none'
                            error={emailError}
                        />
                        <TextInputCustom
                            label='Password'
                            value={password}
                            onChangeText={(text) => handleOnChangeText(setPassword, text)}
                            placeholder='Enter your password'
                            error={passwordError}
                            secureTextEntry
                        />
                        <Button
                            title="Sign In"
                            fullWidth
                            loading={isLoading}
                            style={styles.button}
                            onPress={handleLogin}
                        />
                        
                        {/* Nút Google Sign In với Expo Auth Session */}
                        <TouchableOpacity
                            style={[
                                styles.googleButton,
                                isGoogleLoading && styles.googleButtonDisabled
                            ]}
                            onPress={handleGoogleLogin}
                            disabled={isGoogleLoading || !request}
                        >
                            <Text style={styles.googleButtonText}>
                                {isGoogleLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/signup')}>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default Login;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: AppColors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: AppColors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: AppColors.text.secondary,
    },
    form: {
        width: "100%",
    },
    button: {
        marginTop: 16,
    },
    googleButton: {
        marginTop: 16,
        paddingVertical: 14,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4285F4',
    },
    googleButtonDisabled: {
        opacity: 0.6,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 24,
    },
    footerText: {
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    link: {
        fontSize: 14,
        color: AppColors.primary[500],
        marginLeft: 4,
        fontWeight: '600',
    },
    errorText: {
        color: AppColors.error,
        fontSize: 14,
        marginBottom: 16,
        textAlign: "center",
    },
});