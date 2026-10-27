import { cityFromName } from "@/lib/cities";

// Геокодер Photon (OpenStreetMap). Отдаёт адреса в местном написании — для Латвии это латышский.
// TODO: для продакшена — свой инстанс Photon или адресный регистр VZD; публичный сервер только для демо
const PHOTON_URL = "https://photon.komoot.io";

// Латвия: minLon, minLat, maxLon, maxLat
const LATVIA_BBOX = "20.9,55.6,28.3,58.1";

export type AddressResult = {
  id: string;
  label: string; // «Brīvības iela 100, Rīga» — так адрес и хранится в поле
  street: string; // «Brīvības iela 100»
  city: string; // «Rīga»
  postcode?: string;
  lat: number;
  lng: number;
};

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_type: string;
    osm_id: number;
    type: string;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    postcode?: string;
    countrycode?: string;
  };
};

const round = (n: number) => Math.round(n * 1e5) / 1e5;

function toAddress({ geometry, properties: p }: PhotonFeature): AddressResult | null {
  if (p.countrycode !== "LV") return null;

  const streetName = p.street ?? (p.type === "street" ? p.name : undefined);
  if (!streetName) return null;

  const city = p.city ?? p.town ?? p.village ?? p.county ?? "";
  const [lng, lat] = geometry.coordinates;

  const street = p.housenumber ? `${streetName} ${p.housenumber}` : streetName;

  return {
    id: `${p.osm_type}${p.osm_id}`,
    label: city ? `${street}, ${city}` : street,
    street,
    city,
    postcode: p.postcode,
    lat: round(lat),
    lng: round(lng),
  };
}

// Одна улица в OSM — много отрезков: оставляем по одному на «улица + город»
function unique(results: AddressResult[]) {
  const seen = new Set<string>();
  return results.filter((r) => {
    const key = r.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchFeatures(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Geocoder error ${res.status}`);
  const data: { features: PhotonFeature[] } = await res.json();
  return data.features.map(toAddress).filter((r): r is AddressResult => r !== null);
}

// Подсказки по введённому тексту; near — текущая метка, чтобы ближние адреса шли первыми
export async function searchAddress(
  query: string,
  near: { lat: number; lng: number },
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    q: query,
    limit: "8",
    bbox: LATVIA_BBOX,
    lat: String(near.lat),
    lon: String(near.lng),
    lang: "default", // местные названия, а не по языку браузера
  });
  params.append("layer", "house");
  params.append("layer", "street");

  return unique(await fetchFeatures(`${PHOTON_URL}/api/?${params}`, signal)).slice(0, 6);
}

// Адрес по точке на карте
export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal) {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng), limit: "1", lang: "default" });
  const [result] = await fetchFeatures(`${PHOTON_URL}/reverse?${params}`, signal);
  return result ?? null;
}

// «Brīvības iela 100, Rīga» → улица и город (ключ из списка или латышское название)
export function parseAddress(text: string) {
  const i = text.lastIndexOf(",");
  if (i === -1) return null;

  const street = text.slice(0, i).trim();
  const city = text.slice(i + 1).trim();
  if (!street || !city) return null;

  return { street, city: cityFromName(city) };
}
