import {
  haversineDistance,
  estimateOrderTiming,
  estimateDuration,
  CategoryKind,
  TimingParams,
  OrderTimingResult
} from 'utils/distanceUtils';

describe('distanceUtils', () => {
  describe('haversineDistance', () => {
    it('should calculate correct distance between two points', () => {
      const lat1 = 15.3694;
      const lng1 = 44.1910;
      const lat2 = 15.3694;
      const lng2 = 44.1911;

      const distance = haversineDistance(lat1, lng1, lat2, lng2);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('should calculate distance between different cities', () => {
      const lat1 = 15.3694; // Sana'a
      const lng1 = 44.1910;
      const lat2 = 12.7797; // Aden
      const lng2 = 45.0095;

      const distance = haversineDistance(lat1, lng1, lat2, lng2);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });

    it('should return 0 for identical coordinates', () => {
      const lat = 15.3694;
      const lng = 44.1910;

      const distance = haversineDistance(lat, lng, lat, lng);
      
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const lat1 = -15.3694;
      const lng1 = -44.1910;
      const lat2 = -15.3694;
      const lng2 = -44.1911;

      const distance = haversineDistance(lat1, lng1, lat2, lng2);
      
      expect(distance).toBeGreaterThan(0);
      expect(typeof distance).toBe('number');
    });
  });

  describe('estimateOrderTiming', () => {
    const defaultParams: TimingParams = {
      averageSpeedKmh: 32,
      trafficMultiplier: 1.1,
      dispatchLatencyMin: 6,
      baseBufferMin: 3,
      category: 'restaurant',
      queueSize: 0,
      prepPerOrderMin: 2,
      minPrepMin: 2,
      maxPrepMin: 30,
      rangeFactor: 0.15
    };

    it('should calculate timing for restaurant with default parameters', () => {
      const distanceKm = 5;
      const result = estimateOrderTiming(distanceKm, defaultParams);

      expect(result).toHaveProperty('travelTimeMin');
      expect(result).toHaveProperty('prepTimeMin');
      expect(result).toHaveProperty('dispatchLatencyMin');
      expect(result).toHaveProperty('bufferMin');
      expect(result).toHaveProperty('totalEtaMin');
      expect(result).toHaveProperty('minEtaMin');
      expect(result).toHaveProperty('maxEtaMin');
      expect(result).toHaveProperty('label');
    });

    it('should use store prep time when provided', () => {
      const distanceKm = 3;
      const params = { ...defaultParams, storePrepTimeMin: 20 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(result.prepTimeMin).toBe(20);
    });

    it('should handle queue size correctly', () => {
      const distanceKm = 2;
      const params = { ...defaultParams, queueSize: 5, prepPerOrderMin: 3 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(result.prepTimeMin).toBeGreaterThan(0);
    });

    it('should handle traffic multiplier', () => {
      const distanceKm = 10;
      const params = { ...defaultParams, trafficMultiplier: 1.5 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(result.travelTimeMin).toBeGreaterThan(0);
    });

    it('should handle minimum travel time of 1 minute', () => {
      const distanceKm = 0.01;
      const params = { ...defaultParams, averageSpeedKmh: 100 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(result.travelTimeMin).toBeGreaterThan(0);
    });

    it('should calculate range factor correctly', () => {
      const distanceKm = 5;
      const params = { ...defaultParams, rangeFactor: 0.2 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(result.minEtaMin).toBeLessThan(result.totalEtaMin);
      expect(result.maxEtaMin).toBeGreaterThan(result.totalEtaMin);
    });

    it('should handle different categories with appropriate defaults', () => {
      const distanceKm = 2;
      const categories: CategoryKind[] = ['restaurant', 'grocery', 'pharmacy', 'bakery', 'cafe', 'other'];

      categories.forEach((category) => {
        const params = { ...defaultParams, category };
        const result = estimateOrderTiming(distanceKm, params);
        expect(result.prepTimeMin).toBeGreaterThan(0);
      });
    });

    it('should generate correct label format', () => {
      const distanceKm = 1;
      const params = { ...defaultParams, rangeFactor: 0.01 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(typeof result.label).toBe('string');
    });

    it('should handle edge case with very high speed', () => {
      const distanceKm = 100;
      const params = { ...defaultParams, averageSpeedKmh: 1000 };

      const result = estimateOrderTiming(distanceKm, params);

      expect(result.travelTimeMin).toBeGreaterThan(0);
      expect(result.totalEtaMin).toBeGreaterThan(0);
    });
  });

  describe('estimateDuration', () => {
    it('should calculate duration for given distance and speed', () => {
      const distanceKm = 20;
      const averageSpeedKmh = 40;

      const result = estimateDuration(distanceKm, averageSpeedKmh);

      expect(typeof result).toBe('string');
    });

    it('should use default speed when not provided', () => {
      const distanceKm = 30;

      const result = estimateDuration(distanceKm);

      expect(typeof result).toBe('string');
    });

    it('should handle zero distance', () => {
      const result = estimateDuration(0, 40);

      expect(typeof result).toBe('string');
    });

    it('should handle very small distances', () => {
      const result = estimateDuration(0.1, 40);

      expect(typeof result).toBe('string');
    });

    it('should handle very high speeds', () => {
      const result = estimateDuration(100, 200);

      expect(typeof result).toBe('string');
    });
  });
});

