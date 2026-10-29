import { loadEnvConfig } from "@next/env";
import pg from "pg";

// После тестов — удалить созданные ими аккаунты (и страницы дилеров) из базы
export default async function teardown() {
  loadEnvConfig(process.cwd());
  const client = new pg.Client({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(
      "delete from dealers where id in (select p.dealer_id from profiles p join auth.users u on u.id = p.id where u.email like 'qa.e2e-%@bestauto-qa.lv')"
    );
    await client.query("delete from auth.users where email like 'qa.e2e-%@bestauto-qa.lv'");
  } finally {
    await client.end();
  }
}
