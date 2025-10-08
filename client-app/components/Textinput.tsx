import { KeyboardTypeOptions, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle, TextInput } from 'react-native'
import React from 'react'
import AppColors from '@/constants/theme'
interface TextInputProps {
  value: string;
  onChangeText?: (text: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: AppColors.text.primary,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.gray?.[300] ?? '#E4E4E7',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    color: AppColors.text.primary,
    backgroundColor: AppColors.background.secondary,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: AppColors.error,
  },
  errorText: {
    color: AppColors.error,
    fontSize: 14,
    marginTop: 4,
  },
});

const TextInputCustom: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  label,
  error,
  placeholder,
  secureTextEntry=false,
  keyboardType="default",
  autoCapitalize="sentences",
  autoCorrect=true,
  multiline=false,
  numberOfLines=1,
  style,
  labelStyle,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}
   
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={autoCorrect}
      multiline={multiline}
      numberOfLines={numberOfLines}
      style={[styles.input, inputStyle, 
        multiline && styles.multilineInput,
        error && styles.inputError
      ]}
    />
      {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
  )
}

export default TextInputCustom;