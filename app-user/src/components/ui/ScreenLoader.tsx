import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface ScreenLoaderProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const ScreenLoader: React.FC<ScreenLoaderProps> = ({
  message = 'جارٍ التحميل...',
  size = 'large',
  color = '#007AFF'
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ScreenLoader;
