"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Popover } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

import { brands } from "@/features/brands/data/brands";
import { modelsByBrand } from "@/features/brands/data/models";
import {
  collectionHref,
  visibleCollections,
} from "@/features/collections/data/collections";
import { formatNumber } from "@/lib/utils";

type Panel = "brand" | "model" | "price" | "year";

const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
const totalCount = brands.reduce((sum, b) => sum + b.count, 0);

const conditions = [
  { label: "Все", value: "" },
  { label: "С пробегом", value: "used" },
  { label: "Новые", value: "new" },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 24 }, (_, i) => String(currentYear - i));

const pricePresets = [3000, 5000, 10000, 15000, 20000, 30000];

const formatPrice = (from: string, to: string) => {
  if (from && to) return `${formatNumber(+from)} – ${formatNumber(+to)} €`;
  if (from) return `от ${formatNumber(+from)} €`;
  if (to) return `до ${formatNumber(+to)} €`;
  return "";
};

/* ---------- UI parts ---------- */

type SegmentProps = {
  label: string;
  value: string;
  placeholder: string;
  active: boolean;
  disabled?: boolean;
  onOpen: (el: HTMLElement) => void;
  onClear: () => void;
  segmentRef?: React.Ref<HTMLDivElement>;
};

function Segment({
  label,
  value,
  placeholder,
  active,
  disabled,
  onOpen,
  onClear,
  segmentRef,
}: SegmentProps) {
  return (
    <div ref={segmentRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => onOpen(e.currentTarget.parentElement!)}
        className={`
          w-full text-left
          px-5 py-2.5
          rounded-2xl md:rounded-full
          transition
          cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-60
          ${active ? "bg-gray-100" : "hover:bg-gray-50"}
        `}
      >
        <div className="text-xs font-semibold text-gray-900">{label}</div>

        <div
          className={`text-sm truncate pr-6 ${
            value ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {value || placeholder}
        </div>
      </button>

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label={`Очистить: ${label}`}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            w-6 h-6
            flex items-center justify-center
            rounded-full
            text-gray-400
            hover:bg-gray-200 hover:text-gray-700
            transition
            cursor-pointer
          "
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </button>
      )}
    </div>
  );
}

function SegmentDivider() {
  return (
    <>
      <div className="hidden md:block w-px h-8 bg-gray-200 shrink-0" />
      <div className="md:hidden h-px bg-gray-100 mx-4" />
    </>
  );
}

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-between gap-3
        px-3 py-2
        rounded-lg
        text-sm text-left
        transition
        cursor-pointer
        ${selected ? "bg-gray-900 text-white" : "text-gray-800 hover:bg-gray-100"}
      `}
    >
      {children}
    </button>
  );
}

const priceInputClass = `
  w-full
  px-3 py-2.5
  rounded-xl
  border border-gray-200
  text-sm
  outline-none
  focus:border-gray-900
  transition
`;

/* ---------- Main ---------- */

export default function QuickSearch() {
  const router = useRouter();
  const modelRef = useRef<HTMLDivElement>(null);

  const [panel, setPanel] = useState<Panel | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const [condition, setCondition] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [brandQuery, setBrandQuery] = useState("");

  const models = modelsByBrand[brand] ?? [];
  const brandName = brands.find((b) => b.slug === brand)?.name ?? "";

  // Пока считаем только по марке — позже счётчик будет приходить из API
  const count = brand
    ? brands.find((b) => b.slug === brand)?.count ?? 0
    : totalCount;

  const filteredBrands = sortedBrands.filter((b) =>
    b.name.toLowerCase().includes(brandQuery.trim().toLowerCase())
  );

  const openPanel = (name: Panel, el: HTMLElement) => {
    setPanel(name);
    setAnchorEl(el);
  };

  const closePanel = () => {
    setPanel(null);
    setAnchorEl(null);
    setBrandQuery("");
  };

  const selectBrand = (slug: string) => {
    setBrand(slug);
    setModel("");
    setBrandQuery("");

    // сразу предлагаем выбрать модель
    if (slug && modelsByBrand[slug] && modelRef.current) {
      openPanel("model", modelRef.current);
    } else {
      closePanel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    const filters = { condition, brand, model, priceFrom, priceTo, yearFrom };

    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }

    const query = params.toString();
    router.push(query ? `/cars?${query}` : "/cars");
  };

  return (
    <section className="pt-6 pb-4">
      <div className="relative rounded-3xl overflow-hidden bg-gray-900">
        {/* Background */}

        <Image
          src="/cars/bmw.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1248px, 100vw"
          className="object-cover object-[70%_center]"
        />

        <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/55 to-black/10" />

        {/* Content */}

        <div className="relative px-4 py-10 sm:px-10 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white max-w-2xl leading-tight">
            Найдите свой следующий автомобиль
          </h1>

          <p className="text-white/75 mt-3 sm:text-lg">
            {formatNumber(totalCount)} объявлений от частных лиц и дилеров по
            всей Латвии
          </p>

          {/* Condition */}

          <div className="inline-flex mt-8 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            {conditions.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCondition(c.value)}
                aria-pressed={condition === c.value}
                className={`
                  px-4 py-1.5
                  rounded-full
                  text-sm font-medium
                  transition
                  cursor-pointer
                  ${
                    condition === c.value
                      ? "bg-white text-gray-900"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search bar */}

          <form
            onSubmit={handleSubmit}
            className="
              mt-4 max-w-5xl
              flex flex-col md:flex-row md:items-center
              gap-1 md:gap-0
              p-2
              bg-white
              rounded-3xl md:rounded-full
              shadow-2xl shadow-black/30
            "
          >
            <Segment
              label="Марка"
              value={brandName}
              placeholder="Любая марка"
              active={panel === "brand"}
              onOpen={(el) => openPanel("brand", el)}
              onClear={() => selectBrand("")}
            />

            <SegmentDivider />

            <Segment
              segmentRef={modelRef}
              label="Модель"
              value={model}
              placeholder={brand ? "Любая модель" : "Сначала марку"}
              active={panel === "model"}
              disabled={!brand || models.length === 0}
              onOpen={(el) => openPanel("model", el)}
              onClear={() => setModel("")}
            />

            <SegmentDivider />

            <Segment
              label="Цена"
              value={formatPrice(priceFrom, priceTo)}
              placeholder="Любая"
              active={panel === "price"}
              onOpen={(el) => openPanel("price", el)}
              onClear={() => {
                setPriceFrom("");
                setPriceTo("");
              }}
            />

            <SegmentDivider />

            <Segment
              label="Год выпуска"
              value={yearFrom ? `от ${yearFrom}` : ""}
              placeholder="Любой"
              active={panel === "year"}
              onOpen={(el) => openPanel("year", el)}
              onClear={() => setYearFrom("")}
            />

            <button
              type="submit"
              className="
                md:ml-2 shrink-0
                h-12 md:h-14
                px-6
                flex items-center justify-center gap-2
                rounded-2xl md:rounded-full
                bg-primary hover:bg-primary-hover
                text-white font-semibold
                shadow-lg shadow-primary/30
                transition
                cursor-pointer
              "
            >
              <SearchIcon fontSize="small" />
              Показать {formatNumber(count)}
            </button>
          </form>

          {/* Collections */}

          <div className="flex flex-wrap items-center gap-2 mt-5">
            <span className="text-sm text-white/60 mr-1">Подборки:</span>

            {visibleCollections.map((c) => {
              const Icon = c.icon;

              return (
                <Link
                  key={c.slug}
                  href={collectionHref(c.slug)}
                  className="
                    inline-flex items-center gap-1.5
                    pl-2.5 pr-3 py-1
                    rounded-full
                    text-sm text-white
                    bg-white/10 hover:bg-white/20
                    border border-white/15
                    backdrop-blur-md
                    transition
                  "
                >
                  <Icon sx={{ fontSize: 16 }} />
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Panels */}

      <Popover
        open={Boolean(panel && anchorEl)}
        anchorEl={anchorEl}
        onClose={closePanel}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              p: 2,
              width: 360,
              maxWidth: "calc(100vw - 32px)",
              borderRadius: "20px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        {panel === "brand" && (
          <div>
            <input
              autoFocus
              value={brandQuery}
              onChange={(e) => setBrandQuery(e.target.value)}
              placeholder="Найти марку"
              className={priceInputClass}
            />

            <div className="mt-2 max-h-80 overflow-y-auto flex flex-col">
              {filteredBrands.map((b) => (
                <OptionButton
                  key={b.slug}
                  selected={brand === b.slug}
                  onClick={() => selectBrand(b.slug)}
                >
                  <span>{b.name}</span>
                  <span
                    className={`text-xs tabular-nums ${
                      brand === b.slug ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {formatNumber(b.count)}
                  </span>
                </OptionButton>
              ))}

              {filteredBrands.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-6">
                  Ничего не найдено
                </p>
              )}
            </div>
          </div>
        )}

        {panel === "model" && (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
              Модели {brandName}
            </div>

            <div className="grid grid-cols-2 gap-1 max-h-80 overflow-y-auto">
              <OptionButton
                selected={!model}
                onClick={() => {
                  setModel("");
                  closePanel();
                }}
              >
                Любая
              </OptionButton>

              {models.map((m) => (
                <OptionButton
                  key={m}
                  selected={model === m}
                  onClick={() => {
                    setModel(m);
                    closePanel();
                  }}
                >
                  {m}
                </OptionButton>
              ))}
            </div>
          </div>
        )}

        {panel === "price" && (
          <div>
            <div className="grid grid-cols-2 gap-2">
              <input
                autoFocus
                type="number"
                min={0}
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                placeholder="От, €"
                className={priceInputClass}
              />

              <input
                type="number"
                min={0}
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                placeholder="До, €"
                className={priceInputClass}
              />
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {pricePresets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setPriceFrom("");
                    setPriceTo(String(p));
                  }}
                  className={`
                    px-3 py-1.5
                    rounded-full
                    text-sm
                    border
                    transition
                    cursor-pointer
                    ${
                      priceTo === String(p) && !priceFrom
                        ? "bg-gray-900 border-gray-900 text-white"
                        : "border-gray-200 text-gray-700 hover:border-gray-900"
                    }
                  `}
                >
                  до {formatNumber(p)} €
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={closePanel}
              className="mt-4 w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-black transition cursor-pointer"
            >
              Готово
            </button>
          </div>
        )}

        {panel === "year" && (
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 px-1">
              Год выпуска от
            </div>

            <div className="grid grid-cols-4 gap-1">
              <OptionButton
                selected={!yearFrom}
                onClick={() => {
                  setYearFrom("");
                  closePanel();
                }}
              >
                Любой
              </OptionButton>

              {years.map((y) => (
                <OptionButton
                  key={y}
                  selected={yearFrom === y}
                  onClick={() => {
                    setYearFrom(y);
                    closePanel();
                  }}
                >
                  {y}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </Popover>
    </section>
  );
}
