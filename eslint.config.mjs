import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  betterTailwind.configs.recommended,
  {
    rules: {
      // Ajustes específicos para better-tailwindcss
      "better-tailwindcss/no-unknown-classes": "off",
      "better-tailwindcss/enforce-consistent-class-order": [
        "warn",
        {
          entryPoint: "./src/app/globals.css",
        },
      ],
    },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy and generated folders:
    ".old/**",
    "convex/**",
    "v0-readonly/**",
  ]),
]);

export default eslintConfig;
