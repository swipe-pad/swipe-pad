import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import betterTailwind from "eslint-plugin-better-tailwindcss";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  betterTailwind.configs.recommended,
  boundaries.configs.recommended,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**/*" },
        { type: "components", pattern: "src/components/**/*" },
        { type: "context", pattern: "src/context/**/*" },
        { type: "hooks", pattern: "src/hooks/**/*" },
        { type: "lib", pattern: "src/lib/**/*" },
        { type: "types", pattern: "src/types/**/*" }
      ],
      "boundaries/ignore": ["**/*.test.*"]
    },
    rules: {
      "better-tailwindcss/no-unknown-classes": "off",
      "better-tailwindcss/enforce-consistent-class-order": [
        "warn",
        {
          entryPoint: "./src/app/globals.css",
        },
      ],
      "boundaries/element-types": [
        "warn",
        {
          default: "allow",
          message: "${file.type} is not allowed to import ${dependency.type}",
          rules: [
            {
              from: ["components"],
              disallow: ["app"]
            }
          ]
        }
      ]
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
