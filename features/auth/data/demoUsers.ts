// Демо-аккаунты, пока нет настоящей авторизации. Читаются только через features/auth/api.ts
import type { User } from "../types";

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
