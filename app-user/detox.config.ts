const config = {
  testRunner: 'jest',
  runnerConfig: 'e2e/jest.config.js',
  apps: {
    'android.detox': {
      type: 'android.apk',
      binaryPath: 'path/to/your.apk', // حدّثه بعد build
      build: 'eas build --platform android --profile detox --non-interactive'
    },
    'ios.detox': {
      type: 'ios.app',
      binaryPath: 'path/to/your.app',
      build: 'eas build --platform ios --profile detox --non-interactive'
    }
  },
  devices: {
    emulator: { type: 'android.emulator', device: { avdName: 'Pixel_6_API_34' } },
    simulator: { type: 'ios.simulator', device: { type: 'iPhone 15' } }
  },
  configurations: {
    'android.detox': { device: 'emulator', app: 'android.detox' },
    'ios.detox': { device: 'simulator', app: 'ios.detox' }
  }
};

module.exports = config;
