// Версия внутри модели («530d xDrive», «E 220 CDI»): заголовок объявления, приведение ввода к одному виду,
// группа для фильтра и поиск модели по версии. Версии модели из каталога (car_versions) передаёт вызывающий
import type { Fuel } from "../types";

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
// Допустимые знаки версии: буквы, цифры, пробел и «- . + /» — без ссылок, @ и восклицательных знаков
const NOT_ALLOWED = /[^\p{L}\p{N}\s.+/-]/gu;

// known — версии модели из каталога
export function normalizeVersion(raw: string, known: string[] = []): string {
  const value = raw.replace(NOT_ALLOWED, "").replace(/\s+/g, " ").trim().slice(0, MAX_LENGTH);
  if (!value) return "";

  const match = known.find((v) => compact(v) === compact(value));
  if (match) return match;

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

// Модель в списке формы подачи подходит под ввод: по названию или по версии из каталога («530d» → 5 Series)
export function modelMatches(model: string, text: string, versions: string[] = []) {
  const query = compact(text);
  if (!query) return true;
  return compact(model).includes(query) || versions.some((v) => compact(v).startsWith(query));
}

// Ввод в поле модели — это версия из каталога («530d», «530 D»)? Тогда её каталожное написание
export function versionFromQuery(text: string, versions: string[]): string | undefined {
  const query = compact(text);
  return query ? versions.find((v) => compact(v) === query) : undefined;
}

// Версия однозначно говорит о топливе: 530d, E 220 CDI — дизель; 530e, E 300 de — гибрид; 530i, 1.4 TSI — бензин.
// Для подсказки в форме подачи (продавец может поменять); undefined — непонятно
export function fuelOfVersion(version: string): Fuel | undefined {
  const v = version.trim();
  // строчные буквы — с учётом регистра: «E 220 d» — класс E, дизель; «E 300 e» — гибрид
  if (/\d{2,3}e\b|\s(de|e)\b/.test(v)) return "hybrid";
  if (/\d{2,3}d\b|\sd\b/.test(v) || /\b(CDI|BlueTEC|TDI|HDi|dCi|CRDi|TDCi)\b/i.test(v)) return "diesel";
  if (/\d{2,3}i\b/.test(v) || /\b(TFSI|TSI|GTI|CGI|Kompressor)\b/i.test(v)) return "petrol";
  return undefined;
}
