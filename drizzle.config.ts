import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// те же переменные, что видит Next.js (.env.local)
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  casing: "snake_case",
  // таблицы Supabase (auth.users и др.) не наши: миграции касаются только схемы public
  schemaFilter: ["public"],
  // миграции — через session pooler (5432): DDL и prepared statements без ограничений transaction-режима
  dbCredentials: { url: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL! },
});
