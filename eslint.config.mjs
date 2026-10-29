import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // База данных — только из features/*/api.ts (там пишутся SQL-запросы); демо-данные — только для npm run db:seed
  // и демо-входа (features/auth/api.ts, до подключения Supabase Auth)
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["features/*/api.ts", "features/*/data/**", "lib/db/**", "scripts/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "(^|/)data/(listings|dealers|demoUsers)$",
              message: "Демо-данные лежат в базе (npm run db:seed). Используйте features/<feature>/api.ts на сервере или ./hooks в клиенте.",
            },
            {
              regex: "^@/lib/db(/|$)",
              message: "Запросы к базе пишутся в features/<feature>/api.ts — импортируйте функции оттуда.",
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
