import js from "@eslint/js";
import globals from "globals";

export default [
  // 1. Global Ignores (This replaces .eslintignore)
  // Add any folders you previously had in .eslintignore here
  {
    ignores: ["dist/", "build/", "node_modules/"],
  },

  // 2. Base Recommended Rules (Replaces "extends": "eslint:recommended")
  js.configs.recommended,

  // 3. Your Custom Configuration
  {
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: "module",
      // This replaces "env"
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.commonjs,
        ...globals.es6,
        // Your custom globals
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
    },
    // Your rules copied from the old config
    rules: {
      "no-console": 0,
      "quotes": ["error", "single"],
      "comma-dangle": [
        "error",
        {
          "arrays": "always-multiline",
          "objects": "always-multiline",
          "imports": "always-multiline",
          "exports": "always-multiline",
          "functions": "ignore"
        }
      ]
    }
  }
];