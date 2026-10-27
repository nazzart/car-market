"use client";

import { useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { InputAdornment, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { Link } from "@/i18n/navigation";

import { Brand, brands } from "../data/brands";

const sortedBrands = [...brands].sort((a, b) => a.name.localeCompare(b.name));
const popularBrands = sortedBrands.filter((b) => b.popular);

const groupByLetter =(list: Brand[]) => {
  const groups: Record<string, Brand[]> = {};

  for (const brand of list) {
    const letter = brand.name[0].toUpperCase();
    (groups[letter] ??= []).push(brand);
  }

  return Object.entries(groups);
};

function BrandLink({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/cars/${brand.slug}`}
      className="
        group
        flex items-baseline justify-between gap-3
        px-3 py-1.5
        rounded-lg
        hover:bg-gray-50
        transition
      "
    >
      <span className="text-gray-800 group-hover:text-black truncate">
        {brand.name}
      </span>

      <span className="text-xs text-gray-500 tabular-nums">
        {brand.count.toLocaleString("ru-RU")}
      </span>
    </Link>
  );
}

export default function BrandList() {
  const t = useTranslations("home.brands");
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const sectionRef = useRef<HTMLElement>(null);

  const search = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      search
        ? sortedBrands.filter((b) => b.name.toLowerCase().includes(search))
        : sortedBrands,
    [search]
  );

  const showAll = expanded || Boolean(search);

  const toggle = () => {
    if (expanded) {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setExpanded((prev) => !prev);
  };

  return (
    <section ref={sectionRef} className="max-w-7xl mx-auto py-8 scroll-mt-24">
      {/* Header */}

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t("all")}</h2>

          <p className="text-sm text-gray-500 mt-1">
            {t("inCatalog", { count: sortedBrands.length })}
          </p>
        </div>

        <TextField
          size="small"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:w-64"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </div>

      {/* List */}

      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            {t("notFound", { query: query.trim() })}
          </p>
        )}

        {!showAll && (
          <div className="columns-2 md:columns-3 lg:columns-5 gap-x-4">
            {popularBrands.map((brand) => (
              <div key={brand.slug} className="break-inside-avoid">
                <BrandLink brand={brand} />
              </div>
            ))}
          </div>
        )}

        {showAll && filtered.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-5 gap-x-4">
            {groupByLetter(filtered).map(([letter, list]) => (
              <div key={letter} className="break-inside-avoid mb-4">
                <div className="px-3 pb-1 text-sm font-semibold text-gray-500">
                  {letter}
                </div>

                {list.map((brand) => (
                  <BrandLink key={brand.slug} brand={brand} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Toggle */}

        {!search && (
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-center">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={expanded}
              className="
                inline-flex items-center gap-1
                px-4 py-2
                rounded-lg
                text-sm font-medium text-gray-700
                hover:bg-gray-50 hover:text-black
                transition
                cursor-pointer
              "
            >
              {expanded
                ? t("collapse")
                : t("showAll", { count: sortedBrands.length })}

              <KeyboardArrowDownIcon
                fontSize="small"
                className={`transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
