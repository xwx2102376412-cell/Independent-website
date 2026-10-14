import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "admin-app/.next/**", "node_modules/**", "next-env.d.ts", "admin-app/next-env.d.ts"]),
]);
