import { KeyboardAvoidingView, StyleSheet, Text, View, Platform, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useState } from 'react';
import AppColors from '@/constants/theme';
import Wrapper from '@/components/Wrapper';
import { Foundation } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import TextInputCustom from '@/components/Textinput';
import Button from '@/components/Button';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/superbase';

// Sửa lại đường dẫn tương đối cho đúng từ app/(tabs)
const googleLogo = require("../../assets/images/logo/Google-Logo.png");

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    
    const router = useRouter();
    const { login, isLoading, error, setError } = useAuthStore();

    // SỬ DỤNG MỘT ĐỊA CHỈ REDIRECT CỐ ĐỊNH DUY NHẤT
    // Địa chỉ này phải khớp với "scheme" trong app.json và được đăng ký trên Google Cloud
    const redirectTo = 'shopcartyt://login/callback';
    console.log('Using native OAuth redirect URI:', redirectTo);

    const signInWithGoogle = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (data.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

                if (result.type === 'success' && result.url) {
                    const url = result.url;
                    const params = new URL(url).hash.substring(1).split('&').reduce((acc, part) => {
                        const [key, value] = part.split('=');
                        acc[decodeURIComponent(key)] = decodeURIComponent(value);
                        return acc;
                    }, {} as Record<string, string>);

                    if (params.access_token && params.refresh_token) {
                        await supabase.auth.setSession({
                            access_token: params.access_token,
                            refresh_token: params.refresh_token,
                        });
                        Alert.alert('Thành công', 'Đăng nhập với Google thành công!');
                        router.replace('/(tabs)/profile'); // Chuyển hướng sau khi đăng nhập
                    } else {
                        throw new Error('Không thể lấy thông tin session từ URL.');
                    }
                } else if (result.type !== 'cancel') {
                    Alert.alert('Lỗi', 'Quá trình đăng nhập đã thất bại.');
                }
            }
        } catch (catchedError: any) {
            Alert.alert('Lỗi đăng nhập', catchedError.message);
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
                        <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
                            <Image source={googleLogo} style={styles.googleLogo} />
                            <Text style={styles.googleButtonText}>Sign In with Google</Text>
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

// Giữ nguyên các style của bạn
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
        gap: 12,
        backgroundColor: '#ffffffff', // Thêm màu nền cho nút Google
    },
    googleLogo: {
        width: 70, // Sửa lại kích thước cho phù hợp
        height: 35,
        resizeMode: 'contain',
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.primary[500], // Chữ màu trắng
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