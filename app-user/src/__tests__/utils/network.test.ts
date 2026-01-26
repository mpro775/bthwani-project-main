import NetInfo from "@react-native-community/netinfo";
import { isConnected } from "../../utils/network";

// Mock NetInfo
jest.mock("@react-native-community/netinfo");

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe("network", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isConnected", () => {
    it("should return true when network is connected", async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: "wifi",
      } as any);

      const result = await isConnected();

      expect(mockNetInfo.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it("should return false when network is disconnected", async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: "none",
      } as any);

      const result = await isConnected();

      expect(result).toBe(false);
    });

    it("should return false when isConnected is undefined", async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: undefined,
        isInternetReachable: undefined,
        type: "unknown",
      } as any);

      const result = await isConnected();

      expect(result).toBe(false);
    });

    it("should handle network type variations", async () => {
      const networkTypes = ["wifi", "cellular", "ethernet", "bluetooth", "vpn"];

      for (const type of networkTypes) {
        mockNetInfo.fetch.mockResolvedValue({
          isConnected: true,
          isInternetReachable: true,
          type,
        } as any);

        const result = await isConnected();
        expect(result).toBe(true);
      }
    });

    it("should handle NetInfo.fetch errors gracefully", async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error("NetInfo error"));

      await expect(isConnected()).rejects.toThrow("NetInfo error");
    });
  });
});
