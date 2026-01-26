// src/context/ThemeContext.tsx
import COLORS from "@/constants/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export type AppTheme = {
  modeResolved: "light" | "dark"; // الناتج الفعلي بعد احتساب system
  colors: {
    primary: string;
    background: string;
    text: string;
    card: string;
    border: string;
    muted: string;
  };
};

const STORAGE_KEY = "theme-mode:v1";

const lightTheme: AppTheme = {
  modeResolved: "light",
  colors: {
    primary: COLORS.primary,
    background: COLORS.background,
    text: COLORS.text,
    card: COLORS.lightGray,
    border: "#E5E7EB",
    muted: COLORS.gray,
  },
};

const darkTheme: AppTheme = {
  modeResolved: "dark",
  colors: {
    primary: COLORS.primary,
    background: "#0B1220",
    text: "#FFFFFF",
    card: "#0F172A",
    border: "#1F2937",
    muted: COLORS.lightText,
  },
};

type Ctx = {
  theme: AppTheme; // الثيم الفعلي المستخدم الآن
  choice: ThemeMode; // تفضيل المستخدم (light/dark/system)
  setChoice: (m: ThemeMode) => Promise<void>;
};

const ThemeCtx = createContext<Ctx | undefined>(undefined);

export function useAppTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx)
    throw new Error("useAppTheme must be used within <AppThemeProvider>");
  return ctx;
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null
  const [choice, setChoiceState] = useState<ThemeMode>("system");

  // حساب الثيم الفعلي
  const modeResolved = useMemo(() => {
    if (choice === "system") return systemScheme ?? "light";
    return choice;
  }, [choice, systemScheme]);

  const theme = useMemo(() => {
    const resolved = modeResolved === "dark" ? darkTheme : lightTheme;
    // التأكد من أن theme.colors موجود
    if (!resolved?.colors) {
      console.warn("Theme colors not available, using default");
      return lightTheme;
    }
    return resolved;
  }, [modeResolved]);

  // تحميل التفضيل المحفوظ
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setChoiceState(saved);
        }
      } catch (error) {
        console.warn("Failed to load theme preference:", error);
      }
    })();
  }, []);

  // دالة تحديث الاختيار مع الحفظ
  const setChoice = useCallback(async (newChoice: ThemeMode) => {
    setChoiceState(newChoice);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newChoice);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  }, []);

  const value = useMemo(
    () => ({ theme, choice, setChoice }),
    [theme, choice, setChoice]
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
