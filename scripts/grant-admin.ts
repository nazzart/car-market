// Сделать пользователя модератором (доступ к /admin). Аккаунт должен уже быть зарегистрирован на сайте:
//   npm run admin:grant -- you@example.com
//   npm run admin:grant -- you@example.com --revoke
import { loadEnvConfig } from "@next/env";
import { Pool } from "pg";

loadEnvConfig(process.cwd());

const email = process.argv[2]?.trim().toLowerCase();
const revoke = process.argv.includes("--revoke");
if (!email?.includes("@")) {
  console.error("Укажите email: npm run admin:grant -- you@example.com");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL, max: 1 });

pool
  .query(
    `update profiles set role = $2 where id = (select id from auth.users where lower(email) = $1) returning name`,
    [email, revoke ? null : "admin"]
  )
  .then(({ rows }) => {
    if (!rows.length) console.error(`Нет зарегистрированного пользователя ${email} — сначала зарегистрируйтесь на сайте`);
    else console.log(revoke ? `${rows[0].name} больше не модератор` : `${rows[0].name} теперь модератор: /admin`);
  })
  .finally(() => pool.end());
