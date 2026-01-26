// src/components/CustomInput.tsx
import React from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps } from 'react-native';
import { COLORS } from '../constants/colors';

// يمكن إضافة أي props أخرى تحتاجها من TextInput
interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  // يمكنك استخدام مكتبة مثل react-native-vector-icons لإضافة أيقونات
  // icon?: React.ReactNode; 
}

const CustomInput = ({ label, error, ...props }: CustomInputProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : null]} accessible={false} importantForAccessibility="no">
        {/* View للأيقونة إذا أردت إضافتها لاحقًا */}
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={`أدخل ${label}`}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.text,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.error,
  },
});

export default CustomInput;