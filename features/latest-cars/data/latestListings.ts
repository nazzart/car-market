// Временные данные — позже заменим на запрос к БД
export type ListingPreview = {
  id: string;
  title: string;
  year: number;
  price: number;
  mileage: number;
  fuel: string;
  transmission: string;
  city: string;
  postedAt: string;
  image?: string;
};

export const latestListings: ListingPreview[] = [
  {
    id: "1",
    title: "Audi RS7 Sportback",
    year: 2019,
    price: 68900,
    mileage: 54000,
    fuel: "Бензин",
    transmission: "Автомат",
    city: "Рига",
    postedAt: "15 минут назад",
    image: "/cars/bmw.jpg",
  },
  {
    id: "2",
    title: "BMW M4 Coupe",
    year: 2018,
    price: 47500,
    mileage: 61000,
    fuel: "Бензин",
    transmission: "Автомат",
    city: "Юрмала",
    postedAt: "1 час назад",
    image: "/cars/bmw1.jpg",
  },
  {
    id: "3",
    title: "Volkswagen Golf VII",
    year: 2016,
    price: 11200,
    mileage: 148000,
    fuel: "Дизель",
    transmission: "Механика",
    city: "Даугавпилс",
    postedAt: "2 часа назад",
  },
  {
    id: "4",
    title: "BMW 440i Gran Coupe",
    year: 2020,
    price: 39900,
    mileage: 42000,
    fuel: "Бензин",
    transmission: "Автомат",
    city: "Рига",
    postedAt: "3 часа назад",
    image: "/cars/bmw3.jpg",
  },
  {
    id: "5",
    title: "Toyota RAV4 Hybrid",
    year: 2021,
    price: 32400,
    mileage: 38000,
    fuel: "Гибрид",
    transmission: "Автомат",
    city: "Елгава",
    postedAt: "4 часа назад",
  },
  {
    id: "6",
    title: "Skoda Octavia Combi",
    year: 2017,
    price: 12900,
    mileage: 176000,
    fuel: "Дизель",
    transmission: "Автомат",
    city: "Лиепая",
    postedAt: "Сегодня",
  },
  {
    id: "7",
    title: "Volvo XC60",
    year: 2019,
    price: 29800,
    mileage: 97000,
    fuel: "Дизель",
    transmission: "Автомат",
    city: "Рига",
    postedAt: "Сегодня",
  },
  {
    id: "8",
    title: "Tesla Model 3 Long Range",
    year: 2022,
    price: 31500,
    mileage: 45000,
    fuel: "Электро",
    transmission: "Автомат",
    city: "Валмиера",
    postedAt: "Вчера",
  },
];
