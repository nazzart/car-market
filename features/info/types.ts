// Текстовые страницы: «О нас», правила, конфиденциальность, контакты
export const INFO_PAGES = ["about", "rules", "privacy", "contacts"] as const;
export type InfoPageKey = (typeof INFO_PAGES)[number];

// Раздел страницы в messages/*.json: заголовок и абзацы
export type InfoSection = { title: string; text: string[] };
