// src/main.tsx أو src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './utils/i18n';
import theme from './theme';
import { Analytics } from './lib/analytics';
import { FeatureFlags } from './lib/featureFlags';
import { SentryErrorBoundary } from './lib/sentry';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { HelmetProvider } from 'react-helmet-async';

import '@fontsource/cairo/400.css';
import '@fontsource/cairo/600.css';
import '@fontsource/cairo/700.css';
import '@fontsource/cairo/800.css';

const cacheRtl = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Initialize analytics and feature flags
Analytics.init();
FeatureFlags.init();

// Enable axe accessibility testing in development
if (import.meta.env.DEV) {
  // @ts-ignore - @axe-core/react is optional and may not be installed
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000);
  }).catch(() => {
    // Ignore if @axe-core/react is not installed
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary
      fallback={({ error, resetError }) => {
        const errorMessage = error instanceof Error ? error.message : error != null ? String(error) : 'خطأ غير معروف';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        return (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1>حدث خطأ غير متوقع</h1>
            <p>نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.</p>
            {import.meta.env.DEV && (error != null) ? (
              <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>تفاصيل الخطأ (للمطورين)</summary>
                <pre style={{
                  backgroundColor: '#f0f0f0',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  marginTop: '10px'
                }}>
                  {errorMessage}
                  {errorStack ? `\n\n${errorStack}` : ''}
                </pre>
              </details>
            ) : null}
            <button
              onClick={resetError}
              style={{
                padding: '10px 20px',
                backgroundColor: '#FF500D',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        );
      }}
    >
      <HelmetProvider>
        <CacheProvider value={cacheRtl}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </CacheProvider>
      </HelmetProvider>
    </SentryErrorBoundary>
  </React.StrictMode>
);
