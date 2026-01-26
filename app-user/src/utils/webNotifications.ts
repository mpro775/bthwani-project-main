import { Platform } from "react-native";

export interface WebNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  silent?: boolean;
  renotify?: boolean;
  requireInteraction?: boolean;
}

export class WebNotifications {
  private static instance: WebNotifications;
  private permission: NotificationPermission = "default";
  private listeners: Map<string, (notification: Notification) => void> =
    new Map();

  static getInstance(): WebNotifications {
    if (!WebNotifications.instance) {
      WebNotifications.instance = new WebNotifications();
    }
    return WebNotifications.instance;
  }

  constructor() {
    if (Platform.OS === "web" && "Notification" in window) {
      this.permission = Notification.permission;
      this.setupEventListeners();
    }
  }

  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    // Listen for notification clicks
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event.data?.type === "notification-click") {
        const { action, tag } = event.data;
        this.handleNotificationClick(tag, action);
      }
    });
  }

  private handleNotificationClick(tag: string, action: string): void {
    const listener = this.listeners.get(tag);
    if (listener) {
      // Create a mock notification object for the callback
      const mockNotification = {
        tag,
        action,
        close: () => {},
      } as Notification;
      listener(mockNotification);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (Platform.OS !== "web" || !("Notification" in window)) {
      return "denied";
    }

    if (this.permission === "granted") {
      return this.permission;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission;
    } catch (error) {
      console.warn("Error requesting notification permission:", error);
      return "denied";
    }
  }

  async show(options: WebNotificationOptions): Promise<string | null> {
    if (Platform.OS !== "web" || !("Notification" in window)) {
      console.warn("Notifications not supported on this platform");
      return null;
    }

    if (this.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        console.warn("Notification permission denied");
        return null;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icon-192x192.png",
        badge: options.badge,
        tag: options.tag,
        data: options.data,
        silent: options.silent,
        renotify: options.renotify,
        requireInteraction: options.requireInteraction,
        actions: options.actions,
      });

      // Handle notification events
      notification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(options.tag || "default", "click");
        notification.close();
      };

      notification.onclose = () => {
        this.handleNotificationClick(options.tag || "default", "close");
      };

      // Auto-close after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return options.tag || "default";
    } catch (error) {
      console.warn("Error showing notification:", error);
      return null;
    }
  }

  addListener(
    tag: string,
    listener: (notification: Notification) => void
  ): () => void {
    this.listeners.set(tag, listener);

    return () => {
      this.listeners.delete(tag);
    };
  }

  isSupported(): boolean {
    return Platform.OS === "web" && "Notification" in window;
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  // Utility method to check if notifications are enabled
  async areNotificationsEnabled(): Promise<boolean> {
    if (!this.isSupported()) return false;

    const permission = await this.requestPermission();
    return permission === "granted";
  }
}

// Export singleton instance
export const webNotifications = WebNotifications.getInstance();

// React hook for notifications
export const useWebNotifications = () => {
  return {
    requestPermission:
      webNotifications.requestPermission.bind(webNotifications),
    show: webNotifications.show.bind(webNotifications),
    addListener: webNotifications.addListener.bind(webNotifications),
    isSupported: webNotifications.isSupported.bind(webNotifications),
    getPermission: webNotifications.getPermission.bind(webNotifications),
    areNotificationsEnabled:
      webNotifications.areNotificationsEnabled.bind(webNotifications),
  };
};
