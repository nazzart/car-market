// Временные данные — позже заменим на запрос к БД. Компании вымышленные
export type Dealer = {
  slug: string;
  name: string;
  type: "official" | "used"; // официальный дилер / автосалон с пробегом
  brands: string[]; // slug марок, для официальных дилеров
  city: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
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
    name: "Baltic Auto",
    type: "official",
    brands: ["bmw", "mini"],
    city: "Рига",
    address: "Карла Улманя гатве, 86",
    lat: 56.9345,
    lng: 24.0475,
    phone: "+371 2000 2001",
    hours: "Пн–Пт 9:00–19:00, Сб 10:00–16:00",
    carsInStock: 126,
    since: 2016,
    description:
      "Официальный дилер BMW и MINI в Риге. Продажа новых автомобилей и автомобилей с пробегом BMW Premium Selection, сервисный центр, кузовной ремонт и шиномонтаж. Возможен лизинг и трейд-ин — оценка вашего автомобиля за 30 минут.",
  },
  {
    slug: "kia-center-riga",
    name: "Kia Center Riga",
    type: "official",
    brands: ["kia"],
    city: "Рига",
    address: "Бривибас гатве, 201",
    lat: 56.9852,
    lng: 24.1918,
    phone: "+371 2000 2002",
    hours: "Пн–Пт 9:00–19:00, Сб 10:00–15:00",
    carsInStock: 84,
    since: 2018,
    description:
      "Официальный дилер Kia: весь модельный ряд в наличии и под заказ, тест-драйв в день обращения, гарантия до 7 лет. Собственный сервис и склад запчастей.",
  },
  {
    slug: "nord-motors",
    name: "Nord Motors",
    type: "official",
    brands: ["toyota", "lexus"],
    city: "Рига",
    address: "Ганибу дамбис, 31",
    lat: 56.9786,
    lng: 24.1122,
    phone: "+371 2000 2003",
    hours: "Пн–Пт 8:30–19:00, Сб 10:00–16:00",
    carsInStock: 172,
    since: 2015,
  },
  {
    slug: "autoplaza",
    name: "AutoPlaza",
    type: "official",
    brands: ["volkswagen", "skoda", "audi"],
    city: "Рига",
    address: "ул. Лубанас, 78",
    lat: 56.9412,
    lng: 24.1821,
    phone: "+371 2000 2004",
    hours: "Пн–Пт 9:00–19:00, Сб 10:00–16:00",
    carsInStock: 203,
    since: 2015,
  },
  {
    slug: "scandi-cars",
    name: "Scandi Cars",
    type: "official",
    brands: ["volvo"],
    city: "Рига",
    address: "ул. Мукусалас, 41",
    lat: 56.9305,
    lng: 24.1062,
    phone: "+371 2000 2005",
    hours: "Пн–Пт 9:00–18:00",
    carsInStock: 58,
    since: 2019,
  },
  {
    slug: "premium-cars-riga",
    name: "Premium Cars Riga",
    type: "used",
    brands: [],
    city: "Рига",
    address: "ул. Краста, 52",
    lat: 56.9334,
    lng: 24.1372,
    phone: "+371 2000 1001",
    hours: "Пн–Сб 10:00–19:00",
    carsInStock: 47,
    since: 2019,
    description:
      "Автосалон премиальных автомобилей с пробегом. Каждый автомобиль проходит диагностику по 120 пунктам и проверку истории. Помогаем с лизингом и регистрацией в CSDD.",
  },
  {
    slug: "e-drive-riga",
    name: "E-Drive Riga",
    type: "used",
    brands: [],
    city: "Рига",
    address: "ул. Матиса, 25",
    lat: 56.9561,
    lng: 24.1263,
    phone: "+371 2000 2007",
    hours: "Пн–Пт 10:00–18:00",
    carsInStock: 32,
    since: 2021,
  },
  {
    slug: "jurmala-auto",
    name: "Jūrmala Auto",
    type: "used",
    brands: [],
    city: "Юрмала",
    address: "Талсу шоссе, 7",
    lat: 56.9681,
    lng: 23.7702,
    phone: "+371 2000 2008",
    hours: "Пн–Сб 10:00–18:00",
    carsInStock: 29,
    since: 2020,
  },
  {
    slug: "ogre-auto",
    name: "Ogre Auto",
    type: "used",
    brands: [],
    city: "Огре",
    address: "ул. Ригас, 12",
    lat: 56.8162,
    lng: 24.6051,
    phone: "+371 2000 2009",
    hours: "Пн–Пт 9:00–18:00",
    carsInStock: 18,
    since: 2022,
  },
  {
    slug: "zemgale-cars",
    name: "Zemgale Cars",
    type: "official",
    brands: ["renault", "dacia"],
    city: "Елгава",
    address: "ул. Лиела, 44",
    lat: 56.6511,
    lng: 23.7214,
    phone: "+371 2000 2010",
    hours: "Пн–Пт 9:00–18:00, Сб 10:00–14:00",
    carsInStock: 64,
    since: 2017,
  },
  {
    slug: "latgale-motors",
    name: "Latgale Motors",
    type: "official",
    brands: ["hyundai"],
    city: "Даугавпилс",
    address: "ул. Видземес, 3",
    lat: 55.8741,
    lng: 26.5362,
    phone: "+371 2000 2011",
    hours: "Пн–Пт 9:00–18:00",
    carsInStock: 41,
    since: 2018,
  },
  {
    slug: "kurzeme-auto",
    name: "Kurzeme Auto",
    type: "used",
    brands: [],
    city: "Лиепая",
    address: "ул. Граудю, 18",
    lat: 56.5047,
    lng: 21.0108,
    phone: "+371 2000 2012",
    hours: "Пн–Сб 9:00–18:00",
    carsInStock: 36,
    since: 2019,
  },
  {
    slug: "ventspils-auto",
    name: "Ventspils Auto Centrs",
    type: "used",
    brands: [],
    city: "Вентспилс",
    address: "ул. Кулдигас, 9",
    lat: 57.3937,
    lng: 21.5647,
    phone: "+371 2000 2013",
    hours: "Пн–Пт 9:00–18:00",
    carsInStock: 22,
    since: 2021,
  },
  {
    slug: "vidzeme-motors",
    name: "Vidzeme Motors",
    type: "used",
    brands: [],
    city: "Валмиера",
    address: "ул. Ригас, 60",
    lat: 57.5413,
    lng: 25.4271,
    phone: "+371 2000 2014",
    hours: "Пн–Пт 9:00–18:00, Сб 10:00–14:00",
    carsInStock: 27,
    since: 2017,
  },
];

// Рейтинг показываем только при достаточном числе отзывов:
// «5.0» по одному отзыву вводит покупателей в заблуждение
const MIN_REVIEWS_FOR_RATING = 5;

export const hasRating = (dealer: Dealer) =>
  dealer.rating !== undefined && (dealer.reviews ?? 0) >= MIN_REVIEWS_FOR_RATING;
