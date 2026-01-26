import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from '../AppNavigator';
type StartupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StartupScreen'>;

type Props = {
  navigation: StartupScreenNavigationProp;
  // ... other props
};
function StartupScreen({ navigation }: Props) {

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // (اختياري: تحقق من صلاحية التوكن بالـ backend)
        navigation.replace('Vendor'); // انتقل مباشرة للشاشة الرئيسية
      } else {
        navigation.replace('Login'); // انتقل لشاشة تسجيل الدخول
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#1E88E5" />
    </View>
  );
};

export default StartupScreen;
