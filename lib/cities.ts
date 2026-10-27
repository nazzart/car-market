// Латышские названия городов из списка (messages → options.cities).
// Адрес дилера всегда на латышском, поэтому и город в нём — на латышском.
const CITY_NAMES_LV: Record<string, string> = {
  riga: "Rīga",
  jurmala: "Jūrmala",
  jelgava: "Jelgava",
  daugavpils: "Daugavpils",
  liepaja: "Liepāja",
  ogre: "Ogre",
  valmiera: "Valmiera",
  ventspils: "Ventspils",
};

// Город хранится ключом, если он есть в списке, иначе латышским названием («Ķekava»)
export const cityFromName = (name: string) =>
  Object.keys(CITY_NAMES_LV).find((key) => CITY_NAMES_LV[key] === name) ?? name;

export const cityNameLv = (city: string) => CITY_NAMES_LV[city] ?? city;

type Translator = { has: (key: string) => boolean; (key: string): string };

// Название города на языке сайта; для городов вне списка — как есть
export const cityLabel = (tOptions: Translator, city: string) =>
  tOptions.has(`cities.${city}`) ? tOptions(`cities.${city}`) : city;
