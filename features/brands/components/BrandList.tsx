"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import Button from "@/components/ui/Button";
import { useListingStats } from "@/features/cars/hooks";
import { Link } from "@/i18n/navigation";
import { cn, formatNumber } from "@/lib/utils";

import { type Brand, brands } from "../data/brands";

const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
// в свёрнутом виде — не больше стольких марок с объявлениями
const COLLAPSED_LIMIT = 18;

const groupByLetter = (list: Brand[]) => {
  const groups: Record<string, Brand[]> = {};

  for (const brand of list) {
    const letter = brand.name[0].toUpperCase();
    (groups[letter] ??= []).push(brand);
  }

  return Object.entries(groups);
};

type BrandTileProps = { brand: Brand; count: number };

// Свёрнутый вид: плитка «Audi 13» — число рядом с названием, а не через всю колонку
function BrandTile({ brand, count }: BrandTileProps) {
  return (
    <Link
      href={`/cars?brand=${brand.slug}`}
      className="flex items-center justify-between gap-2 h-11 px-3 rounded-control bg-gray-50 hover:bg-gray-100 transition"
    >
      <span className="truncate text-sm font-medium text-gray-900">{brand.name}</span>
      <span className="shrink-0 text-xs tabular-nums text-gray-500">{formatNumber(count)}</span>
    </Link>
  );
}

type BrandChipProps = { brand: Brand; count: number };

// Полный список: марки без объявлений — приглушённые, чтобы сразу было видно, где есть что смотреть
function BrandChip({ brand, count }: BrandChipProps) {
  return (
    <Link
      href={`/cars?brand=${brand.slug}`}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-sm transition",
        count > 0 ? "bg-gray-50 text-gray-900 hover:bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      )}
    >
      {brand.name}
      {count > 0 && <span className="text-xs tabular-nums text-gray-500">{formatNumber(count)}</span>}
    </Link>
  );
}

export default function BrandList() {
  const t = useTranslations("home.brands");
  const { byBrand } = useListingStats();
  const countOf = (brand: Brand) => byBrand[brand.slug] ?? 0;
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  const search = query.trim().toLowerCase();

  // при поиске — сначала марки, которые начинаются с введённого
  const filtered = useMemo(() => {
    if (!search) return sortedBrands;
    const starts = (b: Brand) => b.name.toLowerCase().startsWith(search);
    return sortedBrands
      .filter((b) => b.name.toLowerCase().includes(search))
      .toSorted((a, b) => Number(starts(b)) - Number(starts(a)));
  }, [search]);

  // марки с объявлениями: самые наполненные, по алфавиту. Пока объявлений нет — популярные
  const inStock = sortedBrands.filter((b) => (byBrand[b.slug] ?? 0) > 0);
  const collapsed = (inStock.length > 0 ? inStock : sortedBrands.filter((b) => b.popular))
    .toSorted((a, b) => (byBrand[b.slug] ?? 0) - (byBrand[a.slug] ?? 0))
    .slice(0, COLLAPSED_LIMIT)
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggle = () => {
    if (expanded) sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setExpanded((prev) => !prev);
  };

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto py-8 sm:py-10 scroll-mt-24">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("all")}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("inStock", { count: inStock.length })} · {t("inCatalog", { count: sortedBrands.length })}
          </p>
        </div>

        <TextField
          size="small"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:w-72"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      <div className="bg-white rounded-card border border-gray-200 p-3 sm:p-5">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">{t("notFound", { query: query.trim() })}</p>
        )}

        {!expanded && !search && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {collapsed.map((brand) => (
              <BrandTile key={brand.slug} brand={brand} count={countOf(brand)} />
            ))}
          </div>
        )}

        {/* Как в словаре: буква слева, марки на неё — в строку; на широком экране — в колонки */}
        {search && filtered.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((brand) => (
              <BrandChip key={brand.slug} brand={brand} count={countOf(brand)} />
            ))}
          </div>
        )}

        {expanded && !search && (
          <div className="sm:columns-2 lg:columns-3 gap-x-10 -my-1.5">
            {groupByLetter(filtered).map(([letter, list]) => (
              <div key={letter} className="flex gap-3 py-1.5 break-inside-avoid">
                <span className="w-6 shrink-0 text-lg font-semibold leading-8 text-gray-900">{letter}</span>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((brand) => (
                    <BrandChip key={brand.slug} brand={brand} count={countOf(brand)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Toggle */}

        {!search && (
          <div className="border-t border-gray-100 mt-4 pt-3 flex justify-center">
            <Button variant="ghost" size="sm" onClick={toggle} aria-expanded={expanded}>
              {expanded ? t("collapse") : t("showAll", { count: sortedBrands.length })}
              <KeyboardArrowDownIcon fontSize="small" className={cn("transition-transform", expanded && "rotate-180")} />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
