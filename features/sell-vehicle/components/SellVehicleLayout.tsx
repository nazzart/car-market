"use client";

import { useSearchParams } from "next/navigation";

import { useRouter } from "@/i18n/navigation";

import CategoryView from "../views/CategoryView";
import { SellCarView } from "../views/SellCarView";

// Категория хранится в URL (/sell?category=car) — работают «Назад» и обновление страницы
export function SellVehicleLayout() {
  const router = useRouter();
  const category = useSearchParams().get("category");

  // пока форма есть только для легковых
  if (category !== "car") {
    return <CategoryView onSelect={(cat) => router.push(`/sell?category=${cat}`)} />;
  }

  return <SellCarView />;
}
