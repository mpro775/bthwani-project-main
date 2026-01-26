import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

export interface ServiceCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  description,
  icon,
  color,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        disabled && styles.disabledCard,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: `${color}15` },
          disabled && styles.disabledIconContainer,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={32}
          color={disabled ? COLORS.gray : color}
        />
      </View>
      <Text
        style={[styles.name, disabled && styles.disabledText]}
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text
        style={[styles.description, disabled && styles.disabledText]}
        numberOfLines={2}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  disabledCard: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  disabledIconContainer: {
    backgroundColor: COLORS.lightGray,
  },
  name: {
    fontSize: 16,
    fontFamily: 'Cairo-Bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 16,
  },
  disabledText: {
    color: COLORS.gray,
  },
});

export default ServiceCard;
