// Доступ к аккаунтам. Сейчас — демо-аккаунты; TODO(backend): Auth.js / Supabase и таблица users
import { DEMO_PASSWORD, demoUsers } from "./data/demoUsers";
import type { User } from "./types";

// Вход по email и паролю; undefined — неверные данные
export async function signInWithPassword(email: string, password: string): Promise<User | undefined> {
  return password === DEMO_PASSWORD ? demoUsers.find((u) => u.email === email.trim().toLowerCase()) : undefined;
}

// Кнопки быстрого входа на странице логина (только в демо)
export const demoAccounts: User[] = demoUsers;
export { DEMO_PASSWORD };

// Зарегистрированные частные продавцы — для модерации. TODO(backend): запрос с пагинацией
export function useRegisteredUsers(): User[] {
  return demoUsers;
}
