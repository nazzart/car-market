import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // База данных — только из features/*/api.ts (там пишутся SQL-запросы); демо-данные — только для npm run db:seed
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["features/*/api.ts", "features/*/data/**", "lib/db/**", "scripts/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "(^|/)data/(listings|dealers)$",
              message: "Демо-данные лежат в базе (npm run db:seed). Используйте features/<feature>/api.ts на сервере или ./actions и ./hooks в клиенте.",
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
  // Дизайн-токены (app/globals.css): цвета состояний и скругления — по именам, а не напрямую из палитры
  {
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...["Literal", "TemplateElement"].flatMap((node) => [
          {
            selector: `${node}[value${node === "Literal" ? "" : ".raw"}=/(^|[\\s:])(bg|text|border|ring)-(emerald|amber|red|sky)-\\d/]`,
            message: "Цвета состояний — через токены: bg-success-soft, text-danger, border-warning-muted… (app/globals.css).",
          },
          {
            selector: `${node}[value${node === "Literal" ? "" : ".raw"}=/(^|[\\s:])rounded-(2xl|3xl)(\\s|$)/]`,
            message: "Скругления — через токены: rounded-card (карточки), rounded-panel (крупные блоки), rounded-control (поля).",
          },
        ]),
        // Типы: в компоненте — только его пропсы (type XxxProps над функцией), остальное — в types.ts фичи
        {
          selector: "TSTypeAliasDeclaration[id.name!=/Props$/], TSInterfaceDeclaration[id.name!=/Props$/]",
          message: "В .tsx объявляются только пропсы (type XxxProps). Остальные типы — в types.ts фичи.",
        },
        {
          selector:
            "FunctionDeclaration[id.name=/^[A-Z]/] > ObjectPattern > TSTypeAnnotation > :matches(TSTypeLiteral, TSIntersectionType:has(> TSTypeLiteral))",
          message: "Пропсы — отдельным типом над компонентом: type XxxProps = { … }.",
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
