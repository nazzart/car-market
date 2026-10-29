import type { AccountBlock } from "@/features/moderation/types";

// Вошедший пользователь: профиль из таблицы profiles + email из Supabase Auth
export type User = {
  id: string; // uuid из Supabase Auth
  type: "individual" | "dealer";
  name: string;
  email: string;
  phone: string;
  city?: string; // ключ места из lib/places.ts (город или край); нет — ещё не выбрал
  since: number; // год регистрации
  dealerSlug?: string; // для дилера — его страница /dealers/[slug]
  role?: "admin"; // модератор: доступ к /admin
  blocked?: AccountBlock; // аккаунт заблокирован модератором
};

export const isAdmin = (user: User | null | undefined) => user?.role === "admin";
