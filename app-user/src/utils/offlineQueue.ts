import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const QUEUE_KEY = "offline_requests";

export const queueOfflineRequest = async (method: string, url: string, data: any) => {
  const existing = await AsyncStorage.getItem(QUEUE_KEY);
  const queue = existing ? JSON.parse(existing) : [];
  queue.push({ method, url, data });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const retryQueuedRequests = async () => {
  const existing = await AsyncStorage.getItem(QUEUE_KEY);
  if (!existing) return;

  const queue = JSON.parse(existing);
  const remaining = [];

  for (const req of queue) {
    try {
      await axios({ method: req.method, url: req.url, data: req.data });
    } catch {
      remaining.push(req);
    }
  }

  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
};
