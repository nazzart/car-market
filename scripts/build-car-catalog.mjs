// Строит список марок и моделей для выпадающих списков из открытых данных
// нидерландского регистра транспорта RDW (opendata.rdw.nl, лицензия CC0 — можно копировать и менять).
//
//   npm run catalog:build → features/brands/data/brands.ts, models.ts и versions.ts (файлы генерируются — не править руками)
//
// В регистре — все легковые авто Нидерландов с «торговым названием» в разном написании:
// «TOYOTA AYGO», «CEE'D», «320I», «C 200 CDI»… Скрипт сводит их к моделям («Aygo», «Ceed», «3 Series», «C-Class»)
// и оставляет только те, что встречаются достаточно часто. Правки — в настройках ниже, затем запустить снова.
// У BMW и Mercedes из тех же названий берутся и версии («530d xDrive», «E 220 CDI») — подсказки в форме подачи.
// Обновлять раз в год, чтобы появились новые модели.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = join(ROOT, "features", "brands", "data");
const API =
  "https://opendata.rdw.nl/resource/m9d7-ebf2.json?$select=merk,handelsbenaming,count(kenteken)%20as%20n,max(datum_eerste_toelating)%20as%20last&$where=voertuigsoort=%27Personenauto%27&$group=merk,handelsbenaming&$limit=200000";

/* ---------- Марки: название, slug (адрес и фильтр), написания в RDW, популярная ---------- */

const BRANDS = [
  ["Abarth", "abarth", ["ABARTH"]],
  ["Acura", "acura", ["ACURA"]],
  ["Aiways", "aiways", ["AIWAYS"]],
  ["Alfa Romeo", "alfa-romeo", ["ALFA ROMEO", "ALFA"]],
  ["Alpine", "alpine", ["ALPINE", "ALPINE-RENAULT"]],
  ["Aston Martin", "aston-martin", ["ASTON MARTIN"]],
  ["Audi", "audi", ["AUDI"], true],
  ["Bentley", "bentley", ["BENTLEY"]],
  ["BMW", "bmw", ["BMW", "BMW I"], true],
  ["BYD", "byd", ["BYD"], true],
  ["Cadillac", "cadillac", ["CADILLAC"]],
  ["Chery", "chery", ["CHERY"], true],
  ["Chevrolet", "chevrolet", ["CHEVROLET"], true],
  ["Chrysler", "chrysler", ["CHRYSLER"]],
  ["Citroen", "citroen", ["CITROEN"]],
  ["Cupra", "cupra", ["CUPRA"]],
  ["Dacia", "dacia", ["DACIA"]],
  ["Daewoo", "daewoo", ["DAEWOO"]],
  ["Daihatsu", "daihatsu", ["DAIHATSU"]],
  ["Dodge", "dodge", ["DODGE"]],
  ["Dongfeng", "dongfeng", ["DONGFENG"]],
  ["DS", "ds", ["DS", "DS AUTOMOBILES"]],
  ["Ferrari", "ferrari", ["FERRARI"]],
  ["Fiat", "fiat", ["FIAT"]],
  ["Fisker", "fisker", ["FISKER"]],
  ["Ford", "ford", ["FORD", "FORD-CNG-TECHNIK"], true],
  ["GAZ", "gaz", ["GAZ"]],
  ["Geely", "geely", ["GEELY"], true],
  ["Genesis", "genesis", ["GENESIS"]],
  ["Haval", "haval", ["HAVAL", "GWM", "GREAT WALL"], true],
  ["Honda", "honda", ["HONDA"], true],
  ["Hummer", "hummer", ["HUMMER"]],
  ["Hyundai", "hyundai", ["HYUNDAI"], true],
  ["Infiniti", "infiniti", ["INFINITI"]],
  ["Isuzu", "isuzu", ["ISUZU"]],
  ["Jaecoo", "jaecoo", ["JAECOO"]],
  ["Jaguar", "jaguar", ["JAGUAR", "JAGUAR CARS"]],
  ["Jeep", "jeep", ["JEEP"]],
  ["Kia", "kia", ["KIA"], true],
  ["Lada", "lada", ["LADA", "LADA-VAZ", "VAZ"]],
  ["Lamborghini", "lamborghini", ["LAMBORGHINI", "AUTOMOBILI LAMBORGHINI S."]],
  ["Lancia", "lancia", ["LANCIA"]],
  ["Land Rover", "land-rover", ["LAND ROVER", "JAGUAR LAND ROVER"], true],
  ["Leapmotor", "leapmotor", ["LEAPMOTOR"]],
  ["Lexus", "lexus", ["LEXUS"], true],
  ["Lincoln", "lincoln", ["LINCOLN"]],
  ["Lotus", "lotus", ["LOTUS"]],
  ["Lynk & Co", "lynk-co", ["LYNK&CO"]],
  ["Maserati", "maserati", ["MASERATI"]],
  ["Maxus", "maxus", ["MAXUS"]],
  ["Mazda", "mazda", ["MAZDA"], true],
  ["McLaren", "mclaren", ["MC LAREN", "MCLAREN"]],
  ["Mercedes-Benz", "mercedes", ["MERCEDES-BENZ", "MERCEDES-AMG"], true],
  ["MG", "mg", ["MG"]],
  ["MINI", "mini", ["MINI"]],
  ["Mitsubishi", "mitsubishi", ["MITSUBISHI"], true],
  ["NIO", "nio", ["NIO"]],
  ["Nissan", "nissan", ["NISSAN"], true],
  ["Omoda", "omoda", ["OMODA"]],
  ["Opel", "opel", ["OPEL", "VAUXHALL"], true],
  ["Peugeot", "peugeot", ["PEUGEOT"], true],
  ["Polestar", "polestar", ["POLESTAR"]],
  ["Pontiac", "pontiac", ["PONTIAC"]],
  ["Porsche", "porsche", ["PORSCHE"], true],
  ["RAM", "ram", ["RAM"]],
  ["Renault", "renault", ["RENAULT"], true],
  ["Rolls-Royce", "rolls-royce", ["ROLLS ROYCE", "ROLLS-ROYCE"]],
  ["Rover", "rover", ["ROVER"]],
  ["Saab", "saab", ["SAAB"]],
  ["Seat", "seat", ["SEAT"]],
  ["Skoda", "skoda", ["SKODA"], true],
  ["Smart", "smart", ["SMART", "MICRO COMPACT CAR SMART", "MICRO COMPACT CAR"]],
  ["SsangYong", "ssangyong", ["SSANGYONG", "KG MOBILITY", "KGM"]],
  ["Subaru", "subaru", ["SUBARU"]],
  ["Suzuki", "suzuki", ["SUZUKI"]],
  ["Tesla", "tesla", ["TESLA", "TESLA MOTORS"]],
  ["Toyota", "toyota", ["TOYOTA"], true],
  ["UAZ", "uaz", ["UAZ"]],
  ["Volkswagen", "volkswagen", ["VOLKSWAGEN", "VW"], true],
  ["Volvo", "volvo", ["VOLVO"], true],
  ["Xpeng", "xpeng", ["XPENG"]],
  ["Zeekr", "zeekr", ["ZEEKR"]],
];

/* ---------- Модели ---------- */

// Модели из двух и более слов (иначе берём первое слово: «OCTAVIA COMBI» → Octavia)
const MULTI_WORD = [
  "MODEL 3", "MODEL S", "MODEL X", "MODEL Y",
  "RANGE ROVER EVOQUE", "RANGE ROVER SPORT", "RANGE ROVER VELAR", "RANGE ROVER", "DISCOVERY SPORT",
  "LAND CRUISER", "URBAN CRUISER", "YARIS CROSS", "COROLLA CROSS", "COROLLA VERSO", "YARIS VERSO", "AYGO X", "PROACE CITY",
  "GRAND C4 PICASSO", "GRAND C4 SPACETOURER", "C4 PICASSO", "C3 PICASSO", "XSARA PICASSO", "C3 AIRCROSS", "C5 AIRCROSS",
  "C4 CACTUS", "C4 SPACETOURER", "C4 X", "C5 X", "E-C4 X", "E-C3 AIRCROSS",
  "GRAND SANTA FE", "SANTA FE", "IONIQ 5", "IONIQ 6", "IONIQ 9",
  "GRAND C-MAX", "MUSTANG MACH-E", "TOURNEO CONNECT", "TOURNEO COURIER", "TOURNEO CUSTOM", "TRANSIT CONNECT", "TRANSIT CUSTOM",
  "GRAND SCENIC", "GRAND ESPACE", "SPACE STAR", "ECLIPSE CROSS", "GRAND VITARA", "SX4 S-CROSS", "GRANDE PUNTO", "PUNTO EVO",
  "GOLF PLUS", "GOLF SPORTSVAN", "ID. BUZZ", "Q4 E-TRON", "Q8 E-TRON", "E-TRON GT", "SQ8 E-TRON",
  "AMG GT", "ATTO 2", "ATTO 3", "SEALION 5", "SEALION 7", "SEAL U", "CORSA-E", "MOKKA-E", "GRAND CHEROKEE", "NEW 500", "500 X", "500 L",
];

// Разные написания одной модели (после отрезания марки и мусора)
const SAME_MODEL = {
  "CEE D": "CEED", "CEE'D": "CEED", "PRO CEE'D": "PROCEED", "PRO_CEE'D": "PROCEED",
  UP: "UP!", LANDCRUISER: "LAND CRUISER", "NEW BEETLE": "BEETLE", "GOLF-CABRIOLET": "GOLF",
  FREELANDER2: "FREELANDER", "500 X": "500X", "500 L": "500L", "NEW 500": "500", "CORSA-E": "CORSA", "MOKKA-E": "MOKKA",
  "ID. BUZZ": "ID.BUZZ", "C4 X": "C4 X", MODEL3: "MODEL 3",
};

// Марки, где в регистре записаны версии двигателя — сводим к серии/классу
const BRAND_RULES = {
  bmw: (s) => {
    let m;
    if ((m = s.match(/^(\d)(?:ER|\s|-|$)/))) return `${m[1]} SERIES`; // «3ER REIHE», «5ER»
    if ((m = s.match(/^M(\d)\d\d/))) return `${m[1]} SERIES`; // M135i — это 1 Series
    if ((m = s.match(/^(\d)\d\d(?:[A-Z]|\b)/))) return `${m[1]} SERIES`; // 320d, 530e
    if ((m = s.match(/^(I?X\d|IX|I\d|Z\d|M\d|XM)/))) return m[1].replace(/^I3S$/, "I3");
    return null; // «X REIHE», «ACTIVEHYBRID»…
  },
  audi: (s) => {
    const m = s.match(/^(RS|SQ|S)\s?(\d)\b/);
    if (m) return `${m[1]}${m[2]}`;
    if (/^A8L\b/.test(s)) return "A8";
    return undefined;
  },
  hyundai: (s) => {
    let m;
    if ((m = s.match(/^I\s?(\d0)\b/))) return `I${m[1]}`;
    if ((m = s.match(/^IX\s?(\d\d)\b/))) return `IX${m[1]}`;
    if ((m = s.match(/^IONIQ\s?(\d)\b/))) return `IONIQ ${m[1]}`;
    return undefined;
  },
  chery: (s) => s.match(/^TIGGO\s?(\d)/)?.[1] ? `TIGGO ${s.match(/^TIGGO\s?(\d)/)[1]}` : undefined,
  "lynk-co": (s) => s.match(/\b(0\d)\b/)?.[1] ?? null,
  opel: (s) => (/^AMPERA-E/.test(s) ? "AMPERA-E" : /^CITY\b/.test(s) ? null : s.split(/[-+ ]/)[0]), // «ASTRA-G-CARAVAN» → Astra
  mercedes: (s) => {
    let m;
    if ((m = s.match(/^([A-Z])-KLASSE/))) return `${m[1]}-CLASS`;
    if ((m = s.match(/^(A|B|C|E|S|G|V|R|X)\s*\d/))) return `${m[1]}-CLASS`;
    if ((m = s.match(/^(AMG GT|CLA|CLS|CLK|SLK|SLC|SL|CL|GLA|GLB|GLC|GLE|GLS|GLK|GL|ML|EQA|EQB|EQC|EQE|EQS|EQV)\b/))) return m[1];
    if ((m = s.match(/^(SPRINTER|VITO|VIANO|CITAN|MARCO POLO|T)\b/))) return m[1] === "T" ? null : m[1];
    return null; // старые обозначения («280 SE», «190 E») — не берём
  },
  lexus: (s) => s.match(/^([A-Z]{2,3})\s*\d/)?.[1] ?? s.match(/^(LBX|RZ|UX|NX|RX)\b/)?.[1],
  infiniti: (s) => s.match(/^(QX\d\d|Q\d\d|FX|EX|G|M)/)?.[1] ?? null,
};

// Правки по маркам (ключи — в верхнем регистре, как после разбора):
//   drop — убрать (коды, кемперы, ошибки), merge — объединить с моделью, add — дописать то, чего нет в RDW
//   (пикапы там — грузовые; китайские марки в Нидерландах почти не продаются), only — заменить список целиком
const FIX = {
  "alfa-romeo": { drop: ["ALFA", "916", "SPYDER"] },
  "aston-martin": { drop: ["A-V12", "B-", "DB", "SPEEDSTER", "VOLANTE"] },
  audi: { drop: ["4D", "8D", "8G", "8H", "8N", "RS", "80", "100"] },
  bentley: { merge: { FLYING: "FLYING SPUR" }, drop: ["TURBO", "BROOKLANDS", "AZURE"] },
  cadillac: { drop: ["ACCUBUILT", "KELLERMANN", "4-DOOR", "6DW29", "6EB26", "6RB26", "6YV67", "CADILLAC", "DE", "HEARSE", "SEDAN", "SUPERIOR", "EAGLE", "BROUGHAM", "FLEETWOOD", "ALLANTE"] },
  chevrolet: { drop: ["1YY07", "CHEVY", "MONTE", "TRANS", "EXPRESS"] },
  chrysler: { drop: ["CHEROKEE", "JEEP", "LE", "NEW", "SARATOGA", "LEBARON"], merge: { GRAND: "GRAND VOYAGER", TOWN: "TOWN & COUNTRY", "TOWN&COUNTRY": "TOWN & COUNTRY", PT: "PT CRUISER" } },
  citroen: { drop: ["2", "BURTON", "AZ"], merge: { "2CV6": "2CV" } },
  dodge: { drop: ["DODGE", "RAM"], merge: { GRAND: "GRAND CARAVAN" } },
  daihatsu: { drop: ["GRAN"] },
  ds: { drop: ["N", "N?7"], merge: { 3: "DS 3", 4: "DS 4", 5: "DS 5", 7: "DS 7", 9: "DS 9" } },
  ferrari: { drop: ["F", "CHALLENGE"] },
  fiat: { drop: ["183", "230", "244", "280", "290", "ABARTH", "DETHLEFFS", "EG", "FIAT", "HYMER", "TRIGANO", "126"], add: ["Fullback"] },
  ford: { drop: ["LINCOLN", "STREET", "TRANSIT-EUROLINE", "TRANSIT-NUGGET", "TOURNEO"], add: ["Ranger"] },
  honda: { merge: { "E:NY1": "E:NY1" } },
  hyundai: { drop: ["I"], merge: { TUSCON: "TUCSON", "ATOS-PRIME": "ATOS" } },
  infiniti: { drop: ["INFINITY"] },
  isuzu: { add: ["D-Max"] },
  jaecoo: { merge: { 5: "J5", 7: "J7", 8: "J8" } },
  jaguar: { drop: ["EXECUTIVE", "SOVEREIGN"], merge: { XJ6: "XJ", XJ8: "XJ", XJR: "XJ", XK8: "XK", XKR: "XK", "XJ-S": "XJS" } },
  kia: { drop: ["ED", "SLS"] },
  lamborghini: { drop: ["140", "147", "LM"] },
  lancia: { merge: { K: "KAPPA", Y: "YPSILON" } },
  "land-rover": { drop: ["JAGUAR", "STATIONWAGEN"], merge: { 90: "DEFENDER", 110: "DEFENDER" } },
  lincoln: { drop: ["HEARSE", "LIMOUSINE", "M81", "MARK", "MK"], merge: { TOWN: "TOWN CAR", TOWNCAR: "TOWN CAR" } },
  lotus: { drop: ["111", "SPORT"] },
  maserati: { drop: ["331", "2.24", "222", "430", "3200", "SPIDER", "SPYDER", "COUPE"], merge: { GRAN: "GRANTURISMO" } },
  maxus: { merge: { EDELIVER: "EDELIVER", MIFA: "MIFA 9" } },
  mercedes: { add: ["X-Class"] },
  omoda: { merge: { 5: "OMODA 5", 9: "OMODA 9" } },
  mazda: { merge: { MX5: "MX-5", MIATA: "MX-5", "323F": "323" } },
  mg: { drop: ["RD", "RX6"], merge: { 3: "MG3", 4: "MG4", 5: "MG5", MARVEL: "MARVEL R" } },
  mini: { drop: ["1000", "1000E", "1300", "JOHN", "JCW", "MINI"] },
  mitsubishi: { drop: ["SPACE"], add: ["L200"] },
  nissan: { merge: { "QASHQAI+2": "QASHQAI" }, add: ["Navara"] },
  peugeot: { drop: ["0*****", "1*HDZ", "2*****", "PEUGOT", "290", "J5", "206+"] },
  polestar: { merge: { 2: "POLESTAR 2", 3: "POLESTAR 3", 4: "POLESTAR 4" } },
  pontiac: { drop: ["FIRE", "GRAND"], merge: { TRANSPORT: "TRANS SPORT", TRANSSPORT: "TRANS SPORT", "TRANS-SPORT": "TRANS SPORT", TRANS: "TRANS AM", "TRANS-AM": "TRANS AM" } },
  porsche: { merge: { 986: "BOXSTER", 987: "BOXSTER", BOXTER: "BOXSTER", 991: "911", 993: "911", CARRERA: "911" } },
  ram: { only: ["1500", "2500", "3500"] },
  renault: { drop: ["4GTL", "4TL", "R4"], merge: { VEL: "VEL SATIS" } },
  "rolls-royce": { drop: ["BLACK", "RR01", "SALOON", "SILVER"] },
  rover: {
    drop: ["CABRIOLET", "MGF", "MINI", "RANGE ROVER", "RD", "TOURER", "DEFENDER", "ESTATE", "MG", "ROVER", "VITESSE", "XN"],
    merge: { 111: "100", 114: "100", 214: "200", 216: "200", 220: "200", 416: "400", 420: "400", 618: "600", 620: "600", 820: "800", 825: "800", 827: "800" },
  },
  saab: { merge: { 93: "9-3" } },
  seat: { drop: ["CUPRA"], merge: { "CORDOBA-VARIO": "CORDOBA" } },
  smart: { drop: ["ELECTRIC", "SMART"], merge: { EQ: "FORTWO", "ROADSTER-COUPE": "ROADSTER" } },
  subaru: { drop: ["B9", "G3X"] },
  suzuki: { drop: ["E"], merge: { WAGON: "WAGON R", "WAGON-R": "WAGON R" } },
  toyota: { drop: ["DAIHATSU", "GR"], merge: { RAV: "RAV4", FJ: "FJ CRUISER" }, add: ["Hilux"] },
  volkswagen: {
    drop: ["1", "1Y", "23", "25", "113", "253", "1200", "BESTEL", "KAMPEERAUTO", "SMALLANDER", "VENTJE", "NEW", "ID.", "KOMBI", "BUGGY"],
    merge: { KEVER: "BEETLE", T2: "TRANSPORTER", T4: "TRANSPORTER" },
    add: ["Amarok"],
  },
  volvo: { drop: ["XC"], merge: { 244: "240", 245: "240" } },
  // марок почти нет в Нидерландах — список по моделям, которые продаются в Латвии
  lada: { only: ["2101", "2104", "2105", "2106", "2107", "2110", "2111", "2112", "Granta", "Kalina", "Largus", "Niva", "Niva Legend", "Niva Travel", "Priora", "Samara", "Vesta", "XRAY"] },
  uaz: { only: ["469", "Bukhanka", "Hunter", "Patriot", "Pickup"] },
  gaz: { only: ["Gazelle", "Sobol", "Volga"] },
  haval: { only: ["Dargo", "F7", "H2", "H6", "Jolion"] },
  chery: { add: ["Arrizo 8", "Tiggo 4", "Tiggo 7", "Tiggo 8"] },
};

// Название для показа: «OCTAVIA» → «Octavia», «T-ROC» → «T-Roc», «XC40» и «CX-5» — как есть
const DISPLAY = {
  "UP!": "up!", "E-TRON": "e-tron", "Q4 E-TRON": "Q4 e-tron", "Q8 E-TRON": "Q8 e-tron", "SQ8 E-TRON": "SQ8 e-tron",
  "E-TRON GT": "e-tron GT", IX: "iX", IX1: "iX1", IX2: "iX2", IX3: "iX3", I3: "i3", I4: "i4", I5: "i5", I7: "i7", I8: "i8",
  "E-C4": "ë-C4", "E-C4 X": "ë-C4 X", "E-C3": "ë-C3", "E-C3 AIRCROSS": "ë-C3 Aircross", IQ: "iQ", "ID.BUZZ": "ID. Buzz",
  "E-208": "e-208", "E-2008": "e-2008", "E-UP!": "e-up!", MII: "Mii", ONE: "One", FOX: "Fox", EOS: "Eos", KA: "Ka",
  "KA+": "Ka+", "E-NIRO": "e-Niro", "E-SOUL": "e-Soul", "MX-30": "MX-30", "E-BERLINGO": "ë-Berlingo",
  "12CILINDRI": "12Cilindri", GTC4LUSSO: "GTC4Lusso", LAFERRARI: "LaFerrari", "500E": "500e", E: "e", "E:NY1": "e:Ny1",
  I10: "i10", I20: "i20", I30: "i30", I40: "i40", IX20: "ix20", IX35: "ix35", "SANTA FE": "Santa Fe", "GRAND SANTA FE": "Grand Santa Fe",
  "CTS-V": "CTS-V", "AMPERA-E": "Ampera-e", "6E": "6e", "CX-6E": "CX-6e", "I-MIEV": "i-MiEV", "E-NV200": "e-NV200",
  ION: "iOn", MITO: "MiTo", "600E": "600e", "VEL SATIS": "Vel Satis", "E-RIFTER": "e-Rifter", BZ4X: "bZ4X", "WAGON R": "Wagon R", EDELIVER: "eDeliver", "MIFA 9": "MIFA 9",
  GRANTURISMO: "GranTurismo", GRANCABRIO: "GranCabrio", GRANSPORT: "GranSport", "TOWN & COUNTRY": "Town & Country",
  "PT CRUISER": "PT Cruiser", "MP4-12C": "MP4-12C", "DS 3": "DS 3", "DS 4": "DS 4", "DS 5": "DS 5", "DS 7": "DS 7", "DS 9": "DS 9",
  "TRANS AM": "Trans Am", "MARVEL R": "Marvel R", "B03X": "B03X", "7GT": "7 GT", "P7+": "P7+", MG3: "MG3", MG4: "MG4", MG5: "MG5",
};

// Короткие слова — обычно аббревиатуры (GLC, BRZ, ASX); настоящие слова — исключения
const SHORT_WORDS = new Set(["ONE", "FOX", "EOS", "KA", "MII", "BOX", "UNO", "CAR", "AM", "RIO", "ZOE", "VEL"]);
const titleCase = (part) => part[0] + part.slice(1).toLowerCase();
const titleWord = (w) => {
  if (!w.includes("-") && /^[A-Z]{1,3}$/.test(w) && !SHORT_WORDS.has(w)) return w;
  return w
    .split("-")
    .map((part) => (/\d/.test(part) || part.length <= 2 ? part : titleCase(part)))
    .join("-");
};
const display = (key) => DISPLAY[key] ?? key.split(" ").map((w) => DISPLAY[w] ?? titleWord(w)).join(" ");

// Название из регистра без марки и мусора: «BMW 530E XDRIVE» → «530E XDRIVE»
function normalizedName({ slug, aliases }, raw) {
  let s = raw.toUpperCase().replace(/\s+/g, " ").trim();
  // «TOYOTA AYGO», «MAZDA3» → без марки
  for (const alias of [...aliases, slug.toUpperCase()]) {
    if (s.startsWith(`${alias} `)) s = s.slice(alias.length + 1);
    else if (s.startsWith(alias) && /^\d/.test(s.slice(alias.length))) s = s.slice(alias.length);
  }
  return s.split(/[;,(/]/)[0].trim();
}

function normalize(slug, aliases, raw) {
  let s = normalizedName({ slug, aliases }, raw);
  if (!s || /^\d{5,}$/.test(s) || /^[-*U]+\**$/.test(s)) return null; // коды типа, «-», «U*****»

  const rule = BRAND_RULES[slug]?.(s);
  if (rule !== undefined) return rule;

  s = SAME_MODEL[s] ?? s;
  const multi = MULTI_WORD.find((m) => s === m || s.startsWith(`${m} `));
  const base = multi ?? s.split(" ")[0];
  return SAME_MODEL[base] ?? base;
}

/* ---------- Версии (подсказки в форме подачи) ---------- */

// «530E XDRIVE» → «530e xDrive», «X5 XDRIVE30D» → «xDrive30d», «E 220 CDI» → «E 220 CDI», «C 200 D 4MATIC» → «C 200 d 4MATIC».
// null — версии в названии нет («5ER REIHE», «E-KLASSE»)
const MB_SUFFIX = { D: "d", E: "e", DE: "de", H: "h", CDI: "CDI", CGI: "CGI", BLUETEC: "BlueTEC", KOMPRESSOR: "Kompressor", AMG: "AMG" };
const VERSION_RULES = {
  bmw: (s) => {
    const drive = /\bXDRIVE\b/.test(s) ? " xDrive" : "";
    let m;
    // 530d, M550i, 520 i, 530xd
    if ((m = s.match(/^(M?)(\d{3})\s?([A-Z]{1,2})?\b/))) return `${m[1]}${m[2]}${(m[3] ?? "").toLowerCase()}${drive}`;
    // X5 xDrive30d, X1 sDrive18i, iX xDrive40, i4 eDrive40
    if ((m = s.match(/\b([XSE])DRIVE\s?(\d{2})([A-Z])?\b/))) return `${m[1].toLowerCase()}Drive${m[2]}${(m[3] ?? "").toLowerCase()}`;
    // X5 M50d
    if ((m = s.match(/\bM(\d{2})([A-Z])?\b/)) && !/^M\d\b/.test(s)) return `M${m[1]}${(m[2] ?? "").toLowerCase()}`;
    return null;
  },
  mercedes: (s) => {
    const m = s.match(/^(AMG\s)?([A-Z]{1,3})\s?(\d{2,3})\+?(?:\s([A-Z]+))?/);
    if (!m) return null;
    const suffix = m[4] && MB_SUFFIX[m[4]] ? ` ${MB_SUFFIX[m[4]]}` : "";
    const matic = /\b4MATIC\b/.test(s) ? " 4MATIC" : "";
    return `${m[1] ? "AMG " : ""}${m[2]} ${m[3]}${suffix}${matic}`;
  },
};

/* ---------- Сборка ---------- */

const rows = process.env.RDW_CACHE
  ? JSON.parse(readFileSync(process.env.RDW_CACHE, "utf8"))
  : await (await fetch(API, { headers: { "User-Agent": "bestauto.lv catalog build" } })).json();
console.log(`RDW: ${rows.length} строк`);

const brandOf = new Map(BRANDS.flatMap(([, slug, aliases]) => aliases.map((a) => [a, { slug, aliases }])));
const counts = new Map(); // slug → (модель → число машин)
const versionCounts = new Map(); // «slug|модель» → (версия → число машин)
const totals = new Map();

for (const row of rows) {
  const brand = brandOf.get(row.merk);
  if (!brand || !row.handelsbenaming) continue;
  if (Number(row.last?.slice(0, 4) ?? 0) < 1990) continue; // только машины, которые ещё могут продаваться
  const parsed = normalize(brand.slug, brand.aliases, row.handelsbenaming);
  const fix = FIX[brand.slug] ?? {};
  const model = parsed && (fix.merge?.[parsed] ?? parsed);
  if (!model || fix.drop?.includes(model)) continue;
  const n = Number(row.n);
  const version = VERSION_RULES[brand.slug]?.(normalizedName(brand, row.handelsbenaming));
  if (version) {
    const key = `${brand.slug}|${model}`;
    const byVersion = versionCounts.get(key) ?? new Map();
    byVersion.set(version, (byVersion.get(version) ?? 0) + n);
    versionCounts.set(key, byVersion);
  }
  const byModel = counts.get(brand.slug) ?? new Map();
  byModel.set(model, (byModel.get(model) ?? 0) + n);
  counts.set(brand.slug, byModel);
  totals.set(brand.slug, (totals.get(brand.slug) ?? 0) + n);
}

// Оставляем модели, которые встречаются хотя бы у 0,3% машин марки (но не меньше 5 и не больше 100 машин порога)
const collator = new Intl.Collator("en", { numeric: true });
const models = {};
for (const [, slug] of BRANDS) {
  const byModel = counts.get(slug) ?? new Map();
  const min = Math.min(100, Math.max(5, Math.round((totals.get(slug) ?? 0) * 0.003)));
  const fix = FIX[slug] ?? {};
  const found = fix.only ?? [...byModel].filter(([, n]) => n >= min).map(([m]) => display(m));
  models[slug] = [...new Set([...found, ...(fix.add ?? [])])].sort(collator.compare);
}

// Версии: у модели — те, что встречаются хотя бы у 0,5% её машин (не меньше 20), не больше 30 самых частых
const versions = {};
for (const [key, byVersion] of versionCounts) {
  const [slug, model] = key.split("|");
  const shown = display(model);
  if (!models[slug]?.includes(shown)) continue;
  const total = [...byVersion.values()].reduce((a, b) => a + b, 0);
  const min = Math.max(20, total * 0.005);
  const list = [...byVersion]
    .filter(([, n]) => n >= min)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([v]) => v)
    .sort(collator.compare);
  if (list.length) (versions[slug] ??= {})[shown] = list;
}

if (process.env.REVIEW) {
  for (const [slug, byModel] of Object.entries(versions))
    for (const [model, list] of Object.entries(byModel)) console.log(`${slug} ${model}: ${list.join(", ")}`);
  for (const [, slug] of BRANDS) console.log(`${slug} (${models[slug].length}): ${models[slug].join(", ")}`);
  process.exit(0);
}

const header = "// Сгенерировано: npm run catalog:build (scripts/build-car-catalog.mjs) из открытых данных RDW (CC0).\n// Не править руками — правки в настройках скрипта.\n";
writeFileSync(
  join(OUT, "brands.ts"),
  `${header}export type Brand = {\n  name: string;\n  slug: string;\n  popular?: boolean;\n};\n\nexport const brands: Brand[] = [\n${BRANDS.map(
    ([name, slug, , popular]) => `  { name: ${JSON.stringify(name)}, slug: ${JSON.stringify(slug)}${popular ? ", popular: true" : ""} },`
  ).join("\n")}\n];\n`
);
writeFileSync(
  join(OUT, "models.ts"),
  `${header}export const modelsByBrand: Record<string, string[]> = {\n${BRANDS.filter(([, slug]) => models[slug].length)
    .map(([, slug]) => `  ${JSON.stringify(slug)}: ${JSON.stringify(models[slug]).replace(/","/g, '", "')},`)
    .join("\n")}\n};\n`
);
writeFileSync(
  join(OUT, "versions.ts"),
  `${header}// Версии (марка → модель → версии): подсказки в форме подачи. Своя версия тоже допустима
export const versionsByModel: Record<string, Record<string, string[]>> = {\n${Object.entries(versions)
    .map(
      ([slug, byModel]) =>
        `  ${JSON.stringify(slug)}: {\n${Object.entries(byModel)
          .map(([model, list]) => `    ${JSON.stringify(model)}: ${JSON.stringify(list).replace(/","/g, '", "')},`)
          .join("\n")}\n  },`
    )
    .join("\n")}\n};\n`
);
const total = Object.values(models).reduce((n, list) => n + list.length, 0);
console.log(`Готово: ${BRANDS.length} марок, ${total} моделей → features/brands/data/brands.ts, models.ts`);
