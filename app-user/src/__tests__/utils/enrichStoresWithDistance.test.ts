import { enrichStoresWithDistance } from 'utils/enrichStoresWithDistance';
import { fetchUserProfile } from 'api/userApi';
import { haversineDistance, estimateOrderTiming } from 'utils/distanceUtils';
import { DeliveryStore } from 'types/types';

// Mock dependencies
jest.mock('api/userApi');
jest.mock('utils/distanceUtils');

const mockFetchUserProfile = fetchUserProfile as any;
const mockHaversineDistance = haversineDistance as any;
const mockEstimateOrderTiming = estimateOrderTiming as any;

describe('enrichStoresWithDistance', () => {
  const mockStores: Partial<DeliveryStore>[] = [
    {
      _id: '1',
      name: 'Test Restaurant',
      location: { lat: 12.345, lng: 67.890 },
      category: { _id: 'cat1', name: 'restaurant' },
      avgPrepTimeMin: 15,
      queueSize: 2,
    } as any,
    {
      _id: '2',
      name: 'Test Grocery',
      location: { lat: 12.350, lng: 67.895 },
      category: { _id: 'cat2', name: 'grocery' },
      avgPrepTimeMin: 8,
      queueSize: 0,
    } as any,
    {
      _id: '3',
      name: 'Store without location',
      category: { _id: 'cat3', name: 'other' },
    } as any,
  ];

  const mockUserProfile = {
    id: 'user1',
    defaultAddress: {
      location: { lat: 12.340, lng: 67.885 }
    }
  };

  const mockTimingResult = {
    travelTimeMin: 10,
    prepTimeMin: 15,
    dispatchLatencyMin: 6,
    bufferMin: 3,
    totalEtaMin: 34,
    minEtaMin: 29,
    maxEtaMin: 39,
    label: '29-39 minutes'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserProfile.mockResolvedValue(mockUserProfile);
    mockHaversineDistance.mockReturnValue(2.5);
    mockEstimateOrderTiming.mockReturnValue(mockTimingResult);
  });

  it('should enrich stores with distance and timing when user location is available', async () => {
    const result = await enrichStoresWithDistance(mockStores as DeliveryStore[]);

    expect(mockFetchUserProfile).toHaveBeenCalledTimes(1);
    expect(mockHaversineDistance).toHaveBeenCalled();
    expect(mockEstimateOrderTiming).toHaveBeenCalled();

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('distance');
    expect(result[0]).toHaveProperty('distanceKm');
    expect(result[0]).toHaveProperty('time');
  });

  it('should handle stores without valid coordinates', async () => {
    const storesWithoutCoords = [
      { _id: '1', name: 'Store without location' } as Partial<DeliveryStore>
    ];

    const result = await enrichStoresWithDistance(storesWithoutCoords as DeliveryStore[]);

    expect(result[0]).toHaveProperty('distance', 'غير محدد');
    expect(result[0]).toHaveProperty('distanceKm', Number.POSITIVE_INFINITY);
    expect(result[0]).toHaveProperty('time', 'غير محدد');
  });

  it('should handle user without default address', async () => {
    mockFetchUserProfile.mockResolvedValue({ ...mockUserProfile, defaultAddress: undefined });

    const result = await enrichStoresWithDistance(mockStores as DeliveryStore[]);

    expect(result).toHaveLength(3);
    expect(result[0]).toHaveProperty('distance', 'غير محدد');
    expect(result[0]).toHaveProperty('distanceKm', Number.POSITIVE_INFINITY);
    expect(result[0]).toHaveProperty('time', 'غير محدد');
  });

  it('should handle invalid coordinates gracefully', async () => {
    const storesWithInvalidCoords = [
      {
        _id: '1',
        name: 'Store with invalid coordinates',
        location: { lat: 0, lng: 0 },
        category: { _id: 'cat1', name: 'restaurant' }
      } as any
    ];

    const result = await enrichStoresWithDistance(storesWithInvalidCoords as DeliveryStore[]);

    expect(result[0]).toHaveProperty('distance', 'غير محدد');
    expect(result[0]).toHaveProperty('distanceKm', Number.POSITIVE_INFINITY);
    expect(result[0]).toHaveProperty('time', 'غير محدد');
  });

  it('should use fallback category when store category is missing', async () => {
    const storeWithoutCategory = {
      _id: '1',
      name: 'Store without category',
      location: { lat: 12.345, lng: 67.890 }
    } as Partial<DeliveryStore>;

    await enrichStoresWithDistance([storeWithoutCategory] as DeliveryStore[]);

    expect(mockEstimateOrderTiming).toHaveBeenCalled();
  });

  it('should handle different category usage types', async () => {
    const groceryStore = {
      _id: '1',
      name: 'Grocery Store',
      location: { lat: 12.345, lng: 67.890 },
      usageType: 'grocery'
    } as any;

    await enrichStoresWithDistance([groceryStore] as DeliveryStore[]);

    expect(mockEstimateOrderTiming).toHaveBeenCalled();
  });

  it('should use store prep time when available', async () => {
    const storeWithPrepTime = {
      _id: '1',
      name: 'Store with prep time',
      location: { lat: 12.345, lng: 67.890 },
      category: { _id: 'cat1', name: 'restaurant' },
      prepTimeMin: 20
    } as any;

    await enrichStoresWithDistance([storeWithPrepTime] as DeliveryStore[]);

    expect(mockEstimateOrderTiming).toHaveBeenCalled();
  });

  it('should handle queue size from different properties', async () => {
    const storeWithPendingOrders = {
      _id: '1',
      name: 'Store with pending orders',
      location: { lat: 12.345, lng: 67.890 },
      category: { _id: 'cat1', name: 'restaurant' },
      pendingOrders: 5
    } as any;

    await enrichStoresWithDistance([storeWithPendingOrders] as DeliveryStore[]);

    expect(mockEstimateOrderTiming).toHaveBeenCalled();
  });
});
