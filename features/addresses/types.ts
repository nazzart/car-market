// Адрес из подсказок и с карты
export type AddressResult = {
  id: string;
  label: string; // «Brīvības iela 100, Rīga» — так адрес и хранится в поле
  street: string; // «Brīvības iela 100»; в сельской местности — «"Druvas 1", Gaiķi, Gaiķu pag.»
  city: string; // «Rīga» или край: «Saldus novads»
  postcode?: string;
  lat: number;
  lng: number;
};
