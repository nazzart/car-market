import type { Listing } from "@/features/cars/types";

// Объявление для тестов: всё обязательное заполнено, нужное — переопределяется
export const makeListing = (overrides: Partial<Listing> = {}): Listing => ({
  id: "1",
  title: "Volkswagen Golf",
  brand: "volkswagen",
  model: "Golf",
  year: 2018,
  price: 12000,
  mileage: 120000,
  fuel: "diesel",
  transmission: "manual",
  drive: "fwd",
  bodyType: "hatchback",
  condition: "used",
  power: 110,
  engine: 1.6,
  sellerType: "private",
  city: "riga",
  postedMinutesAgo: 60,
  phone: "+371 2000 0000",
  images: ["/cars/golf.jpg"],
  status: "active",
  ...overrides,
} as Listing);
