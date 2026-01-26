import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/constants/colors';

interface SocketStatusIndicatorProps {
  isConnected: boolean;
  style?: any;
}

export const SocketStatusIndicator: React.FC<SocketStatusIndicatorProps> = ({
  isConnected,
  style
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name={isConnected ? "wifi" : "wifi-outline"}
        size={14}
        color={isConnected ? COLORS.success : COLORS.danger}
      />
      <Text style={[styles.text, { color: isConnected ? COLORS.success : COLORS.danger }]}>
        {isConnected ? 'متصل' : 'غير متصل'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Cairo-Regular',
  },
});

export default SocketStatusIndicator;
