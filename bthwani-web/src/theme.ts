// src/theme.ts
import { createTheme } from "@mui/material/styles";
import { arEG } from "@mui/material/locale";

const theme = createTheme(
  {
    direction: "rtl",
    typography: {
      fontFamily: [
        "Cairo",
        "system-ui",
        "-apple-system",
        "Segoe UI",
        "Roboto",
        "Arial",
        "sans-serif",
      ].join(","),
      h1: { fontWeight: 800 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 700, textTransform: "none" },
    },
    palette: {
      mode: "light",
      primary: { main: "#ff500d", dark: "#0a2f5c", light: "#64B5F6" },
      secondary: { main: "#00BCD4" },
      background: { default: "#F7F8FA", paper: "#FFFFFF" },
    },
    shape: { borderRadius: 12 },
  },
  arEG
);

export default theme;
