import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Web-specific storage utilities with better offline support
export class WebStorage {
  private static instance: WebStorage;
  private cache: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  static getInstance(): WebStorage {
    if (!WebStorage.instance) {
      WebStorage.instance = new WebStorage();
    }
    return WebStorage.instance;
  }

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      // Check memory cache first
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      try {
        // Try localStorage first
        const value = localStorage.getItem(key);
        if (value !== null) {
          this.cache.set(key, value);
          return value;
        }
      } catch (error) {
        console.warn("localStorage not available:", error);
      }

      // Fallback to AsyncStorage for web
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          this.cache.set(key, value);
          return value;
        }
      } catch (error) {
        console.warn("AsyncStorage not available:", error);
      }

      return null;
    }

    // Native platforms use AsyncStorage directly
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        // Try localStorage first
        localStorage.setItem(key, value);
        this.cache.set(key, value);
        this.notifyListeners(key, value);
        return;
      } catch (error) {
        console.warn("localStorage not available:", error);
      }

      // Fallback to AsyncStorage for web
      try {
        await AsyncStorage.setItem(key, value);
        this.cache.set(key, value);
        this.notifyListeners(key, value);
        return;
      } catch (error) {
        console.warn("AsyncStorage not available:", error);
      }

      throw new Error("No storage available");
    }

    // Native platforms use AsyncStorage directly
    await AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
        this.cache.delete(key);
        this.notifyListeners(key, null);
        return;
      } catch (error) {
        console.warn("localStorage not available:", error);
      }

      try {
        await AsyncStorage.removeItem(key);
        this.cache.delete(key);
        this.notifyListeners(key, null);
        return;
      } catch (error) {
        console.warn("AsyncStorage not available:", error);
      }

      throw new Error("No storage available");
    }

    await AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (Platform.OS === "web") {
      try {
        localStorage.clear();
        this.cache.clear();
        this.listeners.clear();
        return;
      } catch (error) {
        console.warn("localStorage not available:", error);
      }

      try {
        await AsyncStorage.clear();
        this.cache.clear();
        this.listeners.clear();
        return;
      } catch (error) {
        console.warn("AsyncStorage not available:", error);
      }

      throw new Error("No storage available");
    }

    await AsyncStorage.clear();
  }

  private notifyListeners(key: string, value: any): void {
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach((listener) => listener(value));
    }
  }

  addListener(key: string, listener: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  // Web-specific method to check if storage is available
  async isStorageAvailable(): Promise<boolean> {
    if (Platform.OS === "web") {
      try {
        const testKey = "__storage_test__";
        localStorage.setItem(testKey, "test");
        localStorage.removeItem(testKey);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }
}

// Export singleton instance
export const webStorage = WebStorage.getInstance();

// Enhanced storage hook for React components
export const useWebStorage = () => {
  return {
    getItem: webStorage.getItem.bind(webStorage),
    setItem: webStorage.setItem.bind(webStorage),
    removeItem: webStorage.removeItem.bind(webStorage),
    clear: webStorage.clear.bind(webStorage),
    addListener: webStorage.addListener.bind(webStorage),
    isStorageAvailable: webStorage.isStorageAvailable.bind(webStorage),
  };
};
