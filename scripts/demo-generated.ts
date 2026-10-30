// Случайные, но правдоподобные демо-объявления для проверки поиска и пагинации на объёме:
//   npm run db:seed -- --reset --generate 100
// Генератор детерминированный (одно и то же зерно → одни и те же объявления), модели — из каталога RDW.
import catalog from "./catalog/rdw-catalog.json";
import { carColors } from "../features/cars/config/colors";
import type { DemoListing } from "../features/cars/data/listings";
import { listingTitle } from "../features/cars/lib/version";
import type { Drive, Fuel, MileageLatvia, OverallCondition, ServiceState } from "../features/cars/types";
import type { Dealer } from "../features/dealers/types";
import { PLACES } from "../lib/places";

// марка, модель, кузов, цена новой (€), мощность (л.с.), объём (л, null — электро), топливо по умолчанию
type Model = [brand: string, model: string, body: string, priceNew: number, power: number, engine: number | null, fuel?: Fuel];

const MODELS: Model[] = [
  ["volkswagen", "Golf", "hatchback", 29000, 150, 1.5],
  ["volkswagen", "Passat", "wagon", 40000, 150, 2.0, "diesel"],
  ["volkswagen", "Tiguan", "suv", 42000, 190, 2.0, "diesel"],
  ["volkswagen", "ID.4", "suv", 45000, 204, null, "electric"],
  ["volkswagen", "Touran", "minivan", 36000, 150, 2.0, "diesel"],
  ["skoda", "Octavia", "wagon", 31000, 150, 2.0, "diesel"],
  ["skoda", "Superb", "wagon", 42000, 190, 2.0, "diesel"],
  ["skoda", "Kodiaq", "suv", 44000, 190, 2.0, "diesel"],
  ["skoda", "Fabia", "hatchback", 19000, 95, 1.0],
  ["toyota", "Corolla", "sedan", 28000, 140, 1.8, "hybrid"],
  ["toyota", "RAV4", "suv", 42000, 218, 2.5, "hybrid"],
  ["toyota", "Land Cruiser", "suv", 75000, 204, 2.8, "diesel"],
  ["toyota", "Yaris", "hatchback", 21000, 116, 1.5, "hybrid"],
  ["toyota", "Avensis", "wagon", 30000, 147, 2.0],
  ["audi", "A4", "wagon", 47000, 190, 2.0, "diesel"],
  ["audi", "A6", "sedan", 62000, 245, 3.0, "diesel"],
  ["audi", "Q5", "suv", 62000, 245, 2.0, "diesel"],
  ["audi", "Q7", "suv", 85000, 286, 3.0, "diesel"],
  ["audi", "A3", "hatchback", 33000, 150, 1.5],
  ["bmw", "3 Series", "sedan", 48000, 184, 2.0, "diesel"],
  ["bmw", "5 Series", "sedan", 62000, 252, 2.0, "diesel"],
  ["bmw", "X3", "suv", 57000, 190, 2.0, "diesel"],
  ["bmw", "X5", "suv", 88000, 286, 3.0, "diesel"],
  ["bmw", "1 Series", "hatchback", 33000, 136, 1.5],
  ["mercedes", "C-Class", "sedan", 50000, 204, 2.0],
  ["mercedes", "E-Class", "sedan", 65000, 265, 2.0, "diesel"],
  ["mercedes", "GLC", "suv", 62000, 258, 2.0],
  ["mercedes", "GLE", "suv", 90000, 330, 3.0, "diesel"],
  ["mercedes", "A-Class", "hatchback", 35000, 163, 1.3],
  ["volvo", "XC60", "suv", 58000, 250, 2.0, "hybrid"],
  ["volvo", "V60", "wagon", 47000, 197, 2.0, "diesel"],
  ["volvo", "XC90", "suv", 80000, 310, 2.0, "hybrid"],
  ["volvo", "V90", "wagon", 60000, 235, 2.0, "diesel"],
  ["ford", "Focus", "hatchback", 26000, 125, 1.0],
  ["ford", "Mondeo", "wagon", 34000, 150, 2.0, "diesel"],
  ["ford", "Kuga", "suv", 36000, 150, 1.5],
  ["opel", "Astra", "hatchback", 25000, 130, 1.2],
  ["opel", "Insignia", "wagon", 35000, 170, 2.0, "diesel"],
  ["renault", "Clio", "hatchback", 19000, 90, 1.0],
  ["renault", "Megane", "wagon", 26000, 140, 1.3],
  ["peugeot", "3008", "suv", 36000, 130, 1.2],
  ["peugeot", "508", "wagon", 40000, 180, 1.6, "hybrid"],
  ["kia", "Sportage", "suv", 35000, 150, 1.6],
  ["kia", "Ceed", "wagon", 25000, 140, 1.5],
  ["kia", "Niro", "suv", 34000, 204, null, "electric"],
  ["hyundai", "Tucson", "suv", 36000, 150, 1.6, "hybrid"],
  ["hyundai", "i30", "hatchback", 24000, 120, 1.0],
  ["nissan", "Qashqai", "suv", 32000, 140, 1.3],
  ["nissan", "Leaf", "hatchback", 33000, 150, null, "electric"],
  ["mazda", "CX-5", "suv", 38000, 165, 2.0],
  ["mazda", "6", "sedan", 34000, 165, 2.0],
  ["honda", "CR-V", "suv", 42000, 184, 2.0, "hybrid"],
  ["honda", "Civic", "hatchback", 30000, 182, 1.5],
  ["tesla", "Model 3", "sedan", 45000, 325, null, "electric"],
  ["tesla", "Model Y", "suv", 50000, 351, null, "electric"],
  ["porsche", "Cayenne", "suv", 110000, 340, 3.0],
  ["porsche", "Macan", "suv", 75000, 265, 2.0],
  ["lexus", "RX", "suv", 75000, 313, 2.5, "hybrid"],
  ["lexus", "NX", "suv", 55000, 244, 2.5, "hybrid"],
  ["land-rover", "Range Rover Sport", "suv", 105000, 300, 3.0, "diesel"],
];

const FIRST_NAMES = ["Jānis", "Andris", "Mārtiņš", "Edgars", "Kristaps", "Ilze", "Linda", "Aivars", "Dmitrijs", "Sergejs", "Olga", "Raivis", "Artūrs", "Elīna", "Pēteris"];
const BMW_GALLERY = ["/cars/bmw1.jpg", "/cars/bmw2.jpg", "/cars/bmw3.jpg", "/cars/bmw4.jpg", "/cars/bmw5.jpg"];
const DESCRIPTIONS = [
  "Labā tehniskā stāvoklī, regulāri apkopta. Iespējama apskate un pārbaude servisā.",
  "Viens īpašnieks Latvijā, visa servisa vēsture. Ziemas riepas komplektā.",
  "Ekonomiska un uzticama. Nesen nomainīta eļļa un filtri, jaunas bremžu uzlikas.",
  "Ievesta no Vācijas, pārbaudīta CSDD. Bez ieguldījumiem, brauc lieliski.",
  "Ģimenes auto, nesmēķētāja salons. Iespējama maiņa vai līzings.",
];

// Детерминированный генератор случайных чисел (mulberry32)
function random(seed: number) {
  let a = seed;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T>(list: readonly T[]) => list[Math.floor(next() * list.length)];
  const chance = (p: number) => next() < p;
  return { next, int, pick, chance };
}

// каталог — тот же, что загружен в базу (car_brands, car_models, car_versions)
const brandName = (slug: string) => catalog.brands.find((b) => b.slug === slug)?.name ?? slug;
const modelsByBrand: Record<string, string[]> = catalog.models;
const versionsByModel: Record<string, Record<string, string[]>> = catalog.versions;

// Лизинг у демо-дилеров: у каждого второго объявления от 5000 € — 20% взнос, 60 мес., ~6,9% годовых
export function demoLeasing(id: number, price: number) {
  if (id % 2 !== 0 || price < 5000) return {};
  const rate = 0.069 / 12;
  const financed = price * 0.8;
  const monthly = Math.round((financed * rate) / (1 - (1 + rate) ** -60) / 5) * 5;
  return { leasingMonthly: monthly, leasingDownPayment: 20, leasingMonths: 60 };
}

// Версия из каталога, подходящая к топливу: дизель — 530d / E 220 CDI, гибрид — 530e / E 300 de, бензин — остальные
const DIESEL = /\dd\b|\bd\b|CDI|BlueTEC/;
const HYBRID = /\de\b|\be\b|\bde\b/;
const versionFits = (version: string, fuel: Fuel) =>
  fuel === "diesel" ? DIESEL.test(version) && !HYBRID.test(version)
  : fuel === "hybrid" ? HYBRID.test(version)
  : fuel === "petrol" ? !DIESEL.test(version) && !HYBRID.test(version)
  : false;

export function generateListings(count: number, firstId: number, dealers: Omit<Dealer, "carsInStock">[]): DemoListing[] {
  for (const [brand, model] of MODELS) {
    if (!modelsByBrand[brand]?.includes(model)) throw new Error(`Нет модели в каталоге: ${brand} ${model}`);
  }

  const r = random(20261029);
  const thisYear = new Date().getFullYear();
  // половина объявлений — в Риге, остальные по крупным городам и остальной Латвии
  const majorCities = PLACES.filter((p) => p.major).map((p) => p.key);
  const otherPlaces = PLACES.filter((p) => !p.major).map((p) => p.key);

  return Array.from({ length: count }, (_, i) => {
    const [brand, model, bodyType, priceNew, basePower, engine, defaultFuel] = r.pick(MODELS);
    const age = Math.min(r.int(0, 18), r.int(0, 18)); // чаще свежие машины
    const year = thisYear - age;
    const isNew = age === 0 && r.chance(0.5);
    const mileage = isNew ? r.int(0, 50) : Math.round((age + r.next()) * r.int(9_000, 24_000) / 1_000) * 1_000;
    const price = Math.max(800, Math.round((priceNew * 0.86 ** age * (0.85 + r.next() * 0.3)) / 100) * 100);
    const fuel: Fuel = defaultFuel ?? (r.chance(0.6) ? "petrol" : "diesel");
    const fitting = (versionsByModel[brand]?.[model] ?? []).filter((v) => versionFits(v, fuel));
    const version = fitting.length ? r.pick(fitting) : undefined;
    const drive: Drive = bodyType === "suv" && r.chance(0.6) ? "awd" : ["bmw", "mercedes"].includes(brand) ? "rwd" : "fwd";

    // треть — у дилеров: официальный дилер своей марки или любой автосалон с пробегом
    const dealer = r.chance(0.35)
      ? r.pick(dealers.filter((d) => (d.type === "official" ? d.brands.includes(brand) : true)))
      : undefined;
    const city = dealer?.city ?? (r.chance(0.5) ? "riga" : r.chance(0.5) ? r.pick(majorCities) : r.pick(otherPlaces));

    const inspectionYear = thisYear + r.int(-1, 2);

    return {
      id: String(firstId + i),
      brand,
      model,
      version,
      title: listingTitle(brandName(brand), model, version),
      year,
      price,
      mileage,
      engine,
      power: basePower + r.int(-2, 2) * 10,
      fuel,
      transmission: r.chance(0.72) || fuel === "electric" ? "automatic" : "manual",
      drive,
      bodyType,
      condition: isNew ? "new" : "used",
      sellerType: dealer ? "dealer" : "private",
      ...(dealer ? { dealer: dealer.slug, sellerName: dealer.name } : { sellerName: r.pick(FIRST_NAMES) }),
      city,
      postedMinutesAgo: r.int(5, 45 * 24 * 60),
      phone: `+371 2${r.int(0, 9)}${r.int(10, 99)} ${r.int(1000, 9999)}`,
      images: brand === "bmw" ? [...BMW_GALLERY.slice(i % 5), ...BMW_GALLERY.slice(0, i % 5)] : [],
      color: r.pick(carColors).value,
      owners: isNew ? 0 : r.int(1, 4),
      vin: Array.from({ length: 17 }, () => r.pick("ABCDEFGHJKLMNPRSTUVWXYZ0123456789".split(""))).join(""),
      inspectionUntil: isNew ? undefined : `${String(r.int(1, 12)).padStart(2, "0")}.${inspectionYear}`,
      noAccidents: r.chance(0.7),
      negotiable: r.chance(0.5),
      description: r.pick(DESCRIPTIONS),
      views: r.int(5, 900),
      serviceBook: r.chance(0.5),
      service: r.pick<ServiceState>(["recent", "recent", "partial", "required"]),
      overallCondition: r.pick<OverallCondition>(["excellent", "good", "good", "average", "repair"]),
      mileageLatvia: isNew ? "none" : r.pick<MileageLatvia>(["none", "upTo10k", "from10to50k", "from50to100k", "over100k"]),
    };
  });
}
