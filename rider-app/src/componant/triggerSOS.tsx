import axios from "axios";
import * as Location from "expo-location";

export const triggerSOS = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("صلاحية الموقع مطلوبة!");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    await axios.post("/rides/sos", {
      reason: "حالة طارئة أثناء الرحلة",
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    });

    alert("🚨 تم إرسال نداء الطوارئ");
  } catch {
    alert("❌ فشل في إرسال نداء الطوارئ");
  }
};
