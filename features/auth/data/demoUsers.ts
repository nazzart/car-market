// Демо-аккаунты, пока нет настоящей авторизации. Пароль у обоих — DEMO_PASSWORD
export type User = {
  id: string;
  type: "individual" | "dealer";
  name: string;
  email: string;
  phone: string;
  city: string; // ключ города
  since: number;
  dealerSlug?: string; // для дилера — его страница /dealers/[slug]
  listingIds?: string[]; // объявления частного лица
};

export const DEMO_PASSWORD = "demo1234";

export const demoUsers: User[] = [
  {
    id: "demo-individual",
    type: "individual",
    name: "Andris Bērziņš",
    email: "andris@demo.lv",
    phone: "+371 2000 3001",
    city: "riga",
    since: 2023,
    listingIds: ["2", "9"],
  },
  {
    id: "demo-dealer",
    type: "dealer",
    name: "Baltic Auto",
    email: "dealer@demo.lv",
    phone: "+371 2000 2001",
    city: "riga",
    since: 2016,
    dealerSlug: "baltic-auto",
  },
];

export const findDemoUser = (email: string, password: string) =>
  password === DEMO_PASSWORD
    ? demoUsers.find((u) => u.email === email.trim().toLowerCase())
    : undefined;
