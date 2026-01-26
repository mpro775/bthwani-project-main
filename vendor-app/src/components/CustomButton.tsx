// src/components/CustomButton.tsx
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '../constants/colors';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const CustomButton = ({ title, onPress, loading, disabled, style, textStyle }: CustomButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[styles.button, style, isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessible={!isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={`اضغط لـ ${title}`}
    >
      {loading ? (
        <ActivityIndicator
          color={COLORS.white}
          accessible={false}
          importantForAccessibility="no"
        />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: 'Cairo-Bold',
  },
  disabled: {
    backgroundColor: '#A9A9A9',
    elevation: 0,
  },
});

export default CustomButton;