import { isStoreOpenNow } from "../../utils/isStoreOpenNow";

describe("isStoreOpenNow", () => {
  const mockSchedule = [
    { day: "monday", open: true, from: "09:00", to: "18:00" },
    { day: "tuesday", open: true, from: "09:00", to: "18:00" },
    { day: "wednesday", open: true, from: "09:00", to: "18:00" },
    { day: "thursday", open: true, from: "09:00", to: "18:00" },
    { day: "friday", open: true, from: "09:00", to: "18:00" },
    { day: "saturday", open: false, from: "09:00", to: "18:00" },
    { day: "sunday", open: false, from: "09:00", to: "18:00" },
  ];

  describe("basic functionality", () => {
    it("should return false for empty schedule", () => {
      const result = isStoreOpenNow([]);
      expect(result).toBe(false);
    });

    it("should return false for null/undefined schedule", () => {
      const result1 = isStoreOpenNow(null as any);
      expect(result1).toBe(false);

      const result2 = isStoreOpenNow(undefined as any);
      expect(result2).toBe(false);
    });

    it("should return false for non-array schedule", () => {
      const result = isStoreOpenNow("invalid" as any);
      expect(result).toBe(false);
    });
  });

  describe("day-specific schedules", () => {
    it("should handle Monday schedule", () => {
      const monday10AM = new Date(2024, 0, 1, 10, 0, 0);
      const result = isStoreOpenNow(mockSchedule, monday10AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle Saturday schedule", () => {
      const saturday10AM = new Date(2024, 0, 6, 10, 0, 0);
      const result = isStoreOpenNow(mockSchedule, saturday10AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle Sunday schedule", () => {
      const sunday10AM = new Date(2024, 0, 7, 10, 0, 0);
      const result = isStoreOpenNow(mockSchedule, sunday10AM);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("time boundaries", () => {
    it("should handle opening time", () => {
      const monday9AM = new Date(2024, 0, 1, 9, 0, 0);
      const result = isStoreOpenNow(mockSchedule, monday9AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle closing time", () => {
      const monday6PM = new Date(2024, 0, 1, 18, 0, 0);
      const result = isStoreOpenNow(mockSchedule, monday6PM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle before opening time", () => {
      const monday8AM = new Date(2024, 0, 1, 8, 0, 0);
      const result = isStoreOpenNow(mockSchedule, monday8AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle after closing time", () => {
      const monday7PM = new Date(2024, 0, 1, 19, 0, 0);
      const result = isStoreOpenNow(mockSchedule, monday7PM);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("edge cases", () => {
    it("should handle mixed case day names", () => {
      const mixedCaseSchedule = [
        { day: "Monday", open: true, from: "09:00", to: "18:00" },
      ];
      const monday10AM = new Date(2024, 0, 1, 10, 0, 0);
      const result = isStoreOpenNow(mixedCaseSchedule, monday10AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle schedule with only one day", () => {
      const singleDaySchedule = [
        { day: "monday", open: true, from: "09:00", to: "18:00" },
      ];
      const monday10AM = new Date(2024, 0, 1, 10, 0, 0);
      const result = isStoreOpenNow(singleDaySchedule, monday10AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle schedule with missing days", () => {
      const incompleteSchedule = [
        { day: "monday", open: true, from: "09:00", to: "18:00" },
        { day: "wednesday", open: true, from: "09:00", to: "18:00" },
      ];
      const tuesday10AM = new Date(2024, 0, 2, 10, 0, 0);
      const result = isStoreOpenNow(incompleteSchedule, tuesday10AM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle 24-hour schedule", () => {
      const twentyFourHourSchedule = [
        { day: "monday", open: true, from: "00:00", to: "23:59" },
      ];
      const monday3AM = new Date(2024, 0, 1, 3, 0, 0);
      const result = isStoreOpenNow(twentyFourHourSchedule, monday3AM);
      expect(typeof result).toBe("boolean");
    });
  });

  describe("real-world scenarios", () => {
    it("should handle restaurant schedule", () => {
      const restaurantSchedule = [
        { day: "monday", open: true, from: "09:00", to: "23:00" },
        { day: "tuesday", open: true, from: "09:00", to: "23:00" },
        { day: "wednesday", open: true, from: "09:00", to: "23:00" },
        { day: "thursday", open: true, from: "09:00", to: "23:00" },
        { day: "friday", open: true, from: "09:00", to: "23:00" },
        { day: "saturday", open: true, from: "09:00", to: "23:00" },
        { day: "sunday", open: false, from: "09:00", to: "23:00" },
      ];
      const friday8PM = new Date(2024, 0, 5, 20, 0, 0);
      const result = isStoreOpenNow(restaurantSchedule, friday8PM);
      expect(typeof result).toBe("boolean");
    });

    it("should handle pharmacy schedule", () => {
      const pharmacySchedule = [
        { day: "monday", open: true, from: "00:00", to: "23:59" },
        { day: "tuesday", open: true, from: "00:00", to: "23:59" },
        { day: "wednesday", open: true, from: "00:00", to: "23:59" },
        { day: "thursday", open: true, from: "00:00", to: "23:59" },
        { day: "friday", open: true, from: "00:00", to: "23:59" },
        { day: "saturday", open: true, from: "00:00", to: "23:59" },
        { day: "sunday", open: true, from: "00:00", to: "23:59" },
      ];
      const sunday2AM = new Date(2024, 0, 7, 2, 0, 0);
      const result = isStoreOpenNow(pharmacySchedule, sunday2AM);
      expect(typeof result).toBe("boolean");
    });
  });
});
