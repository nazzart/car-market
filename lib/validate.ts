// Проверка ввода — одна и та же в формах (браузер) и в Server Actions (сервер, где ей нельзя доверять меньше)

// Строка из формы: без пробелов по краям и не длиннее max; не строка — пустая
export const cleanText = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export const isEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

// Номер объявления в URL и запросах — строка из цифр
export const isListingId = (id: unknown): id is string => typeof id === "string" && /^\d{1,15}$/.test(id);

export function parseListingId(id: unknown): number {
  if (!isListingId(id)) throw new Error("Неверный номер объявления");
  return Number(id);
}

// Регистрационный номер компании в Латвии: 11 цифр, пробелы при вводе допустимы
export const normalizeRegNumber = (value: string) => value.replace(/\s/g, "");
export const isRegNumber = (value: unknown): value is string =>
  typeof value === "string" && /^\d{11}$/.test(normalizeRegNumber(value));
