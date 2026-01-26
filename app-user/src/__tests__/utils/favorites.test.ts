import { DeliveryStore } from "../../types/types";
import { favoriteScopeFor } from "../../utils/favorites";

describe("favorites", () => {
  describe("favoriteScopeFor", () => {
    it("should return grocery scope for grocery stores", () => {
      const groceryStore: Partial<DeliveryStore> = {
        category: { usageType: "grocery" },
      };

      const result = favoriteScopeFor(groceryStore);

      expect(result).toBe("grocery");
    });

    it("should return restaurant scope for restaurant stores", () => {
      const restaurantStore: Partial<DeliveryStore> = {
        category: { usageType: "restaurant" },
      };

      const result = favoriteScopeFor(restaurantStore);

      expect(result).toBe("restaurant");
    });

    it("should return restaurant scope for cafe stores", () => {
      const cafeStore: Partial<DeliveryStore> = {
        category: { usageType: "cafe" },
      };

      const result = favoriteScopeFor(cafeStore);

      expect(result).toBe("restaurant");
    });

    it("should return restaurant scope for bakery stores", () => {
      const bakeryStore: Partial<DeliveryStore> = {
        category: { usageType: "bakery" },
      };

      const result = favoriteScopeFor(bakeryStore);

      expect(result).toBe("restaurant");
    });

    it("should return restaurant scope for pharmacy stores", () => {
      const pharmacyStore: Partial<DeliveryStore> = {
        category: { usageType: "pharmacy" },
      };

      const result = favoriteScopeFor(pharmacyStore);

      expect(result).toBe("restaurant");
    });

    it("should return restaurant scope for other store types", () => {
      const otherStore: Partial<DeliveryStore> = {
        category: { usageType: "other" },
      };

      const result = favoriteScopeFor(otherStore);

      expect(result).toBe("restaurant");
    });

    it("should use usageType directly when category is missing", () => {
      const storeWithDirectUsageType: Partial<DeliveryStore> = {
        usageType: "grocery",
      };

      const result = favoriteScopeFor(storeWithDirectUsageType);

      expect(result).toBe("grocery");
    });

    it("should prioritize category.usageType over direct usageType", () => {
      const storeWithBoth: Partial<DeliveryStore> = {
        category: { usageType: "grocery" },
        usageType: "restaurant",
      };

      const result = favoriteScopeFor(storeWithBoth);

      expect(result).toBe("grocery");
    });

    it("should return restaurant scope when both category and usageType are missing", () => {
      const storeWithoutType: Partial<DeliveryStore> = {
        name: "Store without type",
      };

      const result = favoriteScopeFor(storeWithoutType);

      expect(result).toBe("restaurant");
    });

    it("should return restaurant scope when category exists but usageType is missing", () => {
      const storeWithoutUsageType: Partial<DeliveryStore> = {
        category: {},
      };

      const result = favoriteScopeFor(storeWithoutUsageType);

      expect(result).toBe("restaurant");
    });

    it("should handle undefined category", () => {
      const storeWithUndefinedCategory: Partial<DeliveryStore> = {
        category: undefined,
      };

      const result = favoriteScopeFor(storeWithUndefinedCategory);

      expect(result).toBe("restaurant");
    });

    it("should handle null category", () => {
      const storeWithNullCategory: Partial<DeliveryStore> = {
        category: null as any,
      };

      const result = favoriteScopeFor(storeWithNullCategory);

      expect(result).toBe("restaurant");
    });

    it("should handle empty string usageType", () => {
      const storeWithEmptyType: Partial<DeliveryStore> = {
        category: { usageType: "" },
      };

      const result = favoriteScopeFor(storeWithEmptyType);

      expect(result).toBe("restaurant");
    });

    it("should handle whitespace-only usageType", () => {
      const storeWithWhitespaceType: Partial<DeliveryStore> = {
        category: { usageType: "   " },
      };

      const result = favoriteScopeFor(storeWithWhitespaceType);

      expect(result).toBe("restaurant");
    });

    it("should handle very long usageType", () => {
      const longUsageType = "a".repeat(1000);
      const storeWithLongType: Partial<DeliveryStore> = {
        category: { usageType: longUsageType },
      };

      const result = favoriteScopeFor(storeWithLongType);

      expect(result).toBe("restaurant");
    });

    it("should handle special characters in usageType", () => {
      const specialChars = [
        "grocery!",
        "grocery@",
        "grocery#",
        "grocery$",
        "grocery%",
      ];

      for (const usageType of specialChars) {
        const store: Partial<DeliveryStore> = {
          category: { usageType },
        };
        const result = favoriteScopeFor(store);
        expect(result).toBe("restaurant");
      }
    });

    it("should handle numeric usageType", () => {
      const numericStore: Partial<DeliveryStore> = {
        category: { usageType: 123 as any },
      };

      const result = favoriteScopeFor(numericStore);

      expect(result).toBe("restaurant");
    });

    it("should handle boolean usageType", () => {
      const booleanStore: Partial<DeliveryStore> = {
        category: { usageType: true as any },
      };

      const result = favoriteScopeFor(booleanStore);

      expect(result).toBe("restaurant");
    });
  });

  describe("real-world scenarios", () => {
    it("should handle typical grocery store", () => {
      const groceryStore: Partial<DeliveryStore> = {
        id: "grocery123",
        name: "Test Grocery Store",
        category: { usageType: "grocery" },
      };

      const result = favoriteScopeFor(groceryStore);

      expect(result).toBe("grocery");
    });

    it("should handle typical restaurant", () => {
      const restaurantStore: Partial<DeliveryStore> = {
        id: "restaurant456",
        name: "Test Restaurant",
        category: { usageType: "restaurant" },
      };

      const result = favoriteScopeFor(restaurantStore);

      expect(result).toBe("restaurant");
    });

    it("should handle typical cafe", () => {
      const cafeStore: Partial<DeliveryStore> = {
        id: "cafe789",
        name: "Test Cafe",
        category: { usageType: "cafe" },
      };

      const result = favoriteScopeFor(cafeStore);

      expect(result).toBe("restaurant");
    });

    it("should handle store with multiple properties", () => {
      const complexStore: Partial<DeliveryStore> = {
        id: "complex123",
        name: "Complex Store",
        category: { usageType: "grocery" },
        usageType: "restaurant",
        location: { lat: 12.345, lng: 67.89 },
      };

      const result = favoriteScopeFor(complexStore);

      expect(result).toBe("grocery");
    });
  });
});
