// Версия внутри модели («530d xDrive», «E 220 CDI»): заголовок объявления, приведение ввода к одному виду,
// группа для фильтра и поиск модели по версии. Подсказки — features/brands/data/versions.ts (из каталога RDW)
import { versionsByModel } from "@/features/brands/data/versions";

const MAX_LENGTH = 40;

// Сравнение без регистра и пробелов: «530 D» = «530d», «e220d» = «E 220 d»
const compact = (value: string) => value.toLowerCase().replace(/[\s-]+/g, "");

// Версия уже называет модель — модель в заголовке не повторяем: 5 Series + 530d → «BMW 530d», CL + CL 500 → «… CL 500»
function versionNamesModel(model: string, version: string) {
  if (version.toLowerCase().startsWith(`${model.toLowerCase()} `)) return true;
  const series = model.match(/^(\d) Series$/);
  if (series && new RegExp(`^M?${series[1]}\\d\\d`).test(version)) return true;
  const mbClass = model.match(/^([A-Z])-Class$/);
  return Boolean(mbClass && version.startsWith(`${mbClass[1]} `));
}

// Заголовок объявления — всегда из марки, модели и версии (свой заголовок продавец не пишет)
export function listingTitle(brandName: string, model: string, version?: string | null) {
  const v = version?.trim();
  const showModel = model && !(v && versionNamesModel(model, v));
  return [brandName, showModel ? model : null, v || null].filter(Boolean).join(" ");
}

// Заголовок поиска /cars: «BMW», «BMW 5 Series», с версиями — «BMW 530d, 530e»
export function searchTitle(brandName: string, model: string | null, versions: string | null) {
  const list = versions?.split(",").filter(Boolean).join(", ");
  if (!model) return [brandName, list].filter(Boolean).join(" ");
  return listingTitle(brandName, model, list);
}

// Ввод продавца → единый вид: как в подсказке, если совпадает с ней; иначе — привычное написание частей
export function normalizeVersion(brand: string, model: string, raw: string): string {
  const value = raw.replace(/\s+/g, " ").trim().slice(0, MAX_LENGTH);
  if (!value) return "";

  const known = (versionsByModel[brand]?.[model] ?? []).find((v) => compact(v) === compact(value));
  if (known) return known;

  return value
    .replace(/^(m?)(\d{3})\s?([a-z]{1,2})\b/i, (_, m: string, n: string, s: string) => `${m.toUpperCase()}${n}${s.toLowerCase()}`)
    .replace(/\b([xse])drive/gi, (_, l: string) => `${l.toLowerCase()}Drive`)
    .replace(/\b(4matic|amg|cdi|cgi|tdi|tfsi|tsi|hdi|dci|gti|gtd)\b/gi, (word) => word.toUpperCase());
}

// Группа версии для фильтра — как о машине говорят: «BMW 530», «Mercedes E 220».
// «530d xDrive Touring» → «530», «M550i» → «M550», «xDrive30d» → «xDrive30», «E 220 CDI» → «E 220», «45 TDI Avant» → «45 TDI».
// Дизель, бензин или гибрид (d / i / e) — это фильтр топлива
export function versionGroup(version: string): string {
  const v = version.trim();
  const match =
    v.match(/^M?\d{3}(?!\d)/) ?? // 530d, M550i, 320
    v.match(/^[xse]Drive\d{2}/) ?? // xDrive30d
    v.match(/^M\d{2}(?!\d)/) ?? // M50d
    v.match(/^(?:AMG )?[A-Z]{1,3} \d{2,3}(?!\d)/) ?? // E 220 d, CL 500, AMG GT 43
    v.match(/^\d{2,3} [A-Z]{2,4}\b/); // 45 TDI
  return match ? match[0] : v.split(" ")[0];
}

// Версия входит в группу: «530» — 530d, 530e xDrive, но не 5300; «530d» — 530d xDrive, но не 530de.
// Регулярное выражение для Postgres (~), в нижнем регистре
export function versionGroupPattern(group: string): string {
  const g = group.trim().toLowerCase();
  const escaped = g.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return `^${escaped}(${/\d$/.test(g) ? "[^0-9]" : "[^a-z0-9]"}|$)`;
}

// Группы версий модели из каталога (для формы подачи): 5 Series → 518, 520, 523, 525, 530…
export function catalogVersionGroups(brand: string, model: string): string[] {
  return [...new Set((versionsByModel[brand]?.[model] ?? []).map(versionGroup))];
}

// Вариант списка моделей подходит под ввод: модель — по названию; версия — по своей группе, модели
// или полной версии из каталога («530d» → 530 под 5 Series)
export function modelEntryMatches(brand: string, entry: { model: string; version?: string }, text: string) {
  const query = compact(text);
  if (!query) return true;
  if (!entry.version) return compact(entry.model).includes(query);
  const full = (versionsByModel[brand]?.[entry.model] ?? []).filter((v) => versionGroup(v) === entry.version);
  return (
    compact(entry.version).startsWith(query) ||
    compact(`${entry.model}${entry.version}`).includes(query) ||
    full.some((v) => compact(v).startsWith(query))
  );
}
