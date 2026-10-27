import { redirect } from "next/navigation";

// /cars/bmw/m4 → /cars?brand=bmw&model=m4
export default async function ModelPage({
  params,
}: {
  params: Promise<{ brand: string; model: string }>;
}) {
  const { brand, model } = await params;

  redirect(
    `/cars?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}`
  );
}
