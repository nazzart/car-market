import { redirect } from "next/navigation";

// Страница марки — это поиск с фильтром по марке (/cars/bmw → /cars?brand=bmw).
// Объявление открывается по /listing/[id]
export default async function BrandPage({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand } = await params;

  redirect(`/cars?brand=${encodeURIComponent(brand)}`);
}
