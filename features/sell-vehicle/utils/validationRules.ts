import { isPhone } from "@/lib/phone";
import { youtubeId } from "@/lib/youtube";

const rulesMap: Record<string, (value: unknown) => boolean> = {
  required: (v) => {
    if (Array.isArray(v)) return v.length > 0;

    return typeof v === "string" ? v.trim() !== "" : Boolean(v);
  },

  // остальные правила проверяют только заполненные строки; пустое поле — дело правила required
  email: (v) => typeof v !== "string" || !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),

  phone: (v) => typeof v !== "string" || !v || isPhone(v),

  youtube: (v) => typeof v !== "string" || !v || youtubeId(v) !== null,

  isEngineCapacity: (v) => typeof v !== "string" || !v || /^\d+(\.\d{1,2})?$/.test(v),
};

// 🔥 универсальная проверка одного поля
export const validateField = (value: unknown, rules: string[] = []) => {
  for (const rule of rules) {
    const validator = rulesMap[rule];

    if (!validator) continue;

    if (!validator(value)) {
      return false;
    }
  }

  return true;
};
