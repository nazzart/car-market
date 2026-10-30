// Аккаунты на сервере: кто вошёл (сессия Supabase Auth в cookie) и его профиль из таблицы profiles.
// Каждая Server Action, которая что-то меняет, сначала вызывает requireUser() / requireAdmin()
import "server-only";

import { cache } from "react";
import { and, desc, eq, ne, sql } from "drizzle-orm";

import { db, schema } from "@/lib/db";
import { foldText, placePointOrRiga } from "@/lib/places";
import { createSupabase } from "@/lib/supabase/server";

import type { User } from "./types";

const { profiles, dealers } = schema;

// Что передаём в Supabase при регистрации (user_metadata) — по нему создаётся профиль
export type SignUpMeta = { type: "individual" | "dealer"; name: string; regNumber?: string };

const profileColumns = {
  id: profiles.id,
  type: profiles.type,
  name: profiles.name,
  phone: profiles.phone,
  city: profiles.city,
  role: profiles.role,
  createdAt: profiles.createdAt,
  blockedReason: profiles.blockedReason,
  blockedNote: profiles.blockedNote,
  blockedAt: profiles.blockedAt,
  dealerSlug: dealers.slug,
};

type ProfileRow = Awaited<ReturnType<typeof profileRows>>[number];
const profileRows = (where?: ReturnType<typeof eq>) =>
  db.select(profileColumns).from(profiles).leftJoin(dealers, eq(dealers.id, profiles.dealerId)).where(where);

function toUser(row: ProfileRow, email: string): User {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    email,
    phone: row.phone,
    ...(row.city ? { city: row.city } : {}),
    since: row.createdAt.getFullYear(),
    ...(row.dealerSlug ? { dealerSlug: row.dealerSlug } : {}),
    ...(row.role ? { role: row.role } : {}),
    ...(row.blockedReason && row.blockedAt
      ? { blocked: { reason: row.blockedReason, note: row.blockedNote ?? undefined, at: row.blockedAt.getTime() } }
      : {}),
  };
}

// «Baltic Auto» → «baltic-auto»; занятый адрес получает номер: «baltic-auto-2»
async function freeDealerSlug(name: string) {
  const base = foldText(name).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dealer";
  const taken = new Set(
    (await db.select({ slug: dealers.slug }).from(dealers).where(sql`${dealers.slug} like ${base + "%"}`)).map(
      (r) => r.slug
    )
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

// Регистрационный номер уже у другой страницы дилера (одна компания — одна страница; dealers_reg_number_unique)
export async function regNumberTaken(regNumber: string, exceptDealerId?: number): Promise<boolean> {
  const [row] = await db
    .select({ id: dealers.id })
    .from(dealers)
    .where(and(eq(dealers.regNumber, regNumber), exceptDealerId === undefined ? undefined : ne(dealers.id, exceptDealerId)))
    .limit(1);
  return Boolean(row);
}

const isUniqueViolation = (error: unknown) =>
  (error as { code?: string })?.code === "23505" || (error as { cause?: { code?: string } })?.cause?.code === "23505";

// Профиль нового пользователя. Город не спрашиваем при регистрации — его выберут в настройках
// или в первом объявлении. У компании сразу создаётся страница дилера, но покупатели увидят её,
// когда дилер укажет адрес и телефон (lib/listed.ts); значок «Проверенный» — после проверки модератором
export async function createProfile(id: string, meta: SignUpMeta) {
  const city = "riga"; // место-заглушка для пустой страницы дилера: заменится адресом из настроек
  await db.transaction(async (tx) => {
    let dealerId: number | null = null;
    if (meta.type === "dealer") {
      const values = {
        slug: await freeDealerSlug(meta.name),
        name: meta.name,
        type: "used" as const,
        city,
        address: "",
        ...placePointOrRiga(city),
        phone: "",
        regNumber: meta.regNumber ?? null,
        since: new Date().getFullYear(),
      };
      // номер успели занять между проверкой в signUp и этой записью — страница без номера (дилер укажет
      // и модератор разберётся), но аккаунт не остаётся без профиля
      const insert = (regNumber: string | null) =>
        tx.transaction((sp) => sp.insert(dealers).values({ ...values, regNumber }).returning({ id: dealers.id }));
      const [dealer] = await insert(values.regNumber).catch((error) => {
        if (values.regNumber && isUniqueViolation(error)) return insert(null);
        throw error;
      });
      dealerId = dealer.id;
    }
    await tx.insert(profiles).values({ id, type: meta.type, name: meta.name, dealerId }).onConflictDoNothing();
  });
}

// Пользователь по id из Supabase Auth. Профиль не создался при регистрации (сбой между шагами) —
// создаём его по данным, переданным при регистрации (user_metadata)
export async function loadUser(id: string, email: string, metadata: Partial<SignUpMeta> = {}): Promise<User> {
  let [row] = await profileRows(eq(profiles.id, id));
  if (!row) {
    await createProfile(id, {
      type: metadata.type === "dealer" ? "dealer" : "individual",
      name: metadata.name || email.split("@")[0],
      regNumber: metadata.regNumber,
    });
    [row] = await profileRows(eq(profiles.id, id));
  }
  return toUser(row, email);
}

// Вошедший пользователь (один раз на запрос). null — не вошёл
export const getSessionUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabase();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return loadUser(claims.sub, String(claims.email ?? ""), (claims.user_metadata ?? {}) as Partial<SignUpMeta>);
});

export class AuthError extends Error {}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new AuthError("Нужно войти");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError("Только для модераторов");
  return user;
}

// Все зарегистрированные — для модерации (email — из auth.users). TODO(admin): постранично и с поиском
export async function getRegisteredUsers(): Promise<User[]> {
  await requireAdmin();
  const rows = await db
    .select({ ...profileColumns, email: sql<string>`(select email from auth.users u where u.id = ${profiles.id})` })
    .from(profiles)
    .leftJoin(dealers, eq(dealers.id, profiles.dealerId))
    .orderBy(desc(profiles.createdAt));
  return rows.map((row) => toUser(row, row.email ?? ""));
}
