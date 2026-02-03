// src/theme.ts
import { createTheme, type PaletteMode } from "@mui/material/styles";
import { red, grey } from "@mui/material/colors";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import createCache from "@emotion/cache";
// استيراد الخط

// ألوان الهوية
export const COLORS = {
  primary: "#FF500D",
  blue: "#1A3052",
  orangeDark: "#F57C00",
  lightText: "#9E9E9E", // ✅ لون نص رمادي فاتح
  lightGray: "#F3F3F3", // ✅ لون خلفية رمادية ناعمة
  danger: "#D32F2F", // ✅ لون أحمر للخطر
  gray: "#9E9E9E", // ✅ لون رمادي محايد
  dark: "#212121", // ✅ لون نص داكن
  secondary: "#5D4037",
  background: "#FFFFFF",
  text: "#1A3052",
  accent: "#8B4B47",
  success: "#4CAF50",
  white: "#FFFFFF",
};

export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

export function createAppTheme(mode: PaletteMode) {
  const isDark = mode === "dark";
  return createTheme({
    direction: "rtl",
    palette: {
      mode,
      primary: {
        main: COLORS.primary,
        dark: COLORS.blue,
      },
      secondary: {
        main: COLORS.secondary,
      },
      error: {
        main: red.A400,
      },
      warning: {
        main: COLORS.accent,
      },
      info: {
        main: grey[500],
      },
      success: {
        main: COLORS.success,
      },
      background: {
        // دارك هادئ واحترافي (رمادي–أزرق) بدل الأسود القاسي
        default: isDark ? "#1e293b" : COLORS.background,
        paper: isDark ? "#334155" : COLORS.white,
      },
      text: {
        primary: isDark ? "#f1f5f9" : COLORS.text,
        secondary: isDark ? "rgba(241, 245, 249, 0.75)" : COLORS.lightText,
      },
    },
    typography: {
      fontFamily: `"Cairo", sans-serif`,
      h1: { fontFamily: `"Cairo", sans-serif` },
      h2: { fontFamily: `"Cairo", sans-serif` },
      h3: { fontFamily: `"Cairo", sans-serif` },
      h4: { fontFamily: `"Cairo", sans-serif` },
      h5: { fontFamily: `"Cairo", sans-serif` },
      h6: { fontFamily: `"Cairo", sans-serif` },
      button: { textTransform: "none" }, // لإلغاء تحويل الحروف الكبيرة
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {},
        },
      },
    },
  });
}

// للتوافق مع الاستيراد الافتراضي
export default createAppTheme("light");
