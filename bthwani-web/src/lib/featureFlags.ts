import React from 'react';
import posthog from 'posthog-js';

// Feature flags configuration
export class FeatureFlags {
  private static initialized = false;

  static init() {
    if (this.initialized) return;
    // PostHog is already initialized in analytics.ts
    this.initialized = true;
  }

  static isEnabled(flag: string): boolean {
    if (!this.initialized) this.init();

    try {
      return posthog.isFeatureEnabled(flag) || false;
    } catch (error) {
      console.warn(`Feature flag check failed for ${flag}:`, error);
      return false;
    }
  }

  static async getAllFlags(): Promise<Record<string, boolean>> {
    if (!this.initialized) this.init();

    try {
      // PostHog doesn't have a getAllFlags method, return empty object for now
      return {};
    } catch (error) {
      console.warn('Failed to get feature flags:', error);
      return {};
    }
  }

  static async reloadFlags() {
    try {
      await posthog.reloadFeatureFlags();
    } catch (error) {
      console.warn('Failed to reload feature flags:', error);
    }
  }
}

// Feature flag constants
export const FeatureFlagKeys = {
  newCheckout: 'newCheckout',
  promoBanner: 'promoBanner',
  killPayments: 'killPayments',
  advancedSearch: 'advancedSearch',
  darkMode: 'darkMode',
  notifications: 'notifications',
  analytics: 'analytics',
  exportData: 'exportData'
} as const;

export type FeatureFlagKey = keyof typeof FeatureFlagKeys;

// Hook for React components
export const useFeatureFlag = (flag: FeatureFlagKey) => {
  const [isEnabled, setIsEnabled] = React.useState(() => FeatureFlags.isEnabled(flag));

  React.useEffect(() => {
    const checkFlag = () => {
      const enabled = FeatureFlags.isEnabled(flag);
      setIsEnabled(enabled);
    };

    checkFlag();
    const interval = setInterval(checkFlag, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [flag]);

  return isEnabled;
};

// Higher-order component for feature flags
export const withFeatureFlag = <P extends object>(
  Component: React.ComponentType<P>,
  flag: FeatureFlagKey,
  FallbackComponent?: React.ComponentType<P>
) => {
  return (props: P) => {
    const isEnabled = useFeatureFlag(flag);

    if (!isEnabled && FallbackComponent) {
      return React.createElement(FallbackComponent, props);
    }

    return isEnabled ? React.createElement(Component, props) : null;
  };
};

export default FeatureFlags;
