import type { Dealer } from "@/features/dealers/types";

// Изменения, которые дилер сделал в настройках (поверх данных каталога дилеров)
export type DealerProfile = Partial<
  Pick<Dealer, "type" | "brands" | "contacts" | "regNumber" | "description" | "address" | "city" | "lat" | "lng" | "hours">
>;

export type User = {
  id: string;
  type: "individual" | "dealer";
  name: string;
  email: string;
  phone: string;
  city: string; // ключ места из lib/places.ts (город или край)
  since: number;
  dealerSlug?: string; // для дилера — его страница /dealers/[slug]
  dealerProfile?: DealerProfile;
  role?: "admin"; // модератор: доступ к /admin
};

export const isAdmin = (user: User | null | undefined) => user?.role === "admin";
