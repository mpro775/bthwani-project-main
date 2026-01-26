// App.tsx
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/app/AppNavigator";

// ↓↓↓
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        {/* نفعّل الأمان السفلي فقط على مستوى الجذر */}
        <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
