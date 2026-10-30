// Каталог марок, моделей и версий (таблицы car_brands, car_models, car_versions; правка — /admin, вкладка «Katalogs»)

// slug — адрес и фильтр (/cars?brand=bmw)
export type Brand = { slug: string; name: string; popular: boolean };

// Модель марки с версиями («5 Series» → «520d», «530d xDrive»…) — в форме подачи и фильтрах
export type CatalogModel = { name: string; versions: string[] };

/* ---------- Модерация (/admin, вкладка «Katalogs») ---------- */

export type AdminBrand = Brand & { hidden: boolean; models: number; listings: number };
export type AdminModel = { id: number; name: string; hidden: boolean; listings: number; versions: AdminVersion[] };
export type AdminVersion = { id: number; name: string };

// Результат правки: ошибка — для сообщения модератору
export type CatalogResult = { ok: true } | { ok: false; error: "invalid" | "exists" | "inUse" };
