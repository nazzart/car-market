// Аккаунты на сервере: кто вошёл (сессия Supabase Auth в cookie) и его профиль из таблицы profiles.
// Каждая Server Action, которая что-то меняет, сначала вызывает requireUser() / requireAdmin()
import "server-only";

import { cache } from "react";
import { desc, eq, sql } from "drizzle-orm";

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
    city: row.city,
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

// Профиль нового пользователя. У компании сразу появляется страница дилера — без значка «Проверенный»,
// пока модератор не сверит регистрационный номер. Адрес, часы и телефон дилер заполнит в настройках
export async function createProfile(id: string, meta: SignUpMeta) {
  const city = "riga";
  await db.transaction(async (tx) => {
    let dealerId: number | null = null;
    if (meta.type === "dealer") {
      const [dealer] = await tx
        .insert(dealers)
        .values({
          slug: await freeDealerSlug(meta.name),
          name: meta.name,
          type: "used",
          city,
          address: "",
          ...placePointOrRiga(city),
          phone: "",
          regNumber: meta.regNumber ?? null,
          since: new Date().getFullYear(),
        })
        .returning({ id: dealers.id });
      dealerId = dealer.id;
    }
    await tx.insert(profiles).values({ id, type: meta.type, name: meta.name, city, dealerId }).onConflictDoNothing();
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
