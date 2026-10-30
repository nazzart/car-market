// Добавляет в каталог базы новое из scripts/catalog/rdw-catalog.json (после npm run catalog:build).
//   npm run catalog:import
// Только добавляет: то, что модератор переименовал, скрыл или удалил в /admin, не трогается
// (переименованная в /admin модель может вернуться под прежним названием — тогда её стоит скрыть)
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

import catalog from "./catalog/rdw-catalog.json";

loadEnvConfig(process.cwd());
const pool = new Pool({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL!, max: 1 });

async function main() {
  const client = await pool.connect();
  let brands = 0;
  let models = 0;
  let versions = 0;
  try {
    await client.query("begin");
    for (const b of catalog.brands) {
      const r = await client.query("insert into car_brands (slug, name, popular) values ($1, $2, $3) on conflict do nothing", [b.slug, b.name, b.popular]);
      brands += r.rowCount ?? 0;
    }
    for (const [brand, list] of Object.entries(catalog.models as Record<string, string[]>)) {
      for (const name of list) {
        const r = await client.query(
          "insert into car_models (brand_id, name) select id, $2 from car_brands where slug = $1 on conflict do nothing",
          [brand, name]
        );
        models += r.rowCount ?? 0;
      }
    }
    for (const [brand, byModel] of Object.entries(catalog.versions as Record<string, Record<string, string[]>>)) {
      for (const [model, list] of Object.entries(byModel)) {
        for (const name of list) {
          const r = await client.query(
            "insert into car_versions (model_id, name) select m.id, $3 from car_models m join car_brands b on b.id = m.brand_id where b.slug = $1 and m.name = $2 on conflict do nothing",
            [brand, model, name]
          );
          versions += r.rowCount ?? 0;
        }
      }
    }
    await client.query("commit");
    console.log(`Добавлено: ${brands} марок, ${models} моделей, ${versions} версий`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}
main();
