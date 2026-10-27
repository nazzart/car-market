"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import VerifiedIcon from "@mui/icons-material/Verified";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

import { brands } from "@/features/brands/data/brands";
import { User } from "@/features/auth/data/demoUsers";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { Listing, listings } from "@/features/cars/data/listings";
import { dealers } from "@/features/dealers/data/dealers";
import { formatNumber, initials, plural } from "@/lib/utils";

// Пока статистики нет — считаем примерные значения от просмотров
const phoneShows = (l: Listing) => Math.round((l.views ?? 0) * 0.12);
const favorites = (l: Listing) => Math.round((l.views ?? 0) * 0.05);

const userListings = (user: User) =>
  user.type === "dealer"
    ? listings.filter((l) => l.dealer === user.dealerSlug)
    : listings.filter((l) => user.listingIds?.includes(l.id));

const tabs = [
  { value: "active", label: "Активные" },
  { value: "draft", label: "Черновики" },
  { value: "sold", label: "Проданные" },
];

const primaryButton =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition";

const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 h-11 px-5 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium text-gray-900 transition";

function LoggedOut() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gray-100 text-gray-700 mb-5">
        <LockOutlinedIcon sx={{ fontSize: 30 }} />
      </span>

      <h1 className="text-2xl font-semibold tracking-tight">Личный кабинет</h1>
      <p className="text-gray-500 mt-2">
        Войдите, чтобы управлять объявлениями и следить за просмотрами
      </p>

      <button type="button" onClick={openAuthModal} className={`${primaryButton} mt-6 px-8 cursor-pointer`}>
        Войти
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Для проверки есть демо-вход: частное лицо или дилер
      </p>
    </div>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  return (
    <div className="flex gap-4 p-3 rounded-2xl border border-gray-200">
      <div className="relative w-28 sm:w-36 aspect-[4/3] shrink-0 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        {listing.images[0] ? (
          <Image src={listing.images[0]} alt={listing.title} fill sizes="144px" className="object-cover" />
        ) : (
          <DirectionsCarOutlinedIcon className="text-gray-300" />
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-medium">
              Активно
            </span>
            <span className="text-xs text-gray-500">{listing.postedAt}</span>
          </div>

          <div className="font-semibold text-gray-900 truncate mt-1">
            {listing.title}, {listing.year}
          </div>
          <div className="font-bold text-gray-900">{formatNumber(listing.price)} €</div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <VisibilityOutlinedIcon sx={{ fontSize: 14 }} />
              {formatNumber(listing.views ?? 0)}
            </span>
            <span className="inline-flex items-center gap-1">
              <PhoneOutlinedIcon sx={{ fontSize: 14 }} />
              {formatNumber(phoneShows(listing))}
            </span>
            <span className="inline-flex items-center gap-1">
              <FavoriteBorderIcon sx={{ fontSize: 14 }} />
              {formatNumber(favorites(listing))}
            </span>
          </div>
        </div>

        <Link href={`/listing/${listing.id}`} className={`${secondaryButton} h-9 px-4 self-start sm:self-auto`}>
          Открыть
        </Link>
      </div>
    </div>
  );
}

export default function AccountView() {
  const { user } = useAuth();
  const [tab, setTab] = useState("active");

  if (!user) return <LoggedOut />;

  const isDealer = user.type === "dealer";
  const dealer = dealers.find((d) => d.slug === user.dealerSlug);
  const own = userListings(user);
  const shown = tab === "active" ? own : [];

  const totalViews = own.reduce((sum, l) => sum + (l.views ?? 0), 0);

  const stats = [
    {
      label: plural(own.length, ["активное объявление", "активных объявления", "активных объявлений"]),
      value: own.length,
      icon: DirectionsCarOutlinedIcon,
    },
    { label: "просмотров", value: totalViews, icon: VisibilityOutlinedIcon },
    { label: "показов телефона", value: own.reduce((s, l) => s + phoneShows(l), 0), icon: PhoneOutlinedIcon },
    { label: "добавили в избранное", value: own.reduce((s, l) => s + favorites(l), 0), icon: FavoriteBorderIcon },
  ];

  return (
    <div className="pt-8 pb-16">
      {/* Header */}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <span
            className={`w-16 h-16 shrink-0 flex items-center justify-center bg-gray-900 text-white text-xl font-bold ${
              isDealer ? "rounded-2xl" : "rounded-full"
            }`}
          >
            {initials(user.name)}
          </span>

          <div className="min-w-0">
            <p className="text-sm text-gray-500">{isDealer ? "Кабинет дилера" : "Личный кабинет"}</p>
            <h1 className="flex items-center gap-2 text-2xl sm:text-3xl font-semibold tracking-tight">
              {isDealer ? user.name : `Здравствуйте, ${user.name.split(" ")[0]}`}
              {isDealer && <VerifiedIcon className="text-sky-600" titleAccess="Официальный дилер" />}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDealer && dealer && (
            <Link href={`/dealers/${dealer.slug}`} className={secondaryButton}>
              <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
              Публичная страница
            </Link>
          )}

          <Link href="/sell" className={primaryButton}>
            <AddIcon sx={{ fontSize: 18 }} />
            Разместить объявление
          </Link>
        </div>
      </header>

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 rounded-2xl bg-gray-50">
            <Icon fontSize="small" className="text-gray-500" />
            <div className="text-2xl font-semibold tracking-tight mt-2">{formatNumber(value)}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">Статистика за последние 30 дней</p>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-8 mt-10 items-start">
        {/* Listings */}

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold tracking-tight">
              {isDealer ? "Автомобили в продаже" : "Мои объявления"}
            </h2>

            <div className="flex p-1 rounded-xl bg-gray-100">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={tab === t.value}
                  onClick={() => setTab(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition cursor-pointer ${
                    tab === t.value ? "bg-white text-gray-900 font-medium shadow-sm" : "text-gray-600 hover:text-black"
                  }`}
                >
                  {t.label}
                  <span className="ml-1 text-gray-400">{t.value === "active" ? own.length : 0}</span>
                </button>
              ))}
            </div>
          </div>

          {shown.length > 0 ? (
            <div className="space-y-3">
              {shown.map((l) => (
                <ListingRow key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-6 rounded-2xl border border-dashed border-gray-200">
              <DirectionsCarOutlinedIcon sx={{ fontSize: 44 }} className="text-gray-300" />
              <p className="text-gray-500 mt-2">Здесь пока пусто</p>
            </div>
          )}
        </section>

        {/* Sidebar */}

        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-200 p-5">
            <h3 className="font-semibold mb-3">{isDealer ? "Контакты компании" : "Профиль"}</h3>

            <dl className="space-y-2 text-sm">
              {!isDealer && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Имя</dt>
                  <dd className="text-gray-900 text-right">{user.name}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900 text-right truncate">{user.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Телефон</dt>
                <dd className="text-gray-900 text-right">{user.phone}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Город</dt>
                <dd className="text-gray-900 text-right">{user.city}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">На сайте с</dt>
                <dd className="text-gray-900 text-right">{user.since}</dd>
              </div>
            </dl>

            <Link href="/account/profile" className={`${secondaryButton} w-full mt-5`}>
              Редактировать профиль
            </Link>
          </div>

          {isDealer && dealer && (
            <div className="rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">Дилерский центр</h3>

              <div className="space-y-2 text-sm text-gray-800">
                <div className="flex items-start gap-2">
                  <PlaceOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
                  {dealer.address}, {dealer.city}
                </div>
                <div className="flex items-start gap-2">
                  <ScheduleOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500" />
                  {dealer.hours}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {dealer.brands.map((b) => (
                  <span key={b} className="px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                    {brands.find((brand) => brand.slug === b)?.name ?? b}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!isDealer && (
            <div className="flex gap-3 rounded-2xl bg-gray-50 p-5 text-sm text-gray-700">
              <MailOutlineIcon fontSize="small" className="text-gray-500 shrink-0" />
              Покупатели связываются с вами по телефону из объявления. Номер показывается только после
              нажатия «Показать телефон».
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
