// jest.config.local.js - إعدادات محلية للتطوير
module.exports = {
  // إعدادات التطوير المحلي
  collectCoverage: true,
  coverageReporters: ['text', 'html', 'lcov'],
  coverageDirectory: 'coverage',
  
  // إعدادات الأداء المحلي
  maxWorkers: '75%', // استخدام 75% من المعالجات للتطوير
  cache: true,
  cacheDirectory: '.jest-cache',
  
  // إعدادات التطوير
  verbose: true,
  testTimeout: 15000, // زيادة وقت الانتظار للتطوير
  
  // إعدادات إضافية للتطوير
  watchPathIgnorePatterns: [
    'node_modules',
    'coverage',
    '.git'
  ],
  
  // إعدادات التغطية المحلية
  coverageThreshold: {
    global: {
      branches: 50,    // تخفيض العتبة للتطوير
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};
