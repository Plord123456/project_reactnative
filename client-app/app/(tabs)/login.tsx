import { KeyboardAvoidingView, StyleSheet, Text, View, Platform, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import AppColors from '@/constants/theme';
import Wrapper from '@/components/Wrapper';
import { Foundation } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth';
import TextInputCustom from '@/components/Textinput';
import Button from '@/components/Button';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const router = useRouter();
    // Lấy thêm hàm setError từ store
    const { login, isLoading, error, setError } = useAuthStore();

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
            // Hàm login trong store sẽ trả về true nếu thành công, false nếu thất bại
            const success = await login(email.trim(), password.trim());

            if (success) {
                console.log("Đăng nhập thành công!");
                router.replace('/(tabs)/profile'); // Dùng replace để người dùng không back lại trang login được
                setEmail('');
                setPassword('');
            }
            // Nếu thất bại, `error` state trong store sẽ tự động được set
            // và component sẽ hiển thị lỗi
        }
    };
    
    // Hàm này giúp xóa lỗi server ngay khi người dùng bắt đầu gõ lại
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
    // Style cho auto-redirect đã bị xóa vì tính năng này không phù hợp ở trang login
});