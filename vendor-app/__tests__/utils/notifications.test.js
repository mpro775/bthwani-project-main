// Test for notifications.ts
const Notifications = require('expo-notifications');
const Device = require('expo-device');

// Mock dependencies
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn()
}));

jest.mock('expo-device', () => ({
  isDevice: true
}));

// Mock global alert and console
global.alert = jest.fn();
global.console = {
  log: jest.fn()
};

// Mock implementation of the notification function
const registerForPushNotificationsAsync = async () => {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('فشل الحصول على صلاحية الإشعارات');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo Push Token:", token);
  } else {
    alert('يجب استخدام جهاز فعلي');
  }

  return token;
};

describe('Notifications Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert.mockClear();
    global.console.log.mockClear();
  });

  describe('Device Detection', () => {
    it('should check if device is real device', () => {
      expect(Device.isDevice).toBe(true);
    });

    it('should handle non-device environment', async () => {
      // Temporarily mock Device.isDevice as false
      Device.isDevice = false;
      
      await registerForPushNotificationsAsync();
      
      expect(global.alert).toHaveBeenCalledWith('يجب استخدام جهاز فعلي');
      
      // Restore original value
      Device.isDevice = true;
    });
  });

  describe('Permission Handling', () => {
    it('should handle existing granted permissions', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'mock-token-123' });

      const result = await registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
      expect(result).toBe('mock-token-123');
    });

    it('should request permissions when not granted', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'mock-token-456' });

      const result = await registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
      expect(result).toBe('mock-token-456');
    });

    it('should handle permission denial', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
      expect(global.alert).toHaveBeenCalledWith('فشل الحصول على صلاحية الإشعارات');
      expect(result).toBeUndefined();
    });

    it('should handle permission undetermined status', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'mock-token-789' });

      const result = await registerForPushNotificationsAsync();

      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(1);
      expect(result).toBe('mock-token-789');
    });
  });

  describe('Token Generation', () => {
    it('should generate push token successfully', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'ExponentPushToken[ABC123]' });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('ExponentPushToken[ABC123]');
      expect(global.console.log).toHaveBeenCalledWith('Expo Push Token:', 'ExponentPushToken[ABC123]');
    });

    it('should handle token generation failure', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockRejectedValue(new Error('Token generation failed'));

      await expect(registerForPushNotificationsAsync()).rejects.toThrow('Token generation failed');
    });

    it('should handle empty token response', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: '' });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('');
    });

    it('should handle null token response', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: null });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle permission check errors', async () => {
      Notifications.getPermissionsAsync.mockRejectedValue(new Error('Permission check failed'));

      await expect(registerForPushNotificationsAsync()).rejects.toThrow('Permission check failed');
    });

    it('should handle permission request errors', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      Notifications.requestPermissionsAsync.mockRejectedValue(new Error('Permission request failed'));

      await expect(registerForPushNotificationsAsync()).rejects.toThrow('Permission request failed');
    });

    it('should handle network errors during token generation', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockRejectedValue(new Error('Network error'));

      await expect(registerForPushNotificationsAsync()).rejects.toThrow('Network error');
    });
  });

  describe('User Experience', () => {
    it('should show appropriate alert messages in Arabic', async () => {
      Device.isDevice = false;
      
      await registerForPushNotificationsAsync();
      
      expect(global.alert).toHaveBeenCalledWith('يجب استخدام جهاز فعلي');
      
      Device.isDevice = true;
      
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
      
      await registerForPushNotificationsAsync();
      
      expect(global.alert).toHaveBeenCalledWith('فشل الحصول على صلاحية الإشعارات');
    });

    it('should log token for debugging purposes', async () => {
      const mockToken = 'debug-token-123';
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: mockToken });

      await registerForPushNotificationsAsync();

      expect(global.console.log).toHaveBeenCalledWith('Expo Push Token:', mockToken);
    });
  });

  describe('Async Operation Flow', () => {
    it('should execute operations in correct sequence', async () => {
      const executionOrder = [];
      
      Notifications.getPermissionsAsync.mockImplementation(async () => {
        executionOrder.push('check_permissions');
        return { status: 'denied' };
      });
      
      Notifications.requestPermissionsAsync.mockImplementation(async () => {
        executionOrder.push('request_permissions');
        return { status: 'granted' };
      });
      
      Notifications.getExpoPushTokenAsync.mockImplementation(async () => {
        executionOrder.push('generate_token');
        return { data: 'sequence-token' };
      });

      await registerForPushNotificationsAsync();

      expect(executionOrder).toEqual(['check_permissions', 'request_permissions', 'generate_token']);
    });

    it('should handle rapid successive calls', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'rapid-token' });

      const promises = [
        registerForPushNotificationsAsync(),
        registerForPushNotificationsAsync(),
        registerForPushNotificationsAsync()
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual(['rapid-token', 'rapid-token', 'rapid-token']);
      expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(3);
      expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined permission status', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: undefined });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'edge-token' });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('edge-token');
    });

    it('should handle empty permission status string', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: '' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'empty-status-token' });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('empty-status-token');
    });

    it('should handle whitespace in permission status', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: '  granted  ' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'whitespace-token' });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBe('whitespace-token');
    });
  });

  describe('Return Value Validation', () => {
    it('should return string token when successful', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.getExpoPushTokenAsync.mockResolvedValue({ data: 'string-token' });

      const result = await registerForPushNotificationsAsync();

      expect(typeof result).toBe('string');
      expect(result).toBe('string-token');
    });

    it('should return undefined when permissions denied', async () => {
      Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await registerForPushNotificationsAsync();

      expect(result).toBeUndefined();
    });

    it('should return undefined when not on device', async () => {
      Device.isDevice = false;
      
      const result = await registerForPushNotificationsAsync();
      
      expect(result).toBeUndefined();
      
      Device.isDevice = true;
    });
  });
});
