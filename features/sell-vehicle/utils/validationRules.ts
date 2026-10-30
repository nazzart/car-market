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

  // лизинг — те же пределы, что в базе (listings_leasing): платёж > 0, взнос 0–90 %, срок 6–120 мес.
  leasingMonthly: (v) => typeof v !== "string" || !v || (/^\d+$/.test(v) && Number(v) > 0),
  leasingDownPayment: (v) => typeof v !== "string" || !v || (/^\d+$/.test(v) && Number(v) <= 90),
  leasingMonths: (v) => typeof v !== "string" || !v || (/^\d+$/.test(v) && Number(v) >= 6 && Number(v) <= 120),
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
