import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function DriverLayout() {
  const { driver } = useAuth();

  if (!driver) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
