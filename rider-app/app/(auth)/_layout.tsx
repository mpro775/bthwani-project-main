import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthLayout() {
  const { driver } = useAuth();

  if (driver) return <Redirect href="/(driver)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
