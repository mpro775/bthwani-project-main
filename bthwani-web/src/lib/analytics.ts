import posthog from 'posthog-js';

// Analytics configuration and event tracking utilities
export class Analytics {
  private static initialized = false;

  static init() {
    if (this.initialized) return;

    posthog.init(import.meta.env.VITE_POSTHOG_KEY || 'phc_demo_key', {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      loaded: (_) => {
        console.log('PostHog loaded successfully');
      }
    });

    this.initialized = true;
  }

  static identify(userId: string, userProperties?: Record<string, any>) {
    if (!this.initialized) this.init();

    posthog.identify(userId, userProperties);
  }

  static reset() {
    posthog.reset();
  }

  static capture(eventName: string, properties?: Record<string, any>) {
    if (!this.initialized) this.init();

    const eventData = {
      platform: 'web',
      env: import.meta.env.MODE || 'development',
      timestamp: new Date().toISOString(),
      ...properties
    };

    posthog.capture(eventName, eventData);
  }

  static trackPageView(page: string) {
    this.capture('PageViewed', {
      screen: page,
      url: window.location.href
    });
  }

  static group(groupType: string, groupKey: string, groupProperties?: Record<string, any>) {
    posthog.group(groupType, groupKey, groupProperties);
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
  PageViewed: 'PageViewed',
  ButtonClicked: 'ButtonClicked',
  FormSubmitted: 'FormSubmitted',

  // Error events
  ErrorOccurred: 'ErrorOccurred'
} as const;

export type AnalyticsEvent = keyof typeof AnalyticsEvents;

// Hook for React components
export const useAnalytics = () => {
  return {
    track: Analytics.capture,
    identify: Analytics.identify,
    reset: Analytics.reset,
    trackPageView: Analytics.trackPageView
  };
};

export default Analytics;
