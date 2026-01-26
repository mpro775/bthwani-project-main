import React from 'react';
import PostHog from 'posthog-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Feature flags configuration for React Native
export class FeatureFlags {
  private static initialized = false;
  private static posthog: PostHog | null = null;

  static init() {
    if (this.initialized) return;

    const apiKey = process.env.EXPO_PUBLIC_POSTHOG_KEY || 'phc_demo_key';
    const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    this.posthog = new PostHog(apiKey, {
      host,
      preloadFeatureFlags: true,
    });

    this.initialized = true;
  }

  static getInstance(): PostHog | null {
    if (!this.initialized) this.init();
    return this.posthog;
  }

  static async isEnabled(flag: string, userId?: string): Promise<boolean> {
    if (!this.posthog) this.init();

    try {
      const enabled = await this.posthog?.isFeatureEnabled(flag);
      return enabled || false;
    } catch (error) {
      console.warn(`Feature flag check failed for ${flag}:`, error);
      return false;
    }
  }

  static async getAllFlags(): Promise<Record<string, boolean>> {
    if (!this.posthog) this.init();

    try {
      const flags = await this.posthog?.getFeatureFlags();
      if (!flags) return {};
      
      // Convert FeatureFlagValue (string | boolean) to boolean
      const booleanFlags: Record<string, boolean> = {};
      for (const [key, value] of Object.entries(flags)) {
        booleanFlags[key] = typeof value === 'boolean' ? value : Boolean(value);
      }
      return booleanFlags;
    } catch (error) {
      console.warn('Failed to get feature flags:', error);
      return {};
    }
  }

  static async reloadFlags() {
    try {
      await this.posthog?.reloadFeatureFlags();
    } catch (error) {
      console.warn('Failed to reload feature flags:', error);
    }
  }

  // Fallback mechanism using AsyncStorage for offline scenarios
  static async getCachedFlag(flag: string): Promise<boolean | null> {
    try {
      const cached = await AsyncStorage.getItem(`@feature_flag_${flag}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn(`Failed to get cached flag ${flag}:`, error);
      return null;
    }
  }

  static async setCachedFlag(flag: string, enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(`@feature_flag_${flag}`, JSON.stringify(enabled));
    } catch (error) {
      console.warn(`Failed to cache flag ${flag}:`, error);
    }
  }

  // Smart flag check that falls back to cache if network fails
  static async isEnabledWithFallback(flag: string, userId?: string): Promise<boolean> {
    try {
      const isEnabled = await this.isEnabled(flag, userId);
      await this.setCachedFlag(flag, isEnabled);
      return isEnabled;
    } catch (error) {
      console.warn(`Network check failed for ${flag}, using cache:`, error);
      const cached = await this.getCachedFlag(flag);
      return cached !== null ? cached : false;
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

// Hook for React Native components
export const useFeatureFlag = (flag: FeatureFlagKey) => {
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkFlag = async () => {
      setLoading(true);
      try {
        const enabled = await FeatureFlags.isEnabledWithFallback(flag);
        setIsEnabled(enabled);
      } catch (error) {
        console.warn(`Failed to check flag ${flag}:`, error);
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    checkFlag();

    // Check for updates every 30 seconds
    const interval = setInterval(checkFlag, 30000);

    return () => clearInterval(interval);
  }, [flag]);

  return { isEnabled, loading };
};

// Hook for React Native components (legacy support)
export const useFeatureFlagLegacy = (flag: FeatureFlagKey) => {
  const [isEnabled, setIsEnabled] = React.useState(() => {
    // Initialize with cached value synchronously
    FeatureFlags.getCachedFlag(flag).then((value) => setIsEnabled(value ?? false));
    return false;
  });

  React.useEffect(() => {
    const checkFlag = async () => {
      const enabled = await FeatureFlags.isEnabledWithFallback(flag);
      setIsEnabled(enabled);
    };

    checkFlag();
    const interval = setInterval(checkFlag, 30000);

    return () => clearInterval(interval);
  }, [flag]);

  return isEnabled;
};

export default FeatureFlags;
