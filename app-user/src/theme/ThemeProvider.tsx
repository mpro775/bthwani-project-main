// src/theme/ThemeProvider.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SystemUI from "expo-system-ui";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { darkTheme, lightTheme, Theme, ThemeChoice } from "./themes";

const STORAGE_KEY = "@theme-choice";

type ThemeContextValue = {
  theme: Theme;
  choice: ThemeChoice;
  isDark: boolean;
  setChoice: (next: ThemeChoice) => Promise<void>;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [choice, setChoiceState] = useState<ThemeChoice>("system");

  // احسب الثيم الفعلي بناءً على اختيار المستخدم والنظام
  const colorScheme: ColorSchemeName = useMemo(() => {
    if (choice === "system") return systemScheme ?? "light";
    return choice;
  }, [choice, systemScheme]);

  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const isDark = theme.name === "dark";

  // تحميل التفضيل من التخزين
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark" || saved === "system") {
        setChoiceState(saved);
      }
    })();
  }, []);

  // مزامنة خلفية النظام (لمنع فلاش أبيض)
  useEffect(() => {
    if (theme?.colors?.background) {
      SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
    }
  }, [theme?.colors?.background]);

  const setChoice = useCallback(async (next: ThemeChoice) => {
    setChoiceState(next);
    await AsyncStorage.setItem(STORAGE_KEY, next);
  }, []);

  const value = useMemo(
    () => ({ theme, choice, isDark, setChoice }),
    [theme, choice, isDark, setChoice]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
