// Поиск адресов Латвии по файлу из Государственного адресного регистра (npm run addresses:build).
// Только для сервера (API-маршруты): файл читается один раз и держится в памяти (~545 000 адресов, ~100 МБ).
// TODO(backend): перенести в БД (таблица адресов + поиск по триграммам и ближайшей точке)
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { foldText } from "@/lib/places";

import type { AddressResult } from "./types";

const DIR = process.env.ADDRESSES_DIR ?? join(/* turbopackIgnore: true */ process.cwd(), ".data");

// Три файла от npm run addresses:build, строки в одном порядке:
//   addresses.tsv      — «улица \t город \t индекс \t lat \t lng», для ответа
//   address-keys.txt   — « karla ulmana gatve 86 \t riga », для поиска (без диакритики, только ASCII)
//   address-points.bin — координаты подряд (Float64), для расстояний
// Всё хранится одним куском, а не полумиллионом отдельных строк: так ~100 МБ памяти и загрузка за доли секунды
type Index = {
  file: Buffer;
  lineStart: Int32Array; // начало строки i в file; lineStart[n] — конец
  keys: string;
  keyStart: Int32Array; // начало ключа i в keys; keyStart[n] — конец
  points: Float64Array; // [lat0, lng0, lat1, lng1, …]
  // «ближайший адрес»: адреса, отсортированные по клеткам ~1 км, и где в этом списке каждая клетка
  byCell: Int32Array;
  cells: Map<number, [start: number, end: number]>;
};

const CELL = 0.01; // градуса: ~1,1 км по широте, ~0,6 км по долготе
const cellOf = (row: number, col: number) => row * 10000 + col; // широта ~5500–5900, долгота ~2000–2900 клеток
const cellAt = (lat: number, lng: number) => cellOf(Math.floor(lat / CELL), Math.floor(lng / CELL));

// Запрос приводим к тому же виду, что ключи в address-keys.txt (scripts/build-addresses.mjs)
const queryTokens = (text: string) => foldText(text).replace(/[^\p{L}\p{N}]+/gu, " ").trim().split(" ").filter(Boolean);

// Позиции начала строк: 0, после каждого \n, конец
function lineStarts(length: number, nextNewline: (from: number) => number) {
  const starts: number[] = [0];
  for (let i = nextNewline(0); i !== -1; i = nextNewline(i + 1)) starts.push(i + 1);
  if (starts.at(-1) !== length) starts.push(length);
  return Int32Array.from(starts);
}

let loading: Promise<Index> | null = null;

async function load(): Promise<Index> {
  const [file, keysFile, pointsFile] = await Promise.all([
    readFile(join(DIR, "addresses.tsv")),
    readFile(join(DIR, "address-keys.txt")),
    readFile(join(DIR, "address-points.bin")),
  ]);

  const keys = keysFile.toString("latin1"); // ASCII — однобайтовая строка, вдвое меньше памяти
  const lineStart = lineStarts(file.length, (from) => file.indexOf(10, from));
  const keyStart = lineStarts(keys.length, (from) => keys.indexOf("\n", from));
  const points = new Float64Array(pointsFile.buffer, pointsFile.byteOffset, pointsFile.byteLength / 8);
  const count = lineStart.length - 1;
  if (keyStart.length - 1 !== count || points.length !== count * 2) {
    throw new Error("Файлы адресов не совпадают — запустите npm run addresses:build заново");
  }

  const cellCode = Int32Array.from({ length: count }, (_, i) => cellAt(points[2 * i], points[2 * i + 1]));
  const byCell = Int32Array.from({ length: count }, (_, i) => i).sort((a, b) => cellCode[a] - cellCode[b]);
  const cells = new Map<number, [number, number]>();
  byCell.forEach((row, at) => {
    const range = cells.get(cellCode[row]);
    if (range) range[1] = at + 1;
    else cells.set(cellCode[row], [at, at + 1]);
  });

  return { file, lineStart, keys, keyStart, points, byCell, cells };
}

// Файла нет (не запускали npm run addresses:build) — ошибка с подсказкой, а при следующем запросе пробуем снова
function getIndex() {
  loading ??= load().catch((error) => {
    loading = null;
    throw new Error(`Адреса не загружены (${DIR}). Запустите: npm run addresses:build`, { cause: error });
  });
  return loading;
}

function toResult(index: Index, i: number): AddressResult {
  const [street, city, postcode] = index.file
    .toString("utf8", index.lineStart[i], index.lineStart[i + 1])
    .trimEnd()
    .split("\t");
  return { id: String(i), label: `${street}, ${city}`, street, city, postcode: postcode || undefined, lat: index.points[2 * i], lng: index.points[2 * i + 1] };
}

// Номер адреса по позиции в общей строке ключей (двоичный поиск)
function rowAt(keyStart: Int32Array, position: number) {
  let lo = 0;
  let hi = keyStart.length - 2;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (keyStart[mid] <= position) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

// Расстояние для сортировки (приближённо, для сравнения хватает)
const distance2 = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const dLng = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180);
  return (lat2 - lat1) ** 2 + dLng ** 2;
};

// хватает с запасом: даже «Brīvības» — несколько тысяч домов по всей Латвии
const MAX_CANDIDATES = 20000;

// «brivibas 100 rig» → «Brīvības iela 100, Rīga». Каждое слово запроса — начало слова адреса.
// Выше — где совпало начало адреса (улица), набранный целиком город и точный номер дома, затем ближайшие к near
export async function searchAddresses(query: string, near: { lat: number; lng: number }, limit = 6) {
  const index = await getIndex();
  const { keys, keyStart } = index;
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];

  const needles = tokens.map((t) => ` ${t}`);
  const numbers = tokens.filter((t) => /^\d/.test(t));
  // ищем по самому длинному слову — у него меньше всего совпадений, остальные проверяем у найденных
  const rarest = needles.reduce((a, b) => (b.length > a.length ? b : a));
  const matches: { i: number; score: number }[] = [];
  let lastRow = -1;

  for (let at = keys.indexOf(rarest); at !== -1 && matches.length < MAX_CANDIDATES; at = keys.indexOf(rarest, at + 1)) {
    const i = rowAt(keyStart, at);
    if (i === lastRow) continue;
    lastRow = i;

    const start = keyStart[i];
    const end = keyStart[i + 1] - 1;
    const has = (text: string) => {
      const found = keys.indexOf(text, start);
      return found !== -1 && found + text.length <= end;
    };
    if (!needles.every(has)) continue;

    // улицу могут написать и не первой: «ķekava rīgas 22»
    const startsWithStreet = needles.some((n) => keys.startsWith(n, start)) ? 0 : 1;
    // город набран целым словом («sigulda») — адреса в нём выше, чем такая же улица в соседнем селе
    const cityAt = keys.indexOf("\t", start);
    const inTypedCity = needles.some((n) => {
      const found = keys.indexOf(`${n} `, cityAt);
      return found !== -1 && found < end;
    })
      ? 0
      : 1;
    const exactNumber = numbers.every((n) => has(` ${n} `)) ? 0 : 1;
    const score =
      startsWithStreet * 1000 + inTypedCity * 500 + exactNumber * 100 + distance2(near.lat, near.lng, index.points[2 * i], index.points[2 * i + 1]);
    matches.push({ i, score });
  }

  return matches
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ i }) => toResult(index, i));
}

// Ближайший адрес к точке на карте; дальше ~1 км адресов нет (лес, поле) — null
export async function nearestAddress(lat: number, lng: number) {
  const index = await getIndex();
  const row = Math.floor(lat / CELL);
  const col = Math.floor(lng / CELL);
  let best = -1;
  let bestDistance = Infinity;

  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const [from, to] = index.cells.get(cellOf(row + dr, col + dc)) ?? [0, 0];
      for (let at = from; at < to; at++) {
        const i = index.byCell[at];
        const d = distance2(lat, lng, index.points[2 * i], index.points[2 * i + 1]);
        if (d < bestDistance) {
          best = i;
          bestDistance = d;
        }
      }
    }
  }

  return best >= 0 ? toResult(index, best) : null;
}
