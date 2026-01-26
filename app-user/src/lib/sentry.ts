// Lazy load Sentry to avoid tslib __extends issue during module initialization
let Sentry: any = null;
let SentryLoaded = false;

function loadSentry() {
  if (SentryLoaded) return Sentry;
  try {
    // Ensure tslib is available before loading sentry-expo
    if (typeof require !== 'undefined') {
      require('tslib');
    }
    Sentry = require('sentry-expo');
    SentryLoaded = true;
  } catch (error) {
    console.warn('Failed to load sentry-expo:', error);
    return null;
  }
  return Sentry;
}

import Constants from 'expo-constants';

// Sentry configuration for React Native/Expo
export class SentryConfig {
  static init() {
    try {
      // Lazy load Sentry
      const SentryModule = loadSentry();
      if (!SentryModule) {
        console.warn('Sentry module not available, skipping initialization');
        return;
      }

      // Check if DSN is available before initializing
      const dsn = Constants.expoConfig?.extra?.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN;
      
      if (!dsn) {
        console.warn('Sentry DSN not configured, skipping Sentry initialization');
        return;
      }

      SentryModule.init({
        dsn,
        environment: __DEV__ ? 'development' : 'production',
        enableInExpoDevelopment: true,
        debug: __DEV__,
        tracesSampleRate: __DEV__ ? 1.0 : 0.1,

        // Release tracking
        release: Constants.expoConfig?.version || '1.0.0',
        dist: `${Constants.expoConfig?.android?.package}-${Constants.expoConfig?.ios?.bundleIdentifier}`,

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

        // Set tags for better error categorization
        initialScope: {
          tags: {
            platform: 'mobile',
            framework: 'expo',
          },
        },
      });
    } catch (error) {
      // Silently fail if Sentry initialization fails (e.g., tslib __extends issue)
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  static captureException(error: Error, context?: Record<string, any>) {
    const SentryModule = loadSentry();
    if (!SentryModule) return;
    SentryModule.Native.captureException(error, {
      contexts: {
        ...context,
        page: context?.screen || 'unknown',
        step: context?.step || 'unknown',
        payload_hash: context?.payload_hash || 'unknown',
      },
    });
  }

  static captureMessage(message: string, level: 'debug' | 'info' | 'warning' | 'error' | 'fatal' = 'info', context?: Record<string, any>) {
    const SentryModule = loadSentry();
    if (!SentryModule) return;
    SentryModule.Native.captureMessage(message, {
      level,
      contexts: context,
    });
  }

  static setUser(userId: string, userProperties?: Record<string, any>) {
    const SentryModule = loadSentry();
    if (!SentryModule) return;
    SentryModule.Native.setUser({
      id: userId,
      ...userProperties,
    });
  }

  static setTag(key: string, value: string) {
    const SentryModule = loadSentry();
    if (!SentryModule) return;
    SentryModule.Native.setTag(key, value);
  }

  static setContext(key: string, context: Record<string, any>) {
    const SentryModule = loadSentry();
    if (!SentryModule) return;
    SentryModule.Native.setContext(key, context);
  }

  static addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'debug' | 'info' | 'warning' | 'error' | 'fatal';
    data?: Record<string, any>;
  }) {
    const SentryModule = loadSentry();
    if (!SentryModule) return;
    SentryModule.Native.addBreadcrumb(breadcrumb);
  }
}

// Hook for React Native components
export const useSentry = () => {
  return {
    captureException: SentryConfig.captureException,
    captureMessage: SentryConfig.captureMessage,
    setUser: SentryConfig.setUser,
    setTag: SentryConfig.setTag,
    setContext: SentryConfig.setContext,
    addBreadcrumb: SentryConfig.addBreadcrumb,
  };
};

export default SentryConfig;
