import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const CART_ID_KEY = 'guestCartId';

const generateRandomId = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');
};


export async function getOrCreateCartId(): Promise<string> {
  try {
    let cartId = await AsyncStorage.getItem(CART_ID_KEY);

    if (!cartId) {
      cartId = await generateRandomId();
      await AsyncStorage.setItem(CART_ID_KEY, cartId);
    }

    return cartId;
  } catch (e) {
    console.error('⚠️ [cartId] Error:', e);
    return Date.now().toString(); // fallback
  }
}
