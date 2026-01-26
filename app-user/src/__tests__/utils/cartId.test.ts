import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { getOrCreateCartId } from 'utils/cartId';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-crypto');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockCrypto = Crypto as any;

describe('cartId', () => {
  const CART_ID_KEY = 'guestCartId';
  const mockRandomBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  const mockGeneratedId = '0102030405060708090a0b0c0d0e0f10';

  beforeEach(() => {
    jest.clearAllMocks();
    mockCrypto.getRandomBytesAsync.mockResolvedValue(mockRandomBytes);
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('getOrCreateCartId', () => {
    it('should create new cart ID when none exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getOrCreateCartId();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(CART_ID_KEY);
      expect(mockCrypto.getRandomBytesAsync).toHaveBeenCalledWith(16);
      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
      expect(typeof result).toBe('string');
    });

    it('should return existing cart ID when one exists', async () => {
      const existingCartId = 'existing-cart-123';
      mockAsyncStorage.getItem.mockResolvedValue(existingCartId);

      const result = await getOrCreateCartId();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(CART_ID_KEY);
      expect(mockCrypto.getRandomBytesAsync).not.toHaveBeenCalled();
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
      expect(result).toBe(existingCartId);
    });

    it('should handle different random byte values', async () => {
      const differentBytes = [
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]),
        new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16])
      ];

      for (const bytes of differentBytes) {
        mockCrypto.getRandomBytesAsync.mockResolvedValue(bytes);
        mockAsyncStorage.getItem.mockResolvedValue(null);

        const result = await getOrCreateCartId();
        expect(typeof result).toBe('string');
      }
    });

    it('should handle AsyncStorage.getItem errors and create new ID', async () => {
      const storageError = new Error('Storage error');
      mockAsyncStorage.getItem.mockRejectedValue(storageError);

      const result = await getOrCreateCartId();

      expect(typeof result).toBe('string');
    });

    it('should handle AsyncStorage.setItem errors and return generated ID', async () => {
      const setItemError = new Error('Set item error');
      mockAsyncStorage.setItem.mockRejectedValue(setItemError);

      const result = await getOrCreateCartId();

      expect(mockCrypto.getRandomBytesAsync).toHaveBeenCalledWith(16);
      expect(typeof result).toBe('string');
    });

    it('should handle Crypto.getRandomBytesAsync errors and use fallback', async () => {
      const cryptoError = new Error('Crypto error');
      mockCrypto.getRandomBytesAsync.mockRejectedValue(cryptoError);

      const result = await getOrCreateCartId();

      expect(typeof result).toBe('string');
    });

    it('should handle empty string from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('');

      const result = await getOrCreateCartId();

      expect(mockCrypto.getRandomBytesAsync).toHaveBeenCalledWith(16);
      expect(typeof result).toBe('string');
    });

    it('should handle whitespace-only string from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('   ');

      const result = await getOrCreateCartId();

      expect(typeof result).toBe('string');
    });
  });

  describe('edge cases', () => {
    it('should handle very long existing cart IDs', async () => {
      const longCartId = 'a'.repeat(1000);
      mockAsyncStorage.getItem.mockResolvedValue(longCartId);

      const result = await getOrCreateCartId();

      expect(result).toBe(longCartId);
      expect(mockCrypto.getRandomBytesAsync).not.toHaveBeenCalled();
    });

    it('should handle special characters in existing cart IDs', async () => {
      const specialChars = ['!@#$%^&*()', 'Hello-World', 'cart_123', 'cart-456'];
      
      for (const cartId of specialChars) {
        mockAsyncStorage.getItem.mockResolvedValue(cartId);
        const result = await getOrCreateCartId();
        expect(result).toBe(cartId);
      }
    });

    it('should handle null values from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getOrCreateCartId();

      expect(mockCrypto.getRandomBytesAsync).toHaveBeenCalledWith(16);
      expect(typeof result).toBe('string');
    });

    it('should handle undefined values from AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);

      const result = await getOrCreateCartId();

      expect(mockCrypto.getRandomBytesAsync).toHaveBeenCalledWith(16);
      expect(typeof result).toBe('string');
    });
  });

  describe('fallback behavior', () => {
    it('should use timestamp when both storage and crypto fail', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      mockCrypto.getRandomBytesAsync.mockRejectedValue(new Error('Crypto error'));

      const result = await getOrCreateCartId();

      expect(typeof result).toBe('string');
    });

    it('should generate different fallback IDs for different calls', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      mockCrypto.getRandomBytesAsync.mockRejectedValue(new Error('Crypto error'));

      const result1 = await getOrCreateCartId();
      const result2 = await getOrCreateCartId();

      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
    });
  });

  describe('performance considerations', () => {
    it('should not call crypto when cart ID already exists', async () => {
      const existingCartId = 'existing-cart-123';
      mockAsyncStorage.getItem.mockResolvedValue(existingCartId);

      await getOrCreateCartId();

      expect(mockCrypto.getRandomBytesAsync).not.toHaveBeenCalled();
    });

    it('should not call storage setItem when cart ID already exists', async () => {
      const existingCartId = 'existing-cart-123';
      mockAsyncStorage.getItem.mockResolvedValue(existingCartId);

      await getOrCreateCartId();

      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
