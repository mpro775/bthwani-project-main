// src/theme/themes.ts
// ----------------------------------
export type Theme = {
  name: "light" | "dark";
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    border: string;
    card: string;
  };
  spacing: (n: number) => number;
  radius: number;
};

export const lightTheme: Theme = {
  name: "light",
  colors: {
    background: "#FFFFFF",
    surface: "#F7F7F9",
    text: "#111827",
    muted: "#6B7280",
    primary: "#2563EB",
    border: "#E5E7EB",
    card: "#FFFFFF",
  },
  spacing: (n) => n * 8,
  radius: 14,
};

export const darkTheme: Theme = {
  name: "dark",
  colors: {
    background: "#0B1220",
    surface: "#111827",
    text: "#F9FAFB",
    muted: "#9CA3AF",
    primary: "#60A5FA",
    border: "#1F2937",
    card: "#0F172A",
  },
  spacing: (n) => n * 8,
  radius: 14,
};

export type ThemeChoice = "system" | "light" | "dark";
