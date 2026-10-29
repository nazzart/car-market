import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Демо-данные объявлений, дилеров и аккаунтов читаются только через features/*/api.ts —
  // это единственное место, которое поменяется при подключении бэкенда
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["features/*/api.ts", "features/*/data/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "(^|/)data/(listings|dealers|demoUsers)$",
              message: "Используйте функции и хуки из features/<feature>/api.ts вместо прямого импорта демо-данных.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
