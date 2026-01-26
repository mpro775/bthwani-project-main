import React, { useEffect } from 'react';
import { ActivityIndicator, AppRegistry, I18nManager, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/AppNavigator';
import useCairoFonts from './src/hooks/useCairoFonts';
import { UserProvider } from './src/hooks/userContext';

function App() {
  const fontsLoaded = useCairoFonts();

  useEffect(() => {
    // تفعيل الاتجاه من اليمين لليسار إذا لم يكن مفعلًا
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#FF9800" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
          <UserProvider>
      <AppNavigator />
    </UserProvider>
    </SafeAreaProvider>
  );}

AppRegistry.registerComponent('vendor-app', () => App);
export default App;
