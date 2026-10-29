"use server";

// Вход, регистрация, выход и смена пароля — Supabase Auth на сервере: сессия ставится в cookie ответа.
// Пароль в наш код и в нашу базу не попадает: его проверяет и хранит Supabase
import { updateTag } from "next/cache";
import { headers } from "next/headers";

import { createSupabase } from "@/lib/supabase/server";

import { type SignUpMeta, createProfile, getSessionUser, loadUser } from "./api";
import type { User } from "./types";

export type AuthResult = { user: User } | { error: "invalid" | "exists" | "weak" | "rateLimit" | "failed" };

const isEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Ошибки Supabase → понятные причины для формы
function reason(code?: string): Exclude<AuthResult, { user: User }>["error"] {
  if (code === "invalid_credentials") return "invalid";
  if (code === "user_already_exists" || code === "email_exists") return "exists";
  if (code === "weak_password") return "weak";
  if (code?.startsWith("over_")) return "rateLimit";
  return "failed";
}

export async function loadCurrentUser(): Promise<User | null> {
  return getSessionUser();
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!isEmail(email) || typeof password !== "string" || !password) return { error: "invalid" };

  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error) return { error: reason(error.code) };

  return { user: await loadUser(data.user.id, data.user.email ?? "", data.user.user_metadata) };
}

export type SignUpInput = SignUpMeta & { email: string; password: string };

// Регистрация. Пока подтверждение email в Supabase выключено — пользователь сразу входит.
// Когда включим (с почтой через Resend) — вернётся confirmEmail: «проверьте почту»
export async function signUp(input: SignUpInput): Promise<AuthResult | { confirmEmail: true }> {
  const name = typeof input?.name === "string" ? input.name.trim().slice(0, 120) : "";
  const type = input?.type === "dealer" ? "dealer" : "individual";
  const regNumber = typeof input?.regNumber === "string" ? input.regNumber.replace(/\s/g, "") : undefined;
  if (!name || !isEmail(input.email) || typeof input.password !== "string" || input.password.length < 8) {
    return { error: "failed" };
  }
  if (type === "dealer" && !/^\d{11}$/.test(regNumber ?? "")) return { error: "failed" };

  const meta: SignUpMeta = { type, name, ...(type === "dealer" ? { regNumber } : {}) };
  const supabase = await createSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: { data: meta },
  });
  if (error) return { error: reason(error.code) };
  // Supabase не сообщает, что email уже занят (защита от перебора): такой пользователь приходит без identities
  if (!data.user || data.user.identities?.length === 0) return { error: "exists" };

  await createProfile(data.user.id, meta);
  if (type === "dealer") updateTag("dealers"); // новая страница дилера — в каталог (модерация, кабинет)
  if (!data.session) return { confirmEmail: true };

  return { user: await loadUser(data.user.id, data.user.email ?? "", meta) };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabase();
  await supabase.auth.signOut();
}

// Письмо со ссылкой на смену пароля. Ответ одинаковый, есть такой email или нет
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { error: "rateLimit" }> {
  if (!isEmail(email)) return { ok: true };
  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${origin}/api/auth/callback?next=/account/password`,
  });
  return error?.code?.startsWith("over_") ? { error: "rateLimit" } : { ok: true };
}

// Новый пароль — по ссылке из письма (после неё пользователь уже вошёл) или из настроек
export async function updatePassword(password: string): Promise<{ ok: true } | { error: "weak" | "failed" }> {
  if (typeof password !== "string" || password.length < 8) return { error: "weak" };
  if (!(await getSessionUser())) return { error: "failed" };
  const supabase = await createSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  return error ? { error: error.code === "weak_password" ? "weak" : "failed" } : { ok: true };
}

// Смена пароля в настройках: сначала проверяем текущий пароль
export async function changePassword(current: string, next: string): Promise<{ ok: true } | { error: "invalid" | "weak" | "failed" }> {
  const user = await getSessionUser();
  if (!user || typeof current !== "string" || !current) return { error: "invalid" };
  const supabase = await createSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (error) return { error: "invalid" };
  return updatePassword(next);
}
