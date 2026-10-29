// Собирает список адресов Латвии из Государственного адресного регистра (VZD, открытые данные, CC BY 4.0).
// Сайт ищет адреса по этому файлу сам — без внешних геокодеров.
//
//   npm run addresses:build → .data/addresses.tsv   (~550 000 адресов: улица, город, индекс, координаты)
//                             .data/address-keys.txt (то же для поиска: без диакритики, по строке на адрес)
//                             .data/address-points.bin (координаты подряд, Float64: lat, lng, lat, lng…)
// Сервер (features/addresses/addressIndex.ts) только читает эти файлы — быстро и без лишней памяти
//
// Регистр обновляется ежедневно; нам достаточно раз в месяц.
import { createReadStream, createWriteStream, mkdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline";

const ROOT = new URL("..", import.meta.url).pathname;
const CACHE = join(ROOT, ".cache", "addresses");
const OUT_DIR = join(ROOT, ".data");
const OUT = join(OUT_DIR, "addresses.tsv");

const DATASET = "https://data.gov.lv/dati/api/3/action/package_show?id=varis-atvertie-dati";

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
}

// Ссылки на файлы берём из описания набора данных: адреса файлов в портале меняются
const { result } = await (await fetch(DATASET)).json();
const fileUrl = (name) => result.resources.find((r) => r.url.endsWith(`/${name}`))?.url;

mkdirSync(CACHE, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

console.log("Скачиваю адреса из регистра VZD (~140 МБ)…");
await download(fileUrl("aw_pilseta.csv"), join(CACHE, "aw_pilseta.csv"));
await download(fileUrl("aw_eka.csv"), join(CACHE, "aw_eka.csv"));

// Простой разбор CSV: поля в кавычках, кавычка внутри — удвоенная
function parseCsvLine(line) {
  const out = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted && ch === '"' && line[i + 1] === '"') {
      field += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(field);
      field = "";
    } else {
      field += ch;
    }
  }
  out.push(field);
  return out;
}

async function* readCsv(file) {
  const lines = createInterface({ input: createReadStream(file, "utf8"), crlfDelay: Infinity });
  let header;
  for await (const raw of lines) {
    const line = raw.replace(/^﻿/, "");
    if (!line) continue;
    const cells = parseCsvLine(line);
    if (!header) header = cells;
    else yield Object.fromEntries(header.map((h, i) => [h, cells[i]]));
  }
}

// Города — чтобы отличить «Ogre» (город) от «Gaiķi» (село)
const towns = new Set();
for await (const row of readCsv(join(CACHE, "aw_pilseta.csv"))) if (row.STATUSS === "EKS") towns.add(row.NOSAUKUMS);

// «Pieneņu ceļš 8, Ogre, Ogres nov., LV-5001» → улица «Pieneņu ceļš 8», город «Ogre»
// «"Druvas 1", Gaiķi, Gaiķu pag., Saldus nov., LV-3873» → «"Druvas 1", Gaiķi, Gaiķu pag.», край «Saldus novads»
function split(std) {
  const parts = std.split(", ");
  const postcode = /^LV-\d{4}$/.test(parts.at(-1)) ? parts.pop() : "";
  const townAt = parts.findIndex((p, i) => i > 0 && towns.has(p));
  if (townAt > 0) return { street: parts.slice(0, townAt).join(", "), city: parts[townAt], postcode };

  const novads = parts.at(-1)?.endsWith(" nov.") ? parts.pop().replace(/ nov\.$/, " novads") : "";
  return novads && parts.length ? { street: parts.join(", "), city: novads, postcode } : null;
}

// Ключ поиска — как searchKey() в addressIndex.ts: без диакритики, нижний регистр, только буквы и цифры.
// Улица и город разделены табуляцией, чтобы сервер мог отличить «набран город» от «совпала улица»
const fold = (text) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const searchKey = (street, city) => ` ${fold(street)} \t ${fold(city)} `.replace(/[^\x00-\x7f]/g, "");

const tmp = `${OUT}.part`;
const out = createWriteStream(tmp);
const keys = createWriteStream(join(OUT_DIR, "address-keys.txt.part"));
const points = [];
let count = 0;

for await (const row of readCsv(join(CACHE, "aw_eka.csv"))) {
  // только существующие адреса (не ликвидированные, не ошибочные и не «планируемые»)
  if (row.STATUSS !== "EKS" || row.PLAN_ADR === "Y" || !row.DD_N || !row.DD_E) continue;
  const parsed = split(row.STD);
  if (!parsed) continue;
  const lat = Number(Number(row.DD_N).toFixed(5));
  const lng = Number(Number(row.DD_E).toFixed(5));
  out.write(`${parsed.street}\t${parsed.city}\t${parsed.postcode}\t${lat}\t${lng}\n`);
  keys.write(`${searchKey(parsed.street, parsed.city)}\n`);
  points.push(lat, lng);
  count++;
}

await new Promise((resolve) => out.end(resolve));
await new Promise((resolve) => keys.end(resolve));
writeFileSync(join(OUT_DIR, "address-points.bin.part"), new Uint8Array(Float64Array.from(points).buffer));
// заменяем все три файла вместе, когда все готовы — сервер не увидит наполовину обновлённые данные
renameSync(tmp, OUT);
renameSync(join(OUT_DIR, "address-keys.txt.part"), join(OUT_DIR, "address-keys.txt"));
renameSync(join(OUT_DIR, "address-points.bin.part"), join(OUT_DIR, "address-points.bin"));
console.log(`Готово: .data/addresses.tsv — ${count} адресов, ${Math.round(statSync(OUT).size / 1e6)} МБ`);
