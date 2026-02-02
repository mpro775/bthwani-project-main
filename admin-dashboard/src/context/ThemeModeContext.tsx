import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { PaletteMode } from "@mui/material/styles";

const STORAGE_KEY = "admin-theme-mode";

type ThemeModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function getInitialMode(): PaletteMode {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return "light";
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const value: ThemeModeContextValue = { mode, toggleMode };

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  }
  return ctx;
}
