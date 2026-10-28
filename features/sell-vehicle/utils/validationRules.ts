import { youtubeId } from "@/lib/youtube";

export const rulesMap: Record<string, (value: any) => boolean> = {
  required: (v) => {
    if (Array.isArray(v)) return v.length > 0;

    return typeof v === "string" ? v.trim() !== "" : Boolean(v);
  },

  email: (v) => {
    if (!v) return true; // optional safe
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  },

  phone: (v) => {
    if (!v) return true;
    return /^\+?[0-9]{7,15}$/.test(v);
  },

  youtube: (v) => {
    if (!v) return true; // необязательно
    return youtubeId(v) !== null;
  },

  isEngineCapacity: (v) => {
    if (!v) return true;
  
    return /^\d+(\.\d{1,2})?$/.test(v);
  },
};

// 🔥 универсальная проверка одного поля
export const validateField = (value: any, rules: string[] = []) => {
  for (const rule of rules) {
    const validator = rulesMap[rule];

    if (!validator) continue;

    if (!validator(value)) {
      return false;
    }
  }

  return true;
};
