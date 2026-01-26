import PostHog from 'posthog-react-native';
import { Platform } from 'react-native';

// Analytics configuration and event tracking utilities for React Native
export class Analytics {
  private static initialized = false;
  private static posthog: PostHog | null = null;

  static init() {
    if (this.initialized) return;

    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || 'phc_demo_key';
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    this.posthog = new PostHog(apiKey, {
      host,
      captureAppLifecycleEvents: true,
    });

    this.initialized = true;
  }

  static getInstance(): PostHog | null {
    if (!this.initialized) this.init();
    return this.posthog;
  }

  static identify(userId: string, userProperties?: Record<string, any>) {
    if (!this.posthog) this.init();

    this.posthog?.identify(userId, userProperties);
  }

  static reset() {
    this.posthog?.reset();
  }

  static capture(eventName: string, properties?: Record<string, any>) {
    if (!this.posthog) this.init();

    const eventData = {
      platform: Platform.OS,
      env: __DEV__ ? 'development' : 'production',
      timestamp: new Date().toISOString(),
      ...properties
    };

    this.posthog?.capture(eventName, eventData);
  }

  static trackScreen(screenName: string) {
    this.capture('ScreenViewed', {
      screen: screenName,
      platform: Platform.OS
    });
  }

  static group(groupType: string, groupKey: string, groupProperties?: Record<string, any>) {
    this.posthog?.group(groupType, groupKey, groupProperties);
  }

  static setUserProperties(properties: Record<string, any>) {
    // PostHog uses identify with properties to set user properties
    // Note: This requires a userId to be set first via identify()
    if (this.posthog && (this.posthog as any).setPersonProperties) {
      (this.posthog as any).setPersonProperties(properties);
    } else {
      // Fallback: properties will be set on next identify call
      console.warn('setUserProperties: Call identify() first with a userId');
    }
  }
}

// Event taxonomy constants
export const AnalyticsEvents = {
  // User actions
  ItemViewed: 'ItemViewed',
  ItemAddedToCart: 'ItemAddedToCart',
  CheckoutStarted: 'CheckoutStarted',
  PaymentSucceeded: 'PaymentSucceeded',
  PaymentFailed: 'PaymentFailed',
  RefundRequested: 'RefundRequested',
  RefundProcessed: 'RefundProcessed',

  // Entity actions
  EntityCreated: 'EntityCreated',
  EntityUpdated: 'EntityUpdated',
  EntityDeleted: 'EntityDeleted',

  // Navigation
  ScreenViewed: 'ScreenViewed',
  ButtonPressed: 'ButtonPressed',
  FormSubmitted: 'FormSubmitted',

  // Error events
  ErrorOccurred: 'ErrorOccurred'
} as const;

export type AnalyticsEvent = keyof typeof AnalyticsEvents;

// Hook for React Native components
export const useAnalytics = () => {
  return {
    track: Analytics.capture,
    identify: Analytics.identify,
    reset: Analytics.reset,
    trackScreen: Analytics.trackScreen,
    setUserProperties: Analytics.setUserProperties
  };
};

export default Analytics;
