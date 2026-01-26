import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function useCairoFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Cairo-Regular': require('../../assets/fonts/cairo_regular.ttf'),
        'Cairo-Bold': require('../../assets/fonts/cairo_bold.ttf'),
        'Cairo-SemiBold': require('../../assets/fonts/cairo_semibold.ttf'),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  return fontsLoaded;
}
