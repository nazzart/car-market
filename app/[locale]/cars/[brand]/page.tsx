import { redirect } from "@/i18n/navigation";

// Страница марки — это поиск с фильтром по марке (/cars/bmw → /cars?brand=bmw).
// Объявление открывается по /listing/[id]
export default async function BrandPage({
  params,
}: {
  params: Promise<{ locale: string; brand: string }>;
}) {
  const { locale, brand } = await params;

  redirect({ href: `/cars?brand=${encodeURIComponent(brand)}`, locale });
}
