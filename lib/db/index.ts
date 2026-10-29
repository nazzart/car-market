// Подключение к Postgres (Supabase). Только для сервера: импорт из клиентского компонента сломает сборку.
// Запросы пишутся в features/*/api.ts — там же, где их вызывают страницы
import "server-only";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задан — см. .env.local");

// DATABASE_URL — transaction pooler Supabase (порт 6543): выдерживает много параллельных процессов (сборка, Vercel).
// Драйвер pg (node-postgres), а не postgres.js: тот отправляет несколько запросов в одно соединение не дожидаясь
// ответа, и пулер Supabase на этом зависает. Пул — один на процесс, в разработке переживает горячую перезагрузку
const globalForDb = globalThis as unknown as { pool?: Pool };
const pool = globalForDb.pool ?? new Pool({ connectionString: url, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema, casing: "snake_case" });
export { schema };
