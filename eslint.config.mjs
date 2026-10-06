import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  // Upload/editor previews intentionally use native images to display original assets immediately.
  { files: ["components/admin/**/*.tsx"], rules: { "@next/next/no-img-element": "off" } },
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
]);
