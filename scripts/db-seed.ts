// Заполняет базу демо-дилерами и демо-объявлениями из features/*/data.
//   npm run db:seed                            — только в пустую базу
//   npm run db:seed -- --reset                 — заменяет демо-данные: объявления без владельца-аккаунта и дилеров
//                                                без аккаунта. Зарегистрированные пользователи, их дилеры и объявления
//                                                не трогаются
//   npm run db:seed -- --reset --generate 100  — плюс 100 случайных объявлений (проверка поиска и пагинации)
import { loadEnvConfig } from "@next/env";
import { count, eq, sql } from "drizzle-orm";
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

const fail = (message: string): never => {
  throw new Error(message);
};

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
    // демо — то, что не принадлежит ни одному аккаунту (избранное и жалобы на них удалятся каскадом)
    const accountDealers = sql`(select ${schema.profiles.dealerId} from ${schema.profiles} where ${schema.profiles.dealerId} is not null)`;
    await tx.execute(
      sql`delete from ${schema.listings} where ${schema.listings.userId} is null and (${schema.listings.dealerId} is null or ${schema.listings.dealerId} not in ${accountDealers})`
    );
    await tx.execute(sql`delete from ${schema.dealers} where ${schema.dealers.id} not in ${accountDealers}`);

    // лишние поля (contacts) Drizzle пропускает: в таблицу попадают только её колонки.
    // База выдаёт дилерам номера (id) — по ним связываем контакты и объявления
    const inserted = await tx
      .insert(schema.dealers)
      .values(demoDealers)
      .onConflictDoNothing({ target: schema.dealers.slug }) // адрес уже занят зарегистрированным дилером
      .returning({ id: schema.dealers.id, slug: schema.dealers.slug });
    const dealerId = new Map(inserted.map((d) => [d.slug, d.id]));

    // у пропущенных дилеров (адрес занят аккаунтом) — без контактов и объявлений
    const contacts = demoDealers
      .filter((d) => dealerId.has(d.slug))
      .flatMap((d) => (d.contacts ?? []).map((c, position) => ({ ...c, dealerId: dealerId.get(d.slug)!, position })));
    if (contacts.length) await tx.insert(schema.dealerContacts).values(contacts);

    // каталог (марки и модели загружены миграциями): slug → id марки, «марка/модель» → id модели
    const catalogRows = await tx
      .select({ brandId: schema.carBrands.id, slug: schema.carBrands.slug, modelId: schema.carModels.id, model: schema.carModels.name })
      .from(schema.carModels)
      .innerJoin(schema.carBrands, eq(schema.carBrands.id, schema.carModels.brandId));
    const brandId = new Map(catalogRows.map((r) => [r.slug, r.brandId]));
    const modelId = new Map(catalogRows.map((r) => [`${r.slug}/${r.model}`, r.modelId]));

    // марки официальных дилеров
    const dealerBrands = demoDealers
      .filter((d) => dealerId.has(d.slug))
      .flatMap((d) => d.brands.filter((b) => brandId.has(b)).map((b) => ({ dealerId: dealerId.get(d.slug)!, brandId: brandId.get(b)! })));
    if (dealerBrands.length) await tx.insert(schema.dealerBrands).values(dealerBrands);

    // у дилерских объявлений имя и телефон не храним — они берутся из dealers при чтении;
    // sellerType тоже не колонка (считается по dealer_id), Drizzle его пропускает
    await tx.insert(schema.listings).values(
      allListings
        .filter((l) => !l.dealer || dealerId.has(l.dealer))
        .map(({ id, dealer, postedMinutesAgo, sellerName, phone, brand, model, ...listing }) => ({
          ...listing,
          id: Number(id),
          // модель — из каталога; демо-данные и генератор берут модели из того же каталога
          modelId: modelId.get(`${brand}/${model}`) ?? fail(`Нет модели в каталоге: ${brand} ${model}`),
          dealerId: dealer ? dealerId.get(dealer)! : null,
          sellerName: dealer ? null : sellerName,
          phone: dealer ? null : phone,
          postedAt: new Date(now - postedMinutesAgo * 60_000),
        }))
    ).onConflictDoNothing(); // номер занят объявлением пользователя — демо пропускаем

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
