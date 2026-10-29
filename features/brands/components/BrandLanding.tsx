import { getTranslations } from "next-intl/server";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import Container from "@/components/layout/Container";
import CarCard from "@/features/latest-cars/components/CarCard";
import { Link } from "@/i18n/navigation";
import { cn, formatNumber } from "@/lib/utils";

import { brands } from "../data/brands";
import { modelsByBrand } from "../data/models";
import { findBrand, listingsFor, modelSlug } from "../lib/landing";

type Props = { brand: string; model?: string };

// Страница марки / модели для поиска Google: заголовок, короткие факты, модели и объявления.
// Подробный поиск с фильтрами — кнопкой на /cars
export default async function BrandLanding({ brand, model }: Props) {
  const t = await getTranslations("cars.brandPage");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const tOptions = await getTranslations("options");

  const brandName = findBrand(brand)!.name;
  const name = model ? `${brandName} ${model}` : brandName;
  const cars = await listingsFor(brand, model);

  const prices = cars.map((l) => l.price);
  const years = cars.map((l) => l.year);
  const bodyCounts = cars.reduce<Record<string, number>>((acc, l) => ({ ...acc, [l.bodyType]: (acc[l.bodyType] ?? 0) + 1 }), {});
  const topBody = Object.entries(bodyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const facts = cars.length
    ? [
        { label: t("facts.listings"), value: formatNumber(cars.length) },
        { label: t("facts.price"), value: `${formatNumber(Math.min(...prices))}–${formatNumber(Math.max(...prices))} €` },
        { label: t("facts.years"), value: `${Math.min(...years)}–${Math.max(...years)}` },
        ...(topBody ? [{ label: t("facts.body"), value: tOptions(`bodyType.${topBody}`) }] : []),
      ]
    : [];

  const searchHref = `/cars?brand=${brand}${model ? `&model=${encodeURIComponent(model)}` : ""}`;
  const models = await Promise.all(
    (modelsByBrand[brand] ?? []).map(async (m) => ({ name: m, count: (await listingsFor(brand, m)).length }))
  );
  const otherBrands = brands.filter((b) => b.popular && b.slug !== brand).slice(0, 10);

  return (
    <Container className="pt-5 pb-12">
      <nav aria-label={t("breadcrumbs")} className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">{t("home")}</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href="/cars" className="hover:text-black">{tNav("cars")}</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        {model ? (
          <Link href={`/cars/${brand}`} className="hover:text-black">{brandName}</Link>
        ) : (
          <span className="text-gray-900">{brandName}</span>
        )}
        {model && (
          <>
            <ChevronRightIcon sx={{ fontSize: 16 }} />
            <span className="text-gray-900">{model}</span>
          </>
        )}
      </nav>

      {/* Header */}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 mt-4">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">{t("title", { name })}</h1>
          <p className="text-gray-600 mt-2 text-lg">
            {cars.length ? t("intro", { name, count: cars.length }) : t("introEmpty", { name })}
          </p>
        </div>

        <Link
          href={searchHref}
          className="shrink-0 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition"
        >
          {t("openSearch")}
          <ArrowForwardIcon fontSize="small" />
        </Link>
      </header>

      {/* Facts */}

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          {facts.map((f) => (
            <div key={f.label} className="p-4 rounded-2xl bg-gray-50">
              <dt className="text-sm text-gray-500">{f.label}</dt>
              <dd className="text-lg sm:text-xl font-semibold tracking-tight mt-1 whitespace-nowrap">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Models */}

      {!model && models.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">{t("models", { brand: brandName })}</h2>
          <div className="flex flex-wrap gap-2">
            {models.map((m) => (
              <Link
                key={m.name}
                href={`/cars/${brand}/${modelSlug(m.name)}`}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition",
                  m.count ? "border-gray-200 text-gray-900 hover:border-gray-900" : "border-gray-100 text-gray-400 hover:border-gray-300"
                )}
              >
                {m.name}
                {m.count > 0 && <span className="text-gray-500 tabular-nums">{m.count}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Listings */}

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4 mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("listings", { name })}</h2>
          {cars.length > 0 && (
            <Link href={searchHref} className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black whitespace-nowrap transition">
              {tCommon("viewAll")}
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Link>
          )}
        </div>

        {cars.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
            {cars.slice(0, 9).map((l) => (
              <CarCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-200">
            <DirectionsCarOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
            <p className="text-gray-500 mt-2">{t("empty", { name })}</p>
            <Link href={model ? `/cars/${brand}` : "/cars"} className="inline-flex mt-4 text-sm font-semibold underline underline-offset-4">
              {model ? t("allOfBrand", { brand: brandName }) : t("allCars")}
            </Link>
          </div>
        )}
      </section>

      {/* Other brands */}

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight mb-3">{t("otherBrands")}</h2>
        <div className="flex flex-wrap gap-2">
          {otherBrands.map((b) => (
            <Link key={b.slug} href={`/cars/${b.slug}`} className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 transition">
              {b.name}
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
