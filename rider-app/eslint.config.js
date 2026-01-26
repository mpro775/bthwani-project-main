const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const tsconfigPaths = require("eslint-import-resolver-typescript");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ["dist/*"],
    settings: {
      "import/resolver": {
        typescript: {
          // 🔥 هذا يضمن أن ESLint يقرأ tsconfig.json
          project: "./tsconfig.json",
        },
      },
    },
  },
]);
