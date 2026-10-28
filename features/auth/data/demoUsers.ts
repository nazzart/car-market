import type { Dealer } from "@/features/dealers/data/dealers";

// Демо-аккаунты, пока нет настоящей авторизации. Пароль у обоих — DEMO_PASSWORD

// Изменения, которые дилер сделал в настройках (поверх данных из dealers.ts)
export type DealerProfile = Partial<
  Pick<Dealer, "type" | "brands" | "regNumber" | "description" | "address" | "city" | "lat" | "lng" | "hours">
>;

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
  dealerProfile?: DealerProfile;
  role?: "admin"; // модератор: доступ к /admin
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
    listingIds: ["2", "9", "13"],
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
  {
    id: "demo-admin",
    type: "individual",
    role: "admin",
    name: "Moderators",
    email: "admin@demo.lv",
    phone: "+371 2000 0000",
    city: "riga",
    since: 2026,
  },
];

export const isAdmin = (user: User | null | undefined) => user?.role === "admin";

export const findDemoUser = (email: string, password: string) =>
  password === DEMO_PASSWORD
    ? demoUsers.find((u) => u.email === email.trim().toLowerCase())
    : undefined;
