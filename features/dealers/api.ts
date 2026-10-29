// Единственная точка доступа к каталогу дилеров: компоненты и страницы не импортируют data/ напрямую.
// Сейчас — демо-массив; TODO(backend): заменить тела функций на запросы к БД/API, интерфейс оставить
import { dealers } from "./data/dealers";
import type { Dealer } from "./types";

const findBySlug = (slug: string | null | undefined) => (slug ? dealers.find((d) => d.slug === slug) : undefined);

/* ---------- Сервер: страницы, метаданные, sitemap ---------- */

export async function getDealer(slug: string): Promise<Dealer | undefined> {
  return findBySlug(slug);
}

export async function getDealers(): Promise<Dealer[]> {
  return dealers;
}

/* ---------- Клиент: хуки. TODO(backend): запрос с кэшем (SWR / React Query) с тем же результатом ---------- */

// Весь каталог, включая заблокированных (модерация). Для покупателей — useDealers() из ./useDealers
export function useDealerCatalog(): Dealer[] {
  return dealers;
}

export function useDealerLookup(): (slug: string | null | undefined) => Dealer | undefined {
  return findBySlug;
}
