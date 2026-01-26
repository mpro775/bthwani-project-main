import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ⬅️ استيراد ضروري
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import theme, { cacheRtl } from "./theme";
import "./App.css";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/700.css";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";

// Firebase
import "./config/firebaseConfig";


// Bootstrap function to ensure auth state is ready before rendering
const bootstrap = async () => {
  try {

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <HelmetProvider>
          <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <GlobalStyles styles={{
                'html, body, #root': { height: '100%' },
                body: { fontFamily: '"Cairo", sans-serif' },
              }} />
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </CacheProvider>
        </HelmetProvider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('❌ Bootstrap error:', error);
    // Fallback render without waiting for auth
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <HelmetProvider>
          <CacheProvider value={cacheRtl}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <GlobalStyles styles={{
                'html, body, #root': { height: '100%' },
                body: { fontFamily: '"Cairo", sans-serif' },
              }} />
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </ThemeProvider>
          </CacheProvider>
        </HelmetProvider>
      </React.StrictMode>
    );
  }
};

// Start bootstrap
bootstrap();
