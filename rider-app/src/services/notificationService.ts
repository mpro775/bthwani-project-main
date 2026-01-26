import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// تسجيل الجهاز واسترجاع Token
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("فشل في الحصول على صلاحية الإشعارات!");
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } else {
    alert("يجب استخدام جهاز فعلي للتنبيهات");
    return null;
  }
};

// إعداد السلوك على وصول الإشعارات
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowInForeground: true,
    shouldShowList: true,
    shouldShowBanner: true, // ✅ تم إضافته لحل الخطأ
  }),
});