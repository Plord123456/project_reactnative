import { KeyboardAvoidingView, StyleSheet, Text, View, ScrollView, Platform, Alert, Switch, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Wrapper from '@/components/Wrapper';
import Foundation from '@expo/vector-icons/Foundation';
import AppColors from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import TextInputCustom from '@/components/Textinput';
import Button from '@/components/Button';

export const signUpScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmError, setConfirmError] = useState("");

    const router = useRouter();
    const { isLoading, error: storeError, signup, setError: setStoreError } = useAuthStore();
    
    // Logic cho auto-redirect
    const [autoRedirect, setAutoRedirect] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [signupSuccess, setSignupSuccess] = useState(false); // State mới để kích hoạt countdown
    const timerRef = useRef<number | null>(null);

    const validateForm = () => {
        if (storeError) setStoreError(null);
        let isValid = true;
        // ... (phần validate của bạn đã tốt, giữ nguyên)
        if (!email.trim()) { setEmailError('Email is required'); isValid = false; }
        else if (!/\S+@\S+\.\S+/.test(email)) { setEmailError('Email address is invalid'); isValid = false; }
        else { setEmailError(''); }
        if (!password) { setPasswordError('Password is required'); isValid = false; }
        else if (password.length < 6) { setPasswordError('Password must be at least 6 characters'); isValid = false; }
        else { setPasswordError(''); }
        if (password !== confirmPassword) { setConfirmError('Passwords do not match'); isValid = false; }
        else { setConfirmError(''); }
        return isValid;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        const success = await signup(email.trim(), password.trim());
        
        if (success) {
            setSignupSuccess(true); // Kích hoạt trạng thái thành công
            // Nếu không bật auto-redirect, hiển thị Alert như cũ
            if (!autoRedirect) {
                Alert.alert(
                    'Đăng ký thành công!',
                    'Vui lòng kiểm tra email để xác thực tài khoản.',
                    [{ text: 'OK', onPress: () => router.push('/(tabs)/login') }]
                );
            }
            // Reset form
            setEmail('');
            setPassword('');
            setConfirmPassword('');
        }
        // Nếu thất bại, `storeError` sẽ được hiển thị trên UI
    };

    // useEffect này chỉ xử lý việc đếm ngược KHI đăng ký thành công
    useEffect(() => {
        if (signupSuccess && autoRedirect) {
            timerRef.current = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        // Cleanup function
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [signupSuccess, autoRedirect]);

    // useEffect này xử lý việc chuyển trang KHI countdown kết thúc
    useEffect(() => {
        if (countdown <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            router.push('/(tabs)/login');
        }
    }, [countdown]);

    // Hàm tiện ích giúp xóa lỗi khi người dùng gõ
    const handleOnChangeText = (setter: Function, value: string) => {
        setter(value);
        if (storeError) setStoreError(null);
    }

    return (
        <Wrapper>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Foundation name='shopping-cart' size={40} color={AppColors.primary[500]} />
                        </View>
                        <Text style={styles.title}>Shopcart</Text>
                        <Text style={styles.subtitle}>Create a new account</Text>
                    </View>
                    <View style={styles.form}>
                        {storeError && <Text style={styles.errorText}>{storeError}</Text>}
                        <TextInputCustom
                            label='Email' value={email}
                            onChangeText={(text) => handleOnChangeText(setEmail, text)}
                            error={emailError}
                            placeholder='Enter your email' keyboardType='email-address' autoCapitalize='none'
                        />
                        <TextInputCustom
                            label='Password' value={password}
                            onChangeText={(text) => handleOnChangeText(setPassword, text)}
                            error={passwordError}
                            placeholder='Enter your password' secureTextEntry
                        />
                        <TextInputCustom
                            label='Confirm Password' value={confirmPassword}
                            onChangeText={(text) => handleOnChangeText(setConfirmPassword, text)}
                            error={confirmError}
                            placeholder='Confirm your password' secureTextEntry
                        />
                        <Button
                            title="Sign Up" fullWidth loading={isLoading}
                            style={styles.button} onPress={handleSignUp}
                        />
                        <View style={styles.autoRedirectRow}>
                            <Text style={styles.switchLabel}>Auto-redirect to login</Text>
                            <Switch value={autoRedirect} onValueChange={setAutoRedirect} />
                        </View>
                        {signupSuccess && autoRedirect && (
                            <Text style={styles.countdownText}>
                                {countdown > 0 ? `Redirecting in ${countdown}s...` : 'Redirecting...'}
                            </Text>
                        )}
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/login')}>
                            <Text style={styles.link}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Wrapper>
    );
};

export default signUpScreen;

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoContainer: {
        marginBottom: 12,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: AppColors.primary[50],
        alignItems: "center",
        justifyContent: "center",
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
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    errorText: {
        color: AppColors.error,
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    button: {
        marginTop: 16,
    },
    autoRedirectRow: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    switchLabel: {
        fontSize: 14,
        color: AppColors.text.secondary,
    },
    countdownText: {
        marginTop: 12,
        fontSize: 14,
        color: AppColors.primary[500],
        textAlign: 'center',
        fontWeight: '500',
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
});