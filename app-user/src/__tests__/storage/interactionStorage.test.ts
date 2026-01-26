import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getRecentInteractions,
  Interaction,
  storeRecentInteraction,
} from "../../storage/interactionStorage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe("interactionStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockInteraction: Interaction = {
    id: "test-1",
    name: "Test Interaction",
    icon: "home",
    target: {
      screen: "Home" as any,
      params: { id: "123" },
    },
  };

  describe("storeRecentInteraction", () => {
    test("should save new interaction at the beginning", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await storeRecentInteraction(mockInteraction);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test("should add new interaction at the beginning of list", async () => {
      const existingInteractions = [
        {
          id: "old-1",
          name: "Old 1",
          icon: "star",
          target: { screen: "Home" as any },
        },
        {
          id: "old-2",
          name: "Old 2",
          icon: "heart",
          target: { screen: "Profile" as any },
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingInteractions)
      );

      await storeRecentInteraction(mockInteraction);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test("should remove duplicate interaction and add it at the beginning", async () => {
      const existingInteractions = [
        {
          id: "test-1",
          name: "Old Version",
          icon: "star",
          target: { screen: "Home" as any },
        },
        {
          id: "other-1",
          name: "Other",
          icon: "heart",
          target: { screen: "Profile" as any },
        },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingInteractions)
      );

      await storeRecentInteraction(mockInteraction);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test("should keep only last 10 interactions", async () => {
      const existingInteractions = Array.from({ length: 10 }, (_, i) => ({
        id: `old-${i}`,
        name: `Old ${i}`,
        icon: "star" as const,
        target: { screen: "Home" as any },
      }));
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingInteractions)
      );

      await storeRecentInteraction(mockInteraction);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    test("should handle errors gracefully", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      await storeRecentInteraction(mockInteraction);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("getRecentInteractions", () => {
    test("should return empty list when no interactions are saved", async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getRecentInteractions();

      expect(result).toEqual([]);
    });

    test("should return saved interactions", async () => {
      const savedInteractions = [mockInteraction];
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(savedInteractions)
      );

      const result = await getRecentInteractions();

      expect(result).toEqual(savedInteractions);
    });

    test("should handle errors and return empty list", async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error("Storage error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const result = await getRecentInteractions();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
