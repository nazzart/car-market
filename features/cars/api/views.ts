// Просмотры объявления: каждый посетитель считается один раз в сутки. IP не храним — это персональные данные:
// в listing_views лежит только необратимый хеш (IP + браузер + день + объявление + секрет), записи старше 2 дней удаляются.
// Не считаются: роботы, сам продавец, объявления, которых покупатели не видят (на проверке, скрытые, заблокированные)
import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";

import type { User } from "@/features/auth/types";
import { db } from "@/lib/db";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|curl|wget|python|axios|node-fetch/i;
// секрет для хеша: без него по хешу можно было бы перебрать IP. Отдельная переменная или строка подключения к базе
const SECRET = process.env.VIEWS_SECRET ?? process.env.DATABASE_URL ?? "";

// день по Риге — «сегодня» для посетителя сайта
const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Riga" });

// Посетитель: хеш из заголовков запроса; null — робот
async function visitor(listingId: number): Promise<string | null> {
  const h = await headers();
  const agent = h.get("user-agent") ?? "";
  if (!agent || BOT.test(agent)) return null;
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  return createHash("sha256").update(`${SECRET}|${today()}|${listingId}|${ip}|${agent}`).digest("base64url").slice(0, 32);
}

export async function recordView(listingId: number, user: User | null): Promise<void> {
  const key = await visitor(listingId);
  if (!key) return;

  // одним запросом: запомнить посетителя (если сегодня ещё не был) и только тогда +1 к просмотрам
  await db.execute(sql`
    with seen as (
      insert into listing_views (listing_id, visitor)
      select l.id, ${key} from listings l
      where l.id = ${listingId}
        and l.review is null and l.status = 'active' and l.moderation_status is null
        -- своё объявление продавец не накручивает (без входа — сравнивать не с кем)
        and (${user?.id ?? null}::uuid is null or l.user_id is distinct from ${user?.id ?? null}::uuid)
        and not exists (select 1 from dealers d where d.id = l.dealer_id and d.slug = ${user?.dealerSlug ?? null})
      on conflict do nothing
      returning listing_id
    )
    update listings set views = views + 1 where id in (select listing_id from seen)
  `);

  // уборка: изредка удаляем вчерашние и более старые отметки (хватает индекса по created_at)
  if (Math.random() < 0.02) await db.execute(sql`delete from listing_views where created_at < now() - interval '2 days'`);
}
