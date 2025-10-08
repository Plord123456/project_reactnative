import { KeyboardAvoidingView, StyleSheet, Text, View, ScrollView, Platform } from 'react-native'
import React from 'react'
import Wrapper from '@/components/Wrapper'
import Foundation from '@expo/vector-icons/Foundation'
import AppColors from '@/constants/theme'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store/auth'
import TextInputCustom from '@/components/Textinput'
import Button from '@/components/Button'
const signUpScreen = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [confirmPasswordError, setConfirmPasswordError] = React.useState('');
  const router = useRouter();
  const { isLoading, error,signup } = useAuthStore();
  const validateForm = () => {
  let isValid = true;
  //Email validation
  if (!email.trim()) {
    setEmailError('Email is required');
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    setEmailError('Email address is invalid');
    isValid = false;
  }else {
    setEmailError('');
  }
  //Password validation
  if( !password) {  
    setPasswordError('Password is required');
    isValid = false;
  } else if (password.length < 6) {
    setPasswordError('Password must be at least 6 characters');
    isValid = false;
  } else {
    setPasswordError('');
  }
  //Confirm password validation
  if( password !== confirmPassword) {  
    setConfirmPasswordError('Passwords do not match');
    isValid = false;
  } else {
    setConfirmPasswordError('');
  }
  return isValid;
};
const handleSignUp = async () => {
if (!validateForm()) {
  return;
}
  
}

  return (
    <Wrapper>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Foundation
              name='shopping-cart'
              size={40}
              color={AppColors.primary[500]}/>
            </View>
            <Text style={styles.title}>
              Shopcart
            </Text>
            <Text style={styles.subtitle}>
             Create a new account
            </Text>
            <View style={styles.form}>
              {(error || errorMessage) && <Text style={styles.errorText}>{error || errorMessage}</Text>}
            <TextInputCustom
              label='Email'
              value={email}
              onChangeText={setEmail}
              placeholder='Enter your email'
              keyboardType='email-address'
              autoCapitalize='none'
              autoCorrect={false}
              error={emailError}
            />
             <TextInputCustom label='Password'
              value={password}
              onChangeText={setPassword}
              placeholder='Enter your password'
              autoCorrect={false}
              error={passwordError}
              secureTextEntry
            />
             <TextInputCustom label='Confirm Password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder='Confirm your password'
              autoCorrect={false}
              error={confirmPasswordError}
              secureTextEntry
            />
            <Button
              title="Sign Up"
              fullWidth
              loading={isLoading}
              style={styles.button}
              onPress={() => {
                handleSignUp();
              }}
            />
          </View>
          </View>
          
        </ScrollView>
        </KeyboardAvoidingView>
    </Wrapper>
  )
}

export default signUpScreen

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.primary[500],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.primary[400],
    marginBottom: 4,
    textAlign: 'center',
  },
  errorText: {
    color: AppColors.error,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
  },
  form: {
    width: '100%',
    marginTop: 16,
  },
})