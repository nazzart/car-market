import { useLocale } from "next-intl";

import { Point, distanceKm } from "./geo";

// Все города Латвии (10 республиканских + 72 других) и 35 краёв (novadi, реформа 2021; Varakļāni — в Madonas
// novads с 01.07.2025). Деревни и хутора продавец указывает краем: «Ogres novads».
// Координаты — центр города/края (OpenStreetMap, Nominatim) — для расстояния «рядом со мной».
// Ключи — латышское название без диакритики: «Ķekava» → "kekava", «Ogres novads» → "ogres-novads"
export type Place = {
  key: string;
  lv: string;
  ru: string;
  kind: "city" | "municipality";
  major?: true; // 10 республиканских городов — отдельной группой в начале списка
  aliases?: string[]; // как ищут по привычке: края до реформы 2021 («Babītes novads») и «Liepājas novads» → Dienvidkurzemes
  hint?: { lv: string; ru: string }; // подсказка в списке, если по названию края не понять, где он: «ap Liepāju»
  // край вокруг города с собственным самоуправлением (в него город не входит): Liepāja → Dienvidkurzemes novads.
  // «Liepāja + 20 km» = город и его окрестности, как «Liepāja un raj.» на ss.lv
  surroundings?: string;
  municipality?: string; // край, в который входит город (ключ); у 7 городов с собственным самоуправлением — нет
  lat: number;
  lng: number;
};

export const PLACES: Place[] = [
  // Города
  { key: "riga", major: true, lv: "Rīga", ru: "Рига", kind: "city", lat: 56.9494, lng: 24.1052 },
  { key: "daugavpils", major: true, surroundings: "augsdaugavas-novads", lv: "Daugavpils", ru: "Даугавпилс", kind: "city", lat: 55.8712, lng: 26.5159 },
  { key: "liepaja", major: true, surroundings: "dienvidkurzemes-novads", lv: "Liepāja", ru: "Лиепая", kind: "city", lat: 56.5048, lng: 21.0071 },
  { key: "jelgava", major: true, surroundings: "jelgavas-novads", lv: "Jelgava", ru: "Елгава", kind: "city", lat: 56.6522, lng: 23.7292 },
  { key: "jurmala", major: true, lv: "Jūrmala", ru: "Юрмала", kind: "city", lat: 56.9727, lng: 23.7887 },
  { key: "ventspils", major: true, surroundings: "ventspils-novads", lv: "Ventspils", ru: "Вентспилс", kind: "city", lat: 57.3904, lng: 21.5636 },
  { key: "rezekne", major: true, surroundings: "rezeknes-novads", lv: "Rēzekne", ru: "Резекне", kind: "city", lat: 56.5063, lng: 27.3307 },
  { key: "valmiera", major: true, lv: "Valmiera", ru: "Валмиера", kind: "city", municipality: "valmieras-novads", lat: 57.5389, lng: 25.4262 },
  { key: "ogre", major: true, lv: "Ogre", ru: "Огре", kind: "city", municipality: "ogres-novads", lat: 56.8192, lng: 24.6074 },
  { key: "jekabpils", major: true, lv: "Jēkabpils", ru: "Екабпилс", kind: "city", municipality: "jekabpils-novads", lat: 56.4959, lng: 25.8688 },
  { key: "adazi", lv: "Ādaži", ru: "Адажи", kind: "city", municipality: "adazu-novads", lat: 57.082, lng: 24.3243 },
  { key: "ainazi", lv: "Ainaži", ru: "Айнажи", kind: "city", municipality: "limbazu-novads", lat: 57.8637, lng: 24.3586 },
  { key: "aizkraukle", lv: "Aizkraukle", ru: "Айзкраукле", kind: "city", municipality: "aizkraukles-novads", lat: 56.6011, lng: 25.2543 },
  { key: "aizpute", lv: "Aizpute", ru: "Айзпуте", kind: "city", municipality: "dienvidkurzemes-novads", lat: 56.7226, lng: 21.6067 },
  { key: "akniste", lv: "Aknīste", ru: "Акнисте", kind: "city", municipality: "jekabpils-novads", lat: 56.1615, lng: 25.7484 },
  { key: "aloja", lv: "Aloja", ru: "Алоя", kind: "city", municipality: "limbazu-novads", lat: 57.7702, lng: 24.8761 },
  { key: "aluksne", lv: "Alūksne", ru: "Алуксне", kind: "city", municipality: "aluksnes-novads", lat: 57.4205, lng: 27.0505 },
  { key: "ape", lv: "Ape", ru: "Апе", kind: "city", municipality: "smiltenes-novads", lat: 57.5404, lng: 26.6905 },
  { key: "auce", lv: "Auce", ru: "Ауце", kind: "city", municipality: "dobeles-novads", lat: 56.4653, lng: 22.896 },
  { key: "baldone", lv: "Baldone", ru: "Балдоне", kind: "city", municipality: "kekavas-novads", lat: 56.7403, lng: 24.394 },
  { key: "balozi", lv: "Baloži", ru: "Баложи", kind: "city", municipality: "kekavas-novads", lat: 56.8763, lng: 24.1179 },
  { key: "balvi", lv: "Balvi", ru: "Балви", kind: "city", municipality: "balvu-novads", lat: 57.133, lng: 27.265 },
  { key: "bauska", lv: "Bauska", ru: "Бауска", kind: "city", municipality: "bauskas-novads", lat: 56.4083, lng: 24.1877 },
  { key: "broceni", lv: "Brocēni", ru: "Броцены", kind: "city", municipality: "saldus-novads", lat: 56.6845, lng: 22.5665 },
  { key: "carnikava", lv: "Carnikava", ru: "Царникава", kind: "city", municipality: "adazu-novads", lat: 57.1297, lng: 24.2708 },
  { key: "cesis", lv: "Cēsis", ru: "Цесис", kind: "city", municipality: "cesu-novads", lat: 57.3132, lng: 25.2749 },
  { key: "cesvaine", lv: "Cesvaine", ru: "Цесвайне", kind: "city", municipality: "madonas-novads", lat: 56.9658, lng: 26.309 },
  { key: "dagda", lv: "Dagda", ru: "Дагда", kind: "city", municipality: "kraslavas-novads", lat: 56.0949, lng: 27.5374 },
  { key: "dobele", lv: "Dobele", ru: "Добеле", kind: "city", municipality: "dobeles-novads", lat: 56.6257, lng: 23.2773 },
  { key: "durbe", lv: "Durbe", ru: "Дурбе", kind: "city", municipality: "dienvidkurzemes-novads", lat: 56.586, lng: 21.3727 },
  { key: "grobina", lv: "Grobiņa", ru: "Гробиня", kind: "city", municipality: "dienvidkurzemes-novads", lat: 56.5369, lng: 21.1676 },
  { key: "gulbene", lv: "Gulbene", ru: "Гулбене", kind: "city", municipality: "gulbenes-novads", lat: 57.176, lng: 26.7515 },
  { key: "iecava", lv: "Iecava", ru: "Иецава", kind: "city", municipality: "bauskas-novads", lat: 56.5976, lng: 24.1987 },
  { key: "ikskile", lv: "Ikšķile", ru: "Икшкиле", kind: "city", municipality: "ogres-novads", lat: 56.8375, lng: 24.4975 },
  { key: "ilukste", lv: "Ilūkste", ru: "Илуксте", kind: "city", municipality: "augsdaugavas-novads", lat: 55.9767, lng: 26.2973 },
  { key: "jaunjelgava", lv: "Jaunjelgava", ru: "Яунелгава", kind: "city", municipality: "aizkraukles-novads", lat: 56.616, lng: 25.0797 },
  { key: "kandava", lv: "Kandava", ru: "Кандава", kind: "city", municipality: "tukuma-novads", lat: 57.0375, lng: 22.7771 },
  { key: "karsava", lv: "Kārsava", ru: "Карсава", kind: "city", municipality: "ludzas-novads", lat: 56.7875, lng: 27.6734 },
  { key: "koknese", lv: "Koknese", ru: "Кокнесе", kind: "city", municipality: "aizkraukles-novads", lat: 56.6494, lng: 25.4369 },
  { key: "kraslava", lv: "Krāslava", ru: "Краслава", kind: "city", municipality: "kraslavas-novads", lat: 55.8952, lng: 27.1619 },
  { key: "kuldiga", lv: "Kuldīga", ru: "Кулдига", kind: "city", municipality: "kuldigas-novads", lat: 56.9686, lng: 21.9608 },
  { key: "kegums", lv: "Ķegums", ru: "Кегумс", kind: "city", municipality: "ogres-novads", lat: 56.7471, lng: 24.7249 },
  { key: "kekava", lv: "Ķekava", ru: "Кекава", kind: "city", municipality: "kekavas-novads", lat: 56.8262, lng: 24.2337 },
  { key: "lielvarde", lv: "Lielvārde", ru: "Лиелварде", kind: "city", municipality: "ogres-novads", lat: 56.7264, lng: 24.7959 },
  { key: "ligatne", lv: "Līgatne", ru: "Лигатне", kind: "city", municipality: "cesu-novads", lat: 57.2331, lng: 25.0398 },
  { key: "limbazi", lv: "Limbaži", ru: "Лимбажи", kind: "city", municipality: "limbazu-novads", lat: 57.5147, lng: 24.7132 },
  { key: "livani", lv: "Līvāni", ru: "Ливаны", kind: "city", municipality: "livanu-novads", lat: 56.3532, lng: 26.1777 },
  { key: "lubana", lv: "Lubāna", ru: "Лубана", kind: "city", municipality: "madonas-novads", lat: 56.9041, lng: 26.7181 },
  { key: "ludza", lv: "Ludza", ru: "Лудза", kind: "city", municipality: "ludzas-novads", lat: 56.5477, lng: 27.7242 },
  { key: "madona", lv: "Madona", ru: "Мадона", kind: "city", municipality: "madonas-novads", lat: 56.8517, lng: 26.2185 },
  { key: "mazsalaca", lv: "Mazsalaca", ru: "Мазсалаца", kind: "city", municipality: "valmieras-novads", lat: 57.8661, lng: 25.0511 },
  { key: "marupe", lv: "Mārupe", ru: "Марупе", kind: "city", municipality: "marupes-novads", lat: 56.9049, lng: 24.0438 },
  { key: "olaine", lv: "Olaine", ru: "Олайне", kind: "city", municipality: "olaines-novads", lat: 56.7906, lng: 23.9332 },
  { key: "pavilosta", lv: "Pāvilosta", ru: "Павилоста", kind: "city", municipality: "dienvidkurzemes-novads", lat: 56.8889, lng: 21.1825 },
  { key: "piltene", lv: "Piltene", ru: "Пилтене", kind: "city", municipality: "ventspils-novads", lat: 57.226, lng: 21.6728 },
  { key: "plavinas", lv: "Pļaviņas", ru: "Плявиняс", kind: "city", municipality: "aizkraukles-novads", lat: 56.6194, lng: 25.7403 },
  { key: "preili", lv: "Preiļi", ru: "Прейли", kind: "city", municipality: "preilu-novads", lat: 56.2937, lng: 26.7267 },
  { key: "priekule", lv: "Priekule", ru: "Приекуле", kind: "city", municipality: "dienvidkurzemes-novads", lat: 56.4495, lng: 21.6007 },
  { key: "rujiena", lv: "Rūjiena", ru: "Руйиена", kind: "city", municipality: "valmieras-novads", lat: 57.8974, lng: 25.3261 },
  { key: "sabile", lv: "Sabile", ru: "Сабиле", kind: "city", municipality: "talsu-novads", lat: 57.0483, lng: 22.5711 },
  { key: "salacgriva", lv: "Salacgrīva", ru: "Салацгрива", kind: "city", municipality: "limbazu-novads", lat: 57.7568, lng: 24.357 },
  { key: "salaspils", lv: "Salaspils", ru: "Саласпилс", kind: "city", municipality: "salaspils-novads", lat: 56.8635, lng: 24.3545 },
  { key: "saldus", lv: "Saldus", ru: "Салдус", kind: "city", municipality: "saldus-novads", lat: 56.6659, lng: 22.4936 },
  { key: "saulkrasti", lv: "Saulkrasti", ru: "Саулкрасты", kind: "city", municipality: "saulkrastu-novads", lat: 57.2634, lng: 24.4152 },
  { key: "seda", lv: "Seda", ru: "Седа", kind: "city", municipality: "valmieras-novads", lat: 57.6503, lng: 25.751 },
  { key: "sigulda", lv: "Sigulda", ru: "Сигулда", kind: "city", municipality: "siguldas-novads", lat: 57.1541, lng: 24.8567 },
  { key: "skrunda", lv: "Skrunda", ru: "Скрунда", kind: "city", municipality: "kuldigas-novads", lat: 56.6768, lng: 22.0156 },
  { key: "smiltene", lv: "Smiltene", ru: "Смилтене", kind: "city", municipality: "smiltenes-novads", lat: 57.4243, lng: 25.9045 },
  { key: "staicele", lv: "Staicele", ru: "Стайцеле", kind: "city", municipality: "limbazu-novads", lat: 57.8341, lng: 24.7477 },
  { key: "stende", lv: "Stende", ru: "Стенде", kind: "city", municipality: "talsu-novads", lat: 57.1429, lng: 22.5337 },
  { key: "strenci", lv: "Strenči", ru: "Стренчи", kind: "city", municipality: "valmieras-novads", lat: 57.6278, lng: 25.6859 },
  { key: "subate", lv: "Subate", ru: "Субате", kind: "city", municipality: "augsdaugavas-novads", lat: 56.0055, lng: 25.9063 },
  { key: "talsi", lv: "Talsi", ru: "Талси", kind: "city", municipality: "talsu-novads", lat: 57.2452, lng: 22.5903 },
  { key: "tukums", lv: "Tukums", ru: "Тукумс", kind: "city", municipality: "tukuma-novads", lat: 56.967, lng: 23.1525 },
  { key: "valdemarpils", lv: "Valdemārpils", ru: "Валдемарпилс", kind: "city", municipality: "talsu-novads", lat: 57.3693, lng: 22.5895 },
  { key: "valka", lv: "Valka", ru: "Валка", kind: "city", municipality: "valkas-novads", lat: 57.7729, lng: 26.016 },
  { key: "vangazi", lv: "Vangaži", ru: "Вангажи", kind: "city", municipality: "ropazu-novads", lat: 57.0922, lng: 24.5446 },
  { key: "varaklani", lv: "Varakļāni", ru: "Вараклани", kind: "city", municipality: "madonas-novads", lat: 56.6089, lng: 26.7539 },
  { key: "viesite", lv: "Viesīte", ru: "Виесите", kind: "city", municipality: "jekabpils-novads", lat: 56.3457, lng: 25.5572 },
  { key: "vilaka", lv: "Viļaka", ru: "Виляка", kind: "city", municipality: "balvu-novads", lat: 57.1849, lng: 27.6742 },
  { key: "vilani", lv: "Viļāni", ru: "Виляны", kind: "city", municipality: "rezeknes-novads", lat: 56.555, lng: 26.9289 },
  { key: "zilupe", lv: "Zilupe", ru: "Зилупе", kind: "city", municipality: "ludzas-novads", lat: 56.3864, lng: 28.1215 },
  // Края — для тех, кто живёт вне города
  { key: "adazu-novads", aliases: ["Carnikavas novads"], lv: "Ādažu novads", ru: "Адажский край", kind: "municipality", lat: 57.1114, lng: 24.3455 },
  { key: "aizkraukles-novads", lv: "Aizkraukles novads", ru: "Айзкраукльский край", kind: "municipality", lat: 56.4875, lng: 25.2618 },
  { key: "aluksnes-novads", lv: "Alūksnes novads", ru: "Алуксненский край", kind: "municipality", lat: 57.43, lng: 27.1217 },
  { key: "augsdaugavas-novads", hint: { lv: "ap Daugavpili", ru: "вокруг Даугавпилса" }, aliases: ["Daugavpils novads", "Ilūkstes novads"], lv: "Augšdaugavas novads", ru: "Аугшдаугавский край", kind: "municipality", lat: 55.9415, lng: 26.3119 },
  { key: "balvu-novads", lv: "Balvu novads", ru: "Балвский край", kind: "municipality", lat: 57.0754, lng: 27.3602 },
  { key: "bauskas-novads", aliases: ["Iecavas novads", "Rundāles novads", "Vecumnieku novads"], lv: "Bauskas novads", ru: "Бауский край", kind: "municipality", lat: 56.4833, lng: 24.4315 },
  { key: "cesu-novads", lv: "Cēsu novads", ru: "Цесисский край", kind: "municipality", lat: 57.2159, lng: 25.3392 },
  { key: "dienvidkurzemes-novads", hint: { lv: "ap Liepāju", ru: "вокруг Лиепаи" }, aliases: ["Liepājas novads", "Grobiņas novads", "Nīcas novads", "Rucavas novads", "Durbes novads", "Aizputes novads", "Pāvilostas novads", "Priekules novads", "Vaiņodes novads"], lv: "Dienvidkurzemes novads", ru: "Южнокурземский край", kind: "municipality", lat: 56.5225, lng: 21.4596 },
  { key: "dobeles-novads", lv: "Dobeles novads", ru: "Добельский край", kind: "municipality", lat: 56.5616, lng: 23.1046 },
  { key: "gulbenes-novads", lv: "Gulbenes novads", ru: "Гулбенский край", kind: "municipality", lat: 57.1765, lng: 26.6112 },
  { key: "jelgavas-novads", lv: "Jelgavas novads", ru: "Елгавский край", kind: "municipality", lat: 56.6081, lng: 23.8672 },
  { key: "jekabpils-novads", aliases: ["Aknīstes novads", "Viesītes novads", "Salas novads"], lv: "Jēkabpils novads", ru: "Екабпилсский край", kind: "municipality", lat: 56.3585, lng: 25.7282 },
  { key: "kekavas-novads", aliases: ["Baldones novads"], lv: "Ķekavas novads", ru: "Кекавский край", kind: "municipality", lat: 56.7849, lng: 24.3208 },
  { key: "kraslavas-novads", lv: "Krāslavas novads", ru: "Краславский край", kind: "municipality", lat: 56.0226, lng: 27.3988 },
  { key: "kuldigas-novads", lv: "Kuldīgas novads", ru: "Кулдигский край", kind: "municipality", lat: 56.8418, lng: 21.9526 },
  { key: "limbazu-novads", lv: "Limbažu novads", ru: "Лимбажский край", kind: "municipality", lat: 57.606, lng: 24.6375 },
  { key: "livanu-novads", lv: "Līvānu novads", ru: "Ливанский край", kind: "municipality", lat: 56.3517, lng: 26.3338 },
  { key: "ludzas-novads", lv: "Ludzas novads", ru: "Лудзенский край", kind: "municipality", lat: 56.508, lng: 27.8168 },
  { key: "madonas-novads", aliases: ["Varakļānu novads", "Cesvaines novads", "Lubānas novads", "Ērgļu novads"], lv: "Madonas novads", ru: "Мадонский край", kind: "municipality", lat: 56.8185, lng: 26.3456 },
  { key: "marupes-novads", aliases: ["Babītes novads"], lv: "Mārupes novads", ru: "Марупский край", kind: "municipality", lat: 56.8946, lng: 23.8074 },
  { key: "ogres-novads", lv: "Ogres novads", ru: "Огрский край", kind: "municipality", lat: 56.7691, lng: 24.9763 },
  { key: "olaines-novads", lv: "Olaines novads", ru: "Олайнский край", kind: "municipality", lat: 56.7722, lng: 23.9004 },
  { key: "preilu-novads", lv: "Preiļu novads", ru: "Прейльский край", kind: "municipality", lat: 56.3092, lng: 26.7713 },
  { key: "rezeknes-novads", aliases: ["Viļānu novads"], lv: "Rēzeknes novads", ru: "Резекненский край", kind: "municipality", lat: 56.501, lng: 27.0569 },
  { key: "ropazu-novads", aliases: ["Garkalnes novads"], lv: "Ropažu novads", ru: "Ропажский край", kind: "municipality", lat: 56.988, lng: 24.56 },
  { key: "salaspils-novads", lv: "Salaspils novads", ru: "Саласпилсский край", kind: "municipality", lat: 56.8731, lng: 24.3675 },
  { key: "saldus-novads", lv: "Saldus novads", ru: "Салдусский край", kind: "municipality", lat: 56.6398, lng: 22.4845 },
  { key: "saulkrastu-novads", lv: "Saulkrastu novads", ru: "Саулкрастский край", kind: "municipality", lat: 57.2291, lng: 24.5274 },
  { key: "siguldas-novads", lv: "Siguldas novads", ru: "Сигулдский край", kind: "municipality", lat: 57.1664, lng: 24.8284 },
  { key: "smiltenes-novads", lv: "Smiltenes novads", ru: "Смилтенский край", kind: "municipality", lat: 57.3851, lng: 26.042 },
  { key: "talsu-novads", lv: "Talsu novads", ru: "Талсинский край", kind: "municipality", lat: 57.3814, lng: 22.6529 },
  { key: "tukuma-novads", lv: "Tukuma novads", ru: "Тукумский край", kind: "municipality", lat: 57.0025, lng: 23.0079 },
  { key: "valkas-novads", lv: "Valkas novads", ru: "Валкский край", kind: "municipality", lat: 57.7114, lng: 26.0165 },
  { key: "valmieras-novads", lv: "Valmieras novads", ru: "Валмиерский край", kind: "municipality", lat: 57.7346, lng: 25.395 },
  { key: "ventspils-novads", lv: "Ventspils novads", ru: "Вентспилсский край", kind: "municipality", lat: 57.2978, lng: 21.8654 },
];

const byKey = new Map(PLACES.map((p) => [p.key, p]));

export const findPlace = (key: string | null | undefined) => (key ? byKey.get(key) : undefined);

// Название на языке сайта. Не из списка (город из адреса дилера, например посёлок) — как есть
export const placeName = (key: string, locale: string) => {
  const place = byKey.get(key);
  return place ? (locale === "ru" ? place.ru : place.lv) : key;
};

// Хук для компонентов (кроме async-компонентов сервера — там placeName(key, await getLocale()))
export function usePlaceName() {
  const locale = useLocale();
  return (key: string) => placeName(key, locale);
}

// Латышское название — для адреса дилера, который всегда на латышском
export const placeNameLv = (key: string) => byKey.get(key)?.lv ?? key;

// Город из ответа геокодера («Ķekava») → ключ; не из списка — латышское название как есть
export const placeFromName = (name: string) => PLACES.find((p) => p.lv === name)?.key ?? name;

const placePoint = (key: string): Point | null => {
  const place = byKey.get(key);
  return place ? { lat: place.lat, lng: place.lng } : null;
};

const RIGA: Point = { lat: 56.9496, lng: 24.1052 };
export const placePointOrRiga = (key: string) => placePoint(key) ?? RIGA;

// Фильтр поиска по месту: попадает ли место объявления в выбранное.
//  — сам город или край; край включает свои города («Ogres novads» → Ogre, Ikšķile, Ķegums, Lielvārde);
//  — areaKm > 0: плюс окрестности — места, чьи центры не дальше areaKm от центра выбранного
//    («Rīga + 20 km» → Jūrmala, Mārupe, Ķekava…), а для города — и весь его край или край вокруг него.
// Считаем по центрам городов и краёв, а не по точным адресам: люди ориентируются по названиям мест
export function placeMatcher(selected: string, areaKm = 0): (placeKey: string) => boolean {
  const target = byKey.get(selected);
  if (!target) return (key) => key === selected;

  const inside = (key: string) => key === target.key || byKey.get(key)?.municipality === target.key;
  if (areaKm <= 0) return inside;

  return (key) => {
    if (inside(key) || key === (target.municipality ?? target.surroundings)) return true;
    const place = byKey.get(key);
    return place ? distanceKm(target, place) <= areaKm : false;
  };
}

// Для поиска без диакритики и регистра: «kekava», «Ķekava» и «кекава» находят одно и то же
export const foldText = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
