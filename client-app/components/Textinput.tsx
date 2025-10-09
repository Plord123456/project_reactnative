import {
    KeyboardTypeOptions,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
    TextInput as RNTextInput,
    TouchableOpacity,
    TextInputProps
} from 'react-native';
import React, { useState, forwardRef } from 'react';
import AppColors from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface CustomTextInputProps {
    value?: string; // Đã sửa: Cho phép không cần truyền value
    onChangeText?: (text: string) => void;
    onFocus?: TextInputProps['onFocus'];
    onBlur?: TextInputProps['onBlur'];
    label?: string;
    error?: string;
    placeholder?: string;
    placeholderTextColor?: TextInputProps['placeholderTextColor']; // Đã thêm
    secureTextEntry?: boolean;
    keyboardType?: KeyboardTypeOptions;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    autoCorrect?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    inputStyle?: StyleProp<TextStyle>;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const CustomTextInput = forwardRef<RNTextInput, CustomTextInputProps>(
    (
        {
            value,
            onChangeText,
            onFocus,
            onBlur,
            label,
            error,
            placeholder,
            placeholderTextColor, // Destructure prop mới
            secureTextEntry = false,
            keyboardType = 'default',
            autoCapitalize = 'none',
            autoCorrect = false,
            multiline = false,
            style,
            labelStyle,
            inputStyle,
            leftIcon,
            rightIcon,
            ...rest
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [isPasswordVisible, setIsPasswordVisible] = useState(false);

        const handleFocus: TextInputProps['onFocus'] = (e) => {
            setIsFocused(true);
            if (onFocus) {
                onFocus(e);
            }
        };

        const handleBlur: TextInputProps['onBlur'] = (e) => {
            setIsFocused(false);
            if (onBlur) {
                onBlur(e);
            }
        };

        const togglePasswordVisibility = () => {
            setIsPasswordVisible(prevState => !prevState);
        };

        const borderColor = error
            ? AppColors.error
            : isFocused
            ? AppColors.primary[500]
            : AppColors.gray?.[300] ?? '#E4E4E7';

        return (
            <View style={[styles.container, style]}>
                {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
                
                <View style={[styles.inputContainer, { borderColor }]}>
                    {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

                    <RNTextInput
                        ref={ref}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={placeholder}
                        placeholderTextColor={placeholderTextColor} // Truyền prop vào đây
                        secureTextEntry={secureTextEntry && !isPasswordVisible}
                        keyboardType={keyboardType}
                        autoCapitalize={autoCapitalize}
                        autoCorrect={autoCorrect}
                        multiline={multiline}
                        style={[styles.input, inputStyle, multiline && styles.multilineInput]}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        {...rest}
                    />

                    {secureTextEntry ? (
                        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
                            <MaterialCommunityIcons
                                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                                size={22}
                                color={AppColors.gray?.[500]}
                            />
                        </TouchableOpacity>
                    ) : (
                        rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>
                    )}
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        );
    }
);

// CSS không thay đổi
const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: AppColors.text.secondary,
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: AppColors.background.secondary,
        height: 50,
    },
    input: {
        flex: 1,
        paddingHorizontal: 12,
        fontSize: 16,
        color: AppColors.text.primary,
        // height: '100%',
        paddingVertical: 0,
    },
    multilineInput: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 12,
    },
    errorText: {
        color: AppColors.error,
        fontSize: 12,
        marginTop: 6,
    },
    iconContainer: {
        paddingHorizontal: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CustomTextInput;