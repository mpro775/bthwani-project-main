import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  // Performance monitoring
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,

  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Filter out development errors in production
  beforeSend(event, hint) {
    // Filter out network errors that are not actual errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;
        if (message.includes('Network Error') || message.includes('Failed to fetch')) {
          return null;
        }
      }
    }
    return event;
  },

  // Enable debug mode in development
  debug: import.meta.env.MODE === 'development',
});

// Export for use in error boundary
export { Sentry };

// Error boundary component wrapper
export const SentryErrorBoundary = Sentry.ErrorBoundary;

// Sentry wrapper for React Router
export const SentryRoutes = Sentry.withSentryReactRouterV6Routing;
