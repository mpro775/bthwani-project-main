// src/components/triggerSOS.ts
import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * تطلب صلاحية الوصول للموقع ثم ترسل إحداثيات السائق كنداء طوارئ.
 */
export async function triggerSOS() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('لا يمكن الوصول للموقع', 'الرجاء منح التطبيق صلاحية الوصول للموقع');
      return;
    }

    const { coords } = await Location.getCurrentPositionAsync({});
    // مثال: إرسال بيانات SOS إلى endpoint خاص
    await fetch('https://your-backend.com/api/v1/driver/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp: new Date().toISOString(),
      }),
    });

    Alert.alert('تم إرسال نداء الطوارئ', 'سنقوم بالمتابعة فوراً');
  } catch (err) {
    console.error('SOS error:', err);
    Alert.alert('خطأ', 'فشل في إرسال نداء الطوارئ');
  }
}