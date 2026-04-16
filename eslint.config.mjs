import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
      ".cache/**",
      ".vercel/**",
      ".old/**",
      "contracts/lib/**",
      "convex/**",
      "v0-readonly/**",
      "ops/**",
      // Build output folders:
      ".vercel/**",
      // Scripts using CommonJS or Node builtins:
      "scripts/*.cjs",
    ]),
]);

export default eslintConfig;
