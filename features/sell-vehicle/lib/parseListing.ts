// Проверка формы подачи на сервере: всё, что пришло из браузера, проверяется заново и переводится
// в значения столбцов listings. Без базы — поиск модели в каталоге и запись делает ../api.ts
import { carColors } from "@/features/cars/config/colors";
import { type Damage, type DamageMap, damagePoints, damageTypes } from "@/features/cars/config/damage";
import { equipmentGroups } from "@/features/cars/config/equipment";
import { bodyTypes } from "@/features/cars/config/filterOptions";
import { MILEAGE_LATVIA, OVERALL_CONDITIONS, SERVICE_STATES } from "@/features/cars/types";
import type { Drive, Fuel, MileageLatvia, OverallCondition, ServiceState, Transmission } from "@/features/cars/types";
import { isPhone } from "@/lib/phone";
import { findPlace } from "@/lib/places";
import { youtubeId } from "@/lib/youtube";

import type { SellFormData } from "../types";

export const MAX_PHOTOS = 20;

const FUELS: Fuel[] = ["petrol", "diesel", "hybrid", "electric", "gas"];
const TRANSMISSIONS: Transmission[] = ["automatic", "manual"];
const DRIVES: Drive[] = ["fwd", "rwd", "awd"];

export type ParsedListing = {
  brand: string; // slug — модель ищется в каталоге по марке и названию
  model: string;
  version: string; // как ввёл продавец; к каталожному написанию приводит api.ts
  year: number;
  mileage: number;
  price: number;
  negotiable: boolean | null;
  leasingMonthly: number | null;
  leasingDownPayment: number | null;
  leasingMonths: number | null;
  bodyType: string;
  color: string;
  fuel: Fuel;
  engine: number | null; // л; null — электро
  power: number;
  transmission: Transmission;
  drive: Drive;
  vin: string | null;
  owners: number | null;
  mileageLatvia: MileageLatvia | null;
  inspectionUntil: string | null; // «MM.YYYY»
  overallCondition: OverallCondition | null;
  noAccidents: boolean | null;
  service: ServiceState | null;
  serviceBook: boolean | null;
  damages: DamageMap | null;
  equipment: string[] | null;
  description: string;
  videoUrl: string | null;
  phone: string | null; // частное лицо; у дилера — из его профиля
  city: string;
  contactId: string | null; // дилер: контактное лицо
  images: string[];
};

export type ParseContext = {
  isDealer: boolean;
  photoPrefix: string; // фото — только свои, загруженные в хранилище: https://…/listings/{userId}/
  now?: Date;
};

export type ParseResult = { ok: true; value: ParsedListing } | { ok: false; fields: string[] };

const str = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const int = (value: unknown, min: number, max: number) => {
  const text = str(value, 20).replace(/\s/g, "");
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= min && n <= max ? n : null;
};
const oneOf = <T extends string>(value: unknown, list: readonly T[]) =>
  (list as readonly string[]).includes(str(value, 40)) ? (str(value, 40) as T) : null;
const yesNo = (value: unknown) => (value === "yes" ? true : value === "no" ? false : null);

const PHOTO_FILE = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;
const equipmentKeys = Object.entries(equipmentGroups) as [keyof typeof equipmentGroups, readonly string[]][];

export function parseListing(input: Partial<Record<keyof SellFormData, unknown>>, { isDealer, photoPrefix, now = new Date() }: ParseContext): ParseResult {
  const bad: string[] = [];
  const need = <T>(field: string, value: T | null): T => {
    if (value === null || value === "") bad.push(field);
    return value as T;
  };

  const brand = need("brand", /^[a-z0-9-]{1,40}$/.test(str(input.brand, 40)) ? str(input.brand, 40) : null);
  const model = need("model", str(input.model, 60) || null);
  const year = need("year", int(input.year, 1950, now.getFullYear() + 1));
  const mileage = need("mileage", int(input.mileage, 0, 2_000_000));
  const price = need("price", int(input.price, 1, 10_000_000));
  const bodyType = need("bodyType", oneOf(input.bodyType, bodyTypes));
  const color = need("color", oneOf(input.color, carColors.map((c) => c.value)));
  const fuel = need("fuel", oneOf(input.fuel, FUELS));
  const transmission = need("transmission", oneOf(input.transmission, TRANSMISSIONS));
  const drive = need("drive", oneOf(input.drive, DRIVES));
  const power = need("power", int(input.power, 1, 2000));

  // объём: «2.0» л. У электромобиля 0 или пусто — без объёма
  const engineText = str(input.engineCapacity, 10).replace(",", ".");
  const engineValue = /^\d+(\.\d{1,2})?$/.test(engineText) ? Number(engineText) : null;
  const engine = fuel === "electric" && !engineValue ? null : need("engineCapacity", engineValue !== null && engineValue >= 0.5 && engineValue <= 10 ? engineValue : null);

  // лизинг — только дилер; без платежа нет и условий
  const leasingMonthly = isDealer && str(input.leasingMonthly, 10) ? need("leasingMonthly", int(input.leasingMonthly, 1, 100_000)) : null;
  const leasingDownPayment = leasingMonthly && str(input.leasingDownPayment, 10) ? need("leasingDownPayment", int(input.leasingDownPayment, 0, 90)) : null;
  const leasingMonths = leasingMonthly && str(input.leasingMonths, 10) ? need("leasingMonths", int(input.leasingMonths, 6, 120)) : null;

  const vinText = str(input.vin, 30).toUpperCase();
  const vin = vinText ? need("vin", /^[A-HJ-NPR-Z0-9]{17}$/.test(vinText) ? vinText : null) : null;

  // техосмотр обязателен: «none» — нет, иначе «YYYY-MM» из формы → «MM.YYYY»
  const inspection = str(input.inspectionUntil, 10);
  const inspectionMatch = inspection.match(/^(\d{4})-(\d{2})$/);
  if (inspection !== "none" && !inspectionMatch) bad.push("inspectionUntil");
  const inspectionUntil = inspectionMatch ? `${inspectionMatch[2]}.${inspectionMatch[1]}` : null;

  const ownersText = str(input.owners, 3);
  const owners = ownersText === "4+" ? 4 : int(ownersText, 1, 3);

  const description = need("description", str(input.description, 5000) || null);
  const videoText = str(input.videoUrl, 300);
  const videoUrl = videoText ? need("videoUrl", youtubeId(videoText) ? videoText : null) : null;

  // контакты: частное лицо — свой телефон; дилер — телефон компании или контактного лица (берётся при чтении)
  const phoneText = str(input.sellerPhone, 40);
  const phone = isDealer ? null : need("sellerPhone", isPhone(phoneText) ? phoneText : null);
  const cityText = str(input.sellerCity, 60);
  const city = need("sellerCity", findPlace(cityText) || (isDealer && cityText) ? cityText : null);
  const contactId = isDealer ? str(input.contactId, 80) || null : null;

  // повреждения: только известные детали и виды
  const partIds = new Set(damagePoints.map((p) => p.id));
  const damageEntries = Object.entries(typeof input.damages === "object" && input.damages ? input.damages : {})
    .filter(([part, kinds]) => partIds.has(part) && Array.isArray(kinds))
    .map(([part, kinds]) => [part, [...new Set((kinds as unknown[]).filter((k): k is Damage => damageTypes.includes(k as Damage)))]] as const)
    .filter(([, kinds]) => kinds.length > 0);
  const damages = damageEntries.length ? (Object.fromEntries(damageEntries) as DamageMap) : null;

  // комплектация: ключи своей группы, без повторов
  const equipment = [
    ...new Set(
      equipmentKeys.flatMap(([group, keys]) =>
        Array.isArray(input[group]) ? (input[group] as unknown[]).filter((k): k is string => typeof k === "string" && keys.includes(k)) : []
      )
    ),
  ];

  // фото: свои файлы из хранилища, не больше 20
  const photos = Array.isArray(input.photos) ? (input.photos as unknown[]) : [];
  const images = photos.filter((url): url is string => typeof url === "string" && url.startsWith(photoPrefix) && PHOTO_FILE.test(url.slice(photoPrefix.length)));
  if (images.length !== photos.length || images.length > MAX_PHOTOS) bad.push("photos");

  if (bad.length) return { ok: false, fields: bad };

  return {
    ok: true,
    value: {
      brand,
      model,
      version: str(input.version, 60),
      year,
      mileage,
      price,
      negotiable: yesNo(input.negotiable),
      leasingMonthly,
      leasingDownPayment,
      leasingMonths,
      bodyType,
      color,
      fuel,
      engine,
      power,
      transmission,
      drive,
      vin,
      owners,
      mileageLatvia: oneOf(input.mileageLatvia, MILEAGE_LATVIA),
      inspectionUntil,
      overallCondition: oneOf(input.condition, OVERALL_CONDITIONS),
      // «Была ли авария?» нет → без аварий
      noAccidents: input.hadAccident === "no" ? true : input.hadAccident === "yes" ? false : null,
      service: oneOf(input.hasServiceDone, SERVICE_STATES),
      serviceBook: yesNo(input.hasServiceBook),
      damages,
      equipment: equipment.length ? equipment : null,
      description,
      videoUrl,
      phone,
      city,
      contactId,
      images,
    },
  };
}
