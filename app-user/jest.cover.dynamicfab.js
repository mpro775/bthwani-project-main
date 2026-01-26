// jest.cover.dynamicfab.js
const base = require("./jest.config"); // لو عندك jest.config.js
module.exports = {
  ...base,
  collectCoverage: true,
  collectCoverageFrom: ["src/components/DynamicFAB.tsx"],
  coverageThreshold: {
    "src/components/DynamicFAB.tsx": {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
