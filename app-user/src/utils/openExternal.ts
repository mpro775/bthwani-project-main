import { Alert, Linking } from "react-native";

export async function openExternal(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error("Unsupported URL");
    await Linking.openURL(url);
  } catch {
    Alert.alert("تعذر فتح الرابط", `انسخ الرابط وافتحه يدويًا:\n${url}`);
  }
}
