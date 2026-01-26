import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../api/axiosInstance';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  let token: string | undefined;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('فشل الحصول على صلاحية الإشعارات');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);

    // إرسال التوكن للخادم بعد تسجيل الدخول
    await sendPushTokenToServer(token);
  } else {
    alert('يجب استخدام جهاز فعلي');
  }

  return token;
}

export async function sendPushTokenToServer(expoPushToken: string): Promise<void> {
  try {
    const vendorId = await AsyncStorage.getItem('vendorId');
    if (!vendorId) {
      console.warn('لا يوجد vendorId محفوظ، تأكد من تسجيل الدخول أولاً');
      return;
    }

    await axiosInstance.patch('/vendors/me', {
      vendorId,
      expoPushToken,
    });

    console.log('تم إرسال Expo Push Token بنجاح');
  } catch (error: any) {
    console.error('فشل في إرسال Push Token:', error?.response?.data?.message || error.message);
  }
}
