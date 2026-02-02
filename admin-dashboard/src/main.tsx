import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { createAppTheme, cacheRtl } from "./theme";
import { ThemeModeProvider, useThemeMode } from "./context/ThemeModeContext";
import "./App.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";

function AppWithTheme() {
  const { mode } = useThemeMode();
  const theme = useMemo(() => createAppTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "html, body, #root": { height: "100%" },
          body: { fontFamily: '"Cairo", sans-serif' },
        }}
      />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function Root() {
  return (
    <ThemeModeProvider>
      <AppWithTheme />
    </ThemeModeProvider>
  );
}

const bootstrap = async () => {
  try {
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <HelmetProvider>
          <CacheProvider value={cacheRtl}>
            <Root />
          </CacheProvider>
        </HelmetProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error("❌ Bootstrap error:", error);
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <HelmetProvider>
          <CacheProvider value={cacheRtl}>
            <Root />
          </CacheProvider>
        </HelmetProvider>
      </React.StrictMode>
    );
  }
};

bootstrap();
