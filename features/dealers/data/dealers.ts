// Временные данные — позже заменим на запрос к БД. Компании вымышленные

// Часы работы по дням; нет дня — выходной. Время в формате «HH:MM»
export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export type DayHours = { open: string; close: string };
export type OpeningHours = Partial<Record<Day, DayHours>>;

const trimHour = (time: string) => time.replace(/^0(\d)/, "$1");

// Соседние дни с одинаковым временем объединяются: «P–Pk 9:00–19:00, S 10:00–16:00».
// dayLabel — перевод options.days.{day}
export const formatHours = (hours: OpeningHours, dayLabel: (day: string) => string) => {
  const groups: { from: Day; to: Day; time: string }[] = [];

  for (const day of DAYS) {
    const h = hours[day];
    if (!h) continue;

    const time = `${trimHour(h.open)}–${trimHour(h.close)}`;
    const last = groups.at(-1);
    const prevDay = DAYS[DAYS.indexOf(day) - 1];

    if (last && last.time === time && last.to === prevDay) last.to = day;
    else groups.push({ from: day, to: day, time });
  }

  return groups
    .map((g) =>
      g.from === g.to
        ? `${dayLabel(g.from)} ${g.time}`
        : `${dayLabel(g.from)}–${dayLabel(g.to)} ${g.time}`
    )
    .join(", ");
};

// Контактное лицо дилера (менеджер), которого можно указать у конкретного объявления
export type DealerContact = {
  id: string;
  name: string;
  phone: string;
  role?: string; // «Pārdošanas konsultants» — как указал дилер
};

export type Dealer = {
  slug: string;
  name: string;
  type: "official" | "used"; // официальный дилер / автосалон с пробегом
  brands: string[]; // slug марок, для официальных дилеров
  city: string; // ключ города: messages → options.cities
  address: string; // официальный адрес на латышском — не переводится
  lat: number;
  lng: number;
  phone: string; // основной телефон компании — контакт по умолчанию
  contacts?: DealerContact[];
  regNumber?: string; // регистрационный номер (11 цифр)
  verified?: boolean; // модератор сверил компанию с регистром предприятий → значок «Проверенный дилер»
  hours: OpeningHours;
  // Рейтинга пока нет — появится вместе с отзывами
  rating?: number;
  reviews?: number;
  carsInStock: number;
  since: number; // на сайте с
  description?: string;
};

export const dealers: Dealer[] = [
  {
    slug: "baltic-auto",
    contacts: [
      { id: "c-janis", name: "Jānis Kalniņš", phone: "+371 2000 2101", role: "Pārdošanas konsultants" },
      { id: "c-elina", name: "Elīna Ozola", phone: "+371 2000 2102", role: "Pārdošanas vadītāja" },
    ],
    verified: true,
    regNumber: "40003512345",
    name: "Baltic Auto",
    type: "official",
    brands: ["bmw", "mini"],
    city: "riga",
    address: "Kārļa Ulmaņa gatve 86",
    lat: 56.9345,
    lng: 24.0475,
    phone: "+371 2000 2001",
    hours: {
      mon: { open: "09:00", close: "19:00" },
      tue: { open: "09:00", close: "19:00" },
      wed: { open: "09:00", close: "19:00" },
      thu: { open: "09:00", close: "19:00" },
      fri: { open: "09:00", close: "19:00" },
      sat: { open: "10:00", close: "16:00" },
    },
    carsInStock: 126,
    since: 2016,
    description:
      "Официальный дилер BMW и MINI в Риге. Продажа новых автомобилей и автомобилей с пробегом BMW Premium Selection, сервисный центр, кузовной ремонт и шиномонтаж. Возможен лизинг и трейд-ин — оценка вашего автомобиля за 30 минут.",
  },
  {
    slug: "kia-center-riga",
    regNumber: "40003615838",
    verified: true,
    name: "Kia Center Riga",
    type: "official",
    brands: ["kia"],
    city: "riga",
    address: "Brīvības gatve 201",
    lat: 56.9852,
    lng: 24.1918,
    phone: "+371 2000 2002",
    hours: {
      mon: { open: "09:00", close: "19:00" },
      tue: { open: "09:00", close: "19:00" },
      wed: { open: "09:00", close: "19:00" },
      thu: { open: "09:00", close: "19:00" },
      fri: { open: "09:00", close: "19:00" },
      sat: { open: "10:00", close: "15:00" },
    },
    carsInStock: 84,
    since: 2018,
    description:
      "Официальный дилер Kia: весь модельный ряд в наличии и под заказ, тест-драйв в день обращения, гарантия до 7 лет. Собственный сервис и склад запчастей.",
  },
  {
    slug: "nord-motors",
    regNumber: "40003623757",
    verified: true,
    name: "Nord Motors",
    type: "official",
    brands: ["toyota", "lexus"],
    city: "riga",
    address: "Ganību dambis 31",
    lat: 56.9786,
    lng: 24.1122,
    phone: "+371 2000 2003",
    hours: {
      mon: { open: "08:30", close: "19:00" },
      tue: { open: "08:30", close: "19:00" },
      wed: { open: "08:30", close: "19:00" },
      thu: { open: "08:30", close: "19:00" },
      fri: { open: "08:30", close: "19:00" },
      sat: { open: "10:00", close: "16:00" },
    },
    carsInStock: 172,
    since: 2015,
  },
  {
    slug: "autoplaza",
    regNumber: "40003631676",
    verified: true,
    name: "AutoPlaza",
    type: "official",
    brands: ["volkswagen", "skoda", "audi"],
    city: "riga",
    address: "Lubānas iela 78",
    lat: 56.9412,
    lng: 24.1821,
    phone: "+371 2000 2004",
    hours: {
      mon: { open: "09:00", close: "19:00" },
      tue: { open: "09:00", close: "19:00" },
      wed: { open: "09:00", close: "19:00" },
      thu: { open: "09:00", close: "19:00" },
      fri: { open: "09:00", close: "19:00" },
      sat: { open: "10:00", close: "16:00" },
    },
    carsInStock: 203,
    since: 2015,
  },
  {
    slug: "scandi-cars",
    regNumber: "40003639595",
    verified: true,
    name: "Scandi Cars",
    type: "official",
    brands: ["volvo"],
    city: "riga",
    address: "Mūkusalas iela 41",
    lat: 56.9305,
    lng: 24.1062,
    phone: "+371 2000 2005",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
    },
    carsInStock: 58,
    since: 2019,
  },
  {
    slug: "premium-cars-riga",
    regNumber: "40003647514",
    verified: true,
    name: "Premium Cars Riga",
    type: "used",
    brands: [],
    city: "riga",
    address: "Krasta iela 52",
    lat: 56.9334,
    lng: 24.1372,
    phone: "+371 2000 1001",
    hours: {
      mon: { open: "10:00", close: "19:00" },
      tue: { open: "10:00", close: "19:00" },
      wed: { open: "10:00", close: "19:00" },
      thu: { open: "10:00", close: "19:00" },
      fri: { open: "10:00", close: "19:00" },
      sat: { open: "10:00", close: "19:00" },
    },
    carsInStock: 47,
    since: 2019,
    description:
      "Автосалон премиальных автомобилей с пробегом. Каждый автомобиль проходит диагностику по 120 пунктам и проверку истории. Помогаем с лизингом и регистрацией в CSDD.",
  },
  {
    slug: "e-drive-riga",
    regNumber: "40003655433",
    verified: false,
    name: "E-Drive Riga",
    type: "used",
    brands: [],
    city: "riga",
    address: "Matīsa iela 25",
    lat: 56.9561,
    lng: 24.1263,
    phone: "+371 2000 2007",
    hours: {
      mon: { open: "10:00", close: "18:00" },
      tue: { open: "10:00", close: "18:00" },
      wed: { open: "10:00", close: "18:00" },
      thu: { open: "10:00", close: "18:00" },
      fri: { open: "10:00", close: "18:00" },
    },
    carsInStock: 32,
    since: 2021,
  },
  {
    slug: "jurmala-auto",
    regNumber: "40003663352",
    verified: false,
    name: "Jūrmala Auto",
    type: "used",
    brands: [],
    city: "jurmala",
    address: "Talsu šoseja 7",
    lat: 56.9681,
    lng: 23.7702,
    phone: "+371 2000 2008",
    hours: {
      mon: { open: "10:00", close: "18:00" },
      tue: { open: "10:00", close: "18:00" },
      wed: { open: "10:00", close: "18:00" },
      thu: { open: "10:00", close: "18:00" },
      fri: { open: "10:00", close: "18:00" },
      sat: { open: "10:00", close: "18:00" },
    },
    carsInStock: 29,
    since: 2020,
  },
  {
    slug: "ogre-auto",
    regNumber: "40003671271",
    verified: false,
    name: "Ogre Auto",
    type: "used",
    brands: [],
    city: "ogre",
    address: "Rīgas iela 12",
    lat: 56.8162,
    lng: 24.6051,
    phone: "+371 2000 2009",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
    },
    carsInStock: 18,
    since: 2022,
  },
  {
    slug: "zemgale-cars",
    regNumber: "40003679190",
    verified: true,
    name: "Zemgale Cars",
    type: "official",
    brands: ["renault", "dacia"],
    city: "jelgava",
    address: "Lielā iela 44",
    lat: 56.6511,
    lng: 23.7214,
    phone: "+371 2000 2010",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
      sat: { open: "10:00", close: "14:00" },
    },
    carsInStock: 64,
    since: 2017,
  },
  {
    slug: "latgale-motors",
    regNumber: "40003687109",
    verified: false,
    name: "Latgale Motors",
    type: "official",
    brands: ["hyundai"],
    city: "daugavpils",
    address: "Vidzemes iela 3",
    lat: 55.8741,
    lng: 26.5362,
    phone: "+371 2000 2011",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
    },
    carsInStock: 41,
    since: 2018,
  },
  {
    slug: "kurzeme-auto",
    regNumber: "40003695028",
    verified: false,
    name: "Kurzeme Auto",
    type: "used",
    brands: [],
    city: "liepaja",
    address: "Graudu iela 18",
    lat: 56.5047,
    lng: 21.0108,
    phone: "+371 2000 2012",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
      sat: { open: "09:00", close: "18:00" },
    },
    carsInStock: 36,
    since: 2019,
  },
  {
    slug: "ventspils-auto",
    regNumber: "40003702947",
    verified: false,
    name: "Ventspils Auto Centrs",
    type: "used",
    brands: [],
    city: "ventspils",
    address: "Kuldīgas iela 9",
    lat: 57.3937,
    lng: 21.5647,
    phone: "+371 2000 2013",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
    },
    carsInStock: 22,
    since: 2021,
  },
  {
    slug: "vidzeme-motors",
    regNumber: "40003710866",
    verified: false,
    name: "Vidzeme Motors",
    type: "used",
    brands: [],
    city: "valmiera",
    address: "Rīgas iela 60",
    lat: 57.5413,
    lng: 25.4271,
    phone: "+371 2000 2014",
    hours: {
      mon: { open: "09:00", close: "18:00" },
      tue: { open: "09:00", close: "18:00" },
      wed: { open: "09:00", close: "18:00" },
      thu: { open: "09:00", close: "18:00" },
      fri: { open: "09:00", close: "18:00" },
      sat: { open: "10:00", close: "14:00" },
    },
    carsInStock: 27,
    since: 2017,
  },
];

// Рейтинг показываем только при достаточном числе отзывов:
// «5.0» по одному отзыву вводит покупателей в заблуждение
const MIN_REVIEWS_FOR_RATING = 5;

export const hasRating = (dealer: Dealer) =>
  dealer.rating !== undefined && (dealer.reviews ?? 0) >= MIN_REVIEWS_FOR_RATING;
