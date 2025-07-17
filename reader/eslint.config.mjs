import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";


export default defineConfig([
  {
    ignores: [
      "node_modules",
      "monaco",
      "test my sass",
      "**/*.d.ts",
      "globals"
    ]
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"]
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        chrome: "readonly",
        monaco: "readonly",
        require: "readonly",
      }
    }
  },
]);
