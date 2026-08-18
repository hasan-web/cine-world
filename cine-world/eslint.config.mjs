import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Cloudflare/OpenNext build output — bundled, minified JS. Linting it isn't
    // useful (it's not source we write) and its size is enough to OOM a default Node heap.
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
