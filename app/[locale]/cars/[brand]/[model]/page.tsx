import { redirect } from "@/i18n/navigation";

// /cars/bmw/m4 → /cars?brand=bmw&model=m4
export default async function ModelPage({
  params,
}: {
  params: Promise<{ locale: string; brand: string; model: string }>;
}) {
  const { locale, brand, model } = await params;

  redirect({
    href: `/cars?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`,
    locale,
  });
}
