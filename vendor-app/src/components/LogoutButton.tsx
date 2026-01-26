import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../hooks/userContext'; // غيّر المسار حسب ملفك
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';

const LogoutButton = () => {
  const { setUser } = useUser();
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'تأكيد',
      'هل تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            setUser(null);
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            );
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleLogout}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="تسجيل الخروج"
      accessibilityHint="يخرج من التطبيق ويعيد توجيهك إلى صفحة تسجيل الدخول"
    >
      <Text style={styles.text}>تسجيل الخروج</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F44336',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  text: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
    fontFamily: 'Cairo-Bold',
  },
});

export default LogoutButton;
