import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  onPress,
  size = 'medium'
}) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24
  };

  const badgeSize = {
    small: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
    medium: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 3 },
    large: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 4 }
  };

  if (count === 0) {
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="notifications-outline"
          size={iconSize[size]}
          color={COLORS.gray}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons
        name="notifications"
        size={iconSize[size]}
        color={COLORS.primary}
      />
      <View style={[styles.badge, badgeSize[size]]}>
        <Text style={[styles.badgeText, { fontSize: badgeSize[size].fontSize }]}>
          {displayCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
  },
});

export default NotificationBadge;
