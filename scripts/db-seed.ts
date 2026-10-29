// Заполняет базу демо-дилерами и демо-объявлениями из features/*/data.
//   npm run db:seed                            — только в пустую базу
//   npm run db:seed -- --reset                 — удаляет ВСЕ объявления и дилеров и загружает демо заново
//   npm run db:seed -- --reset --generate 100  — плюс 100 случайных объявлений (проверка поиска и пагинации)
import { loadEnvConfig } from "@next/env";
import { count, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { listings as demoListings } from "../features/cars/data/listings";
import { dealers as demoDealers } from "../features/dealers/data/dealers";
import * as schema from "../lib/db/schema";

import { generateListings } from "./demo-generated";

loadEnvConfig(process.cwd());

const contactCount = demoDealers.reduce((n, d) => n + (d.contacts?.length ?? 0), 0);
const reset = process.argv.includes("--reset");
const generateArg = process.argv.indexOf("--generate");
const generate = generateArg > 0 ? Math.max(0, Number(process.argv[generateArg + 1]) || 0) : 0;
const client = new Pool({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL!, max: 1 });
const db = drizzle(client, { schema, casing: "snake_case" });

async function main() {
  const [{ value: existing }] = await db.select({ value: count() }).from(schema.listings);
  if (existing > 0 && !reset) {
    console.log(`В базе уже ${existing} объявлений — ничего не меняю. Перезаписать демо: npm run db:seed -- --reset`);
    return;
  }

  const now = Date.now();
  const generated = generateListings(generate, Math.max(...demoListings.map((l) => Number(l.id))) + 1, demoDealers);
  const allListings = [...demoListings, ...generated];

  await db.transaction(async (tx) => {
    await tx.execute(sql`truncate ${schema.listings}, ${schema.dealerContacts}, ${schema.dealers} restart identity`);

    // лишние поля (contacts) Drizzle пропускает: в таблицу попадают только её колонки
    await tx.insert(schema.dealers).values(demoDealers);

    const contacts = demoDealers.flatMap((d) =>
      (d.contacts ?? []).map((c, position) => ({ ...c, dealerSlug: d.slug, position }))
    );
    if (contacts.length) await tx.insert(schema.dealerContacts).values(contacts);

    await tx.insert(schema.listings).values(
      allListings.map(({ id, dealer, postedMinutesAgo, ...listing }) => ({
        ...listing,
        id: Number(id),
        dealerSlug: dealer ?? null,
        postedAt: new Date(now - postedMinutesAgo * 60_000),
      }))
    );

    // следующие объявления получат номера после демо (identity не знает о вставленных вручную id)
    await tx.execute(
      sql`select setval(pg_get_serial_sequence('listings', 'id'), (select coalesce(max(id), 1) from ${schema.listings}))`
    );
  });

  console.log(`Готово: ${demoDealers.length} дилеров, ${contactCount} контактов, ${demoListings.length} объявлений + ${generated.length} сгенерированных`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
