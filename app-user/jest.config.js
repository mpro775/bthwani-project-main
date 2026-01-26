module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  setupFiles: ["./jest.setup.js"],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  moduleDirectories: ["node_modules", "src"],
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo(nent)?|expo-.*|@expo(nent)?/.*|@react-navigation/.*))",
  ],
  moduleNameMapper: {
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
    // Absolute imports only - these work well
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^api/(.*)$": "<rootDir>/src/api/$1",
    "^types/(.*)$": "<rootDir>/src/types/$1",
    "^constants/(.*)$": "<rootDir>/src/constants/$1",
    "^context/(.*)$": "<rootDir>/src/context/$1",
    "^screens/(.*)$": "<rootDir>/src/screens/$1",
    "^navigation/(.*)$": "<rootDir>/src/navigation/$1",
    "^@/(.*)$": "<rootDir>/src/$1",

    "^storage/(.*)$": "<rootDir>/src/storage/$1",
    "^test-utils/(.*)$": "<rootDir>/src/test-utils/$1",
    "^localization/(.*)$": "<rootDir>/src/localization/$1",
  },
  // إعدادات التغطية المتقدمة
  collectCoverage: false, // افتراضياً مُعطل، يُفعل مع --coverage
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/index.{ts,tsx}",
    "!src/types/**",
    "!src/constants/**",
    "!src/navigation/index.tsx",
    "!src/utils/api/config.ts",
    "!src/test-utils/**",
    "!App.tsx",
    "!index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "text-summary", "html", "lcov", "json"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // تحسينات الأداء
  maxWorkers: "50%", // استخدام نصف المعالجات المتاحة
  cacheDirectory: "<rootDir>/.jest-cache",
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // تسريع الاختبارات
  testTimeout: 10000, // زمن انتظار افتراضي
  // إعدادات متقدمة
  verbose: false, // تقليل الإخراج للسرعة
  detectLeaks: false, // تعطيل كشف التسريب للسرعة
  forceExit: true, // إنهاء قسري للعمليات المعلقة
};
