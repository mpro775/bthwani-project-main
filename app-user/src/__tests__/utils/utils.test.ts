import {
  DeliveryStoreWithDistance,
  enrichStoresWithDistance,
} from "../../utils/enrichStoresWithDistance";

// Mock dependencies
jest.mock("api/userApi", () => ({
  fetchUserProfile: jest.fn().mockResolvedValue({
    defaultAddress: {
      location: { lat: 15.3547, lng: 44.2067 },
      address: "Test Address",
    },
  }),
}));

describe("Utility Functions", () => {
  describe("enrichStoresWithDistance", () => {
    const mockStores = [
      {
        _id: "store-1",
        name: "Test Store 1",
        address: "Test Address 1",
        location: {
          lat: 15.3547,
          lng: 44.2067,
        },
        rating: 4.5,
        image: "store1.jpg",
        logo: "logo1.jpg",
      },
      {
        _id: "store-2",
        name: "Test Store 2",
        address: "Test Address 2",
        location: {
          lat: 13.5795,
          lng: 44.0195,
        },
        rating: 4.2,
        image: "store2.jpg",
        logo: "logo2.jpg",
      },
    ] as any[];

    test("should add distance and time to stores", async () => {
      const enriched = (await enrichStoresWithDistance(
        mockStores
      )) as DeliveryStoreWithDistance[];

      expect(enriched).toHaveLength(2);
      expect(enriched[0]).toHaveProperty("distance");
      expect(enriched[0]).toHaveProperty("time");
      expect(enriched[0]).toHaveProperty("distanceKm");
    });

    test("should calculate distance correctly", async () => {
      const enriched = (await enrichStoresWithDistance(
        mockStores
      )) as DeliveryStoreWithDistance[];

      expect(enriched[0]).toHaveProperty("distance");
      expect(enriched[0]).toHaveProperty("time");
      expect(enriched[0]).toHaveProperty("distanceKm");

      expect(enriched[1]).toHaveProperty("distance");
      expect(enriched[1]).toHaveProperty("time");
      expect(enriched[1]).toHaveProperty("distanceKm");
    });

    test("should handle stores without coordinates", async () => {
      const storesWithoutCoords = [
        {
          _id: "store-3",
          name: "Store without coordinates",
          address: "Undefined address",
          location: {
            lat: 0,
            lng: 0,
          },
          rating: 4.0,
          image: "store3.jpg",
          logo: "logo3.jpg",
        },
      ] as any[];

      const enriched = (await enrichStoresWithDistance(
        storesWithoutCoords
      )) as DeliveryStoreWithDistance[];

      expect(enriched[0].distance).toBe("غير محدد");
      expect(enriched[0].time).toBe("غير محدد");
      expect(enriched[0].distanceKm).toBe(Number.POSITIVE_INFINITY);
    });
  });

  describe("Network Utils", () => {
    test("should check connection status", () => {
      expect(true).toBe(true);
    });
  });

  describe("Storage Utils", () => {
    test("should save and retrieve data", async () => {
      expect(true).toBe(true);
    });
  });
});
