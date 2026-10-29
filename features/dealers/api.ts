// Дилеры на сервере: SQL-запросы к таблицам dealers и dealer_contacts. Страницы и sitemap вызывают эти функции,
// клиентские компоненты — хуки из ./hooks. Кэш с тегом "dealers"; после изменения — revalidateTag("dealers")
import "server-only";

import { unstable_cache } from "next/cache";
import { asc } from "drizzle-orm";

import { db, schema } from "@/lib/db";

import type { Dealer, DealerContact } from "./types";

const { dealers, dealerContacts } = schema;

type Row = typeof dealers.$inferSelect;

function toDealer(row: Row, contacts: DealerContact[]): Dealer {
  // необязательные поля без значения — undefined, как в типе Dealer; служебные даты наружу не отдаём
  const fields = Object.fromEntries(
    Object.entries(row).filter(([key, value]) => value !== null && key !== "createdAt")
  );
  return { ...(fields as Omit<Dealer, "contacts">), ...(contacts.length ? { contacts } : {}) };
}

// Дилеров немного (сотни), поэтому каталог читается целиком двумя запросами и кэшируется
const catalog = unstable_cache(
  async () => {
    const [rows, contacts] = await Promise.all([
      db.select().from(dealers).orderBy(asc(dealers.name)),
      db.select().from(dealerContacts).orderBy(asc(dealerContacts.dealerSlug), asc(dealerContacts.position)),
    ]);
    return rows.map((row) =>
      toDealer(
        row,
        contacts
          .filter((c) => c.dealerSlug === row.slug)
          .map(({ id, name, phone, role }) => ({ id, name, phone, ...(role ? { role } : {}) }))
      )
    );
  },
  ["dealers", "catalog"],
  { tags: ["dealers"], revalidate: 300 }
);

export async function getDealer(slug: string): Promise<Dealer | undefined> {
  return (await catalog()).find((d) => d.slug === slug);
}

// Весь каталог, включая заблокированных (модерация). Для покупателей — useDealers() из ./useDealers
export async function getDealers(): Promise<Dealer[]> {
  return catalog();
}
