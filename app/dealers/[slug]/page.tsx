import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import DirectionsOutlinedIcon from "@mui/icons-material/DirectionsOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";
import ContactPhoneButton from "@/features/cars/car-view/components/ContactPhoneButton";
import { listings } from "@/features/cars/data/listings";
import DealerMiniMap from "@/features/dealers/components/DealerMiniMap";
import { dealers, hasRating } from "@/features/dealers/data/dealers";
import CarCard from "@/features/latest-cars/components/CarCard";
import { formatNumber, initials, plural } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

const findDealer = async (params: Props["params"]) => {
  const { slug } = await params;
  return dealers.find((d) => d.slug === slug);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dealer = await findDealer(params);
  if (!dealer) return {};

  return { title: `${dealer.name} — ${dealer.city} | bestauto.lv` };
}

const brandName = (slug: string) => brands.find((b) => b.slug === slug)?.name ?? slug;

export default async function DealerPage({ params }: Props) {
  const dealer = await findDealer(params);
  if (!dealer) notFound();

  const official = dealer.type === "official";
  const cars = listings.filter((l) => l.dealer === dealer.slug);
  const neighbours = dealers.filter((d) => d.city === dealer.city && d.slug !== dealer.slug).slice(0, 3);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dealer.lat},${dealer.lng}`;

  const description =
    dealer.description ??
    (official
      ? `Официальный дилер ${dealer.brands.map(brandName).join(", ")} в городе ${dealer.city}. Новые автомобили, автомобили с пробегом и сервисное обслуживание.`
      : `Автосалон автомобилей с пробегом в городе ${dealer.city}. Подбор, проверка и помощь с оформлением документов.`);

  const rated = hasRating(dealer);

  const stats = [
    { label: "Автомобилей в наличии", value: formatNumber(dealer.carsInStock) },
    { label: "Город", value: dealer.city },
    { label: "На сайте с", value: String(dealer.since) },
    ...(rated
      ? [{ label: `Рейтинг · ${formatNumber(dealer.reviews!)} отз.`, value: dealer.rating!.toFixed(1) }]
      : []),
  ];

  return (
    <Container className="pt-5 pb-12">
      {/* Breadcrumbs */}

      <nav aria-label="Навигация" className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">Главная</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href="/dealers" className="hover:text-black">Дилеры</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href={`/dealers?city=${encodeURIComponent(dealer.city)}`} className="hover:text-black">
          {dealer.city}
        </Link>
      </nav>

      {/* Header */}

      <header className="flex flex-col sm:flex-row sm:items-center gap-5 mt-4">
        <span className="w-20 h-20 shrink-0 flex items-center justify-center rounded-3xl bg-gray-900 text-white text-2xl font-bold">
          {initials(dealer.name)}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{dealer.name}</h1>
            {official && (
              <VerifiedIcon className="text-sky-600" titleAccess="Официальный дилер" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-gray-600">
            <span>{official ? "Официальный дилер" : "Автосалон с пробегом"}</span>
            {rated && (
              <>
                <span className="inline-flex items-center gap-0.5 text-gray-900 font-medium">
                  <StarIcon sx={{ fontSize: 18 }} className="text-amber-500" />
                  {dealer.rating!.toFixed(1)}
                </span>
                <span>
                  {formatNumber(dealer.reviews!)}{" "}
                  {plural(dealer.reviews!, ["отзыв", "отзыва", "отзывов"])}
                </span>
              </>
            )}
          </div>

          {official && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {dealer.brands.map((b) => (
                <Link
                  key={b}
                  href={`/cars?brand=${b}`}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-800 transition"
                >
                  {brandName(b)}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* На телефоне — контакт сразу под шапкой, на десктопе он в сайдбаре */}
      <ContactPhoneButton phone={dealer.phone} className="w-full mt-5 lg:hidden" />

      {/* Stats */}

      <div className={`grid grid-cols-2 gap-3 mt-8 ${rated ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-gray-50">
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 xl:gap-16 mt-10 items-start">
        {/* Main */}

        <div className="min-w-0 space-y-12">
          <section>
            <div className="flex items-end justify-between gap-4 mb-5">
              <h2 className="text-xl font-semibold tracking-tight">Автомобили в наличии</h2>

              <Link
                href={`/cars?dealer=${dealer.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black transition"
              >
                Все {formatNumber(dealer.carsInStock)}
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </Link>
            </div>

            {cars.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8">
                {cars.slice(0, 6).map((l) => (
                  <CarCard key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-gray-200">
                <DirectionsCarOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
                <p className="text-gray-500 mt-2">Дилер пока не разместил объявления на сайте</p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold tracking-tight mb-3">О компании</h2>
            <p className="text-gray-800 leading-relaxed max-w-2xl">{description}</p>
          </section>
        </div>

        {/* Sidebar */}

        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="rounded-2xl border border-gray-200 p-5 shadow-xl shadow-black/5">
            <ContactPhoneButton phone={dealer.phone} className="w-full" />

            <div className="mt-5 space-y-3 text-sm text-gray-800">
              <div className="flex items-start gap-2">
                <PlaceOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-500" />
                <span>
                  {dealer.address}, {dealer.city}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ScheduleOutlinedIcon sx={{ fontSize: 20 }} className="text-gray-500" />
                <span>{dealer.hours}</span>
              </div>
            </div>

            <div className="mt-5">
              <DealerMiniMap dealer={dealer} />
            </div>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-gray-200 text-sm font-medium hover:border-gray-900 transition"
            >
              <DirectionsOutlinedIcon fontSize="small" />
              Построить маршрут
            </a>
          </div>

          {neighbours.length > 0 && (
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold mb-3">Другие дилеры · {dealer.city}</h3>

              <ul className="space-y-1 -mx-2">
                {neighbours.map((d) => (
                  <li key={d.slug}>
                    <Link
                      href={`/dealers/${d.slug}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-xl bg-gray-900 text-white text-xs font-bold">
                        {initials(d.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-gray-900 truncate">{d.name}</span>
                        <span className="block text-xs text-gray-500">
                          {hasRating(d) && `★ ${d.rating!.toFixed(1)} · `}
                          {formatNumber(d.carsInStock)} авто
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </Container>
  );
}
