"use client";

// Главная: большой блок поиска — состояние (выбор, число объявлений) в quick-search/useQuickSearch,
// панели выбора — в quick-search/panels
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Popover } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import { brands } from "@/features/brands/data/brands";
import { collectionHref, collections } from "@/features/collections/config";
import { Link, useRouter } from "@/i18n/navigation";
import { formatNumber } from "@/lib/utils";

import { BrandPanel, ModelPanel, PricePanel, YearPanel } from "./quick-search/panels";
import { Segment, SegmentDivider } from "./quick-search/Segment";
import { useQuickSearch } from "./quick-search/useQuickSearch";

const conditions = ["", "used", "new"];

export default function QuickSearch() {
  const t = useTranslations("search");
  const tOptions = useTranslations("options");
  const router = useRouter();
  const search = useQuickSearch();
  const { filters, set, selectBrand, panel, anchorEl, openPanel, closePanel, modelRef, models, count, total } = search;

  const brandName = brands.find((b) => b.slug === filters.brand)?.name ?? "";

  const priceLabel = (from: string, to: string) => {
    if (from && to) return t("priceRange", { from: formatNumber(+from), to: formatNumber(+to) });
    if (from) return t("priceFrom", { value: formatNumber(+from) });
    if (to) return t("priceTo", { value: formatNumber(+to) });
    return "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(search.href);
  };

  return (
    <section className="pt-6 pb-4">
      <div className="relative rounded-panel overflow-hidden bg-gray-900">
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
            {t("heroTitle")}
          </h1>

          <p className="text-white/75 mt-3 sm:text-lg">
            {t("heroSubtitle", { count: total })}
          </p>

          {/* Condition */}

          <div className="inline-flex mt-8 p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
            {conditions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set({ condition: c })}
                aria-pressed={filters.condition === c}
                className={`
                  px-4 py-1.5
                  rounded-full
                  text-sm font-medium
                  transition
                  cursor-pointer
                  ${
                    filters.condition === c
                      ? "bg-white text-gray-900"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                {c ? tOptions(`condition.${c}`) : t("all")}
              </button>
            ))}
          </div>

          {/* Search bar */}

          <form
            onSubmit={submit}
            className="
              mt-4 max-w-5xl
              flex flex-col md:flex-row md:items-center
              gap-1 md:gap-0
              p-2
              bg-white
              rounded-panel md:rounded-full
              shadow-2xl shadow-black/30
            "
          >
            <Segment
              label={t("brand")}
              value={brandName}
              placeholder={t("anyBrand")}
              active={panel === "brand"}
              onOpen={(el) => openPanel("brand", el)}
              onClear={() => selectBrand("")}
            />

            <SegmentDivider />

            <Segment
              segmentRef={modelRef}
              label={t("model")}
              value={filters.model}
              placeholder={filters.brand ? t("anyModel") : t("brandFirst")}
              active={panel === "model"}
              disabled={!filters.brand || models.length === 0}
              onOpen={(el) => openPanel("model", el)}
              onClear={() => set({ model: "" })}
            />

            <SegmentDivider />

            <Segment
              label={t("price")}
              value={priceLabel(filters.priceFrom, filters.priceTo)}
              placeholder={t("anyPrice")}
              active={panel === "price"}
              onOpen={(el) => openPanel("price", el)}
              onClear={() => set({ priceFrom: "", priceTo: "" })}
            />

            <SegmentDivider />

            <Segment
              label={t("year")}
              value={filters.yearFrom ? t("yearFrom", { year: filters.yearFrom }) : ""}
              placeholder={t("anyYear")}
              active={panel === "year"}
              onOpen={(el) => openPanel("year", el)}
              onClear={() => set({ yearFrom: "" })}
            />

            <button
              type="submit"
              className="
                md:ml-2 shrink-0
                h-12 md:h-14
                px-6
                flex items-center justify-center gap-2
                rounded-card md:rounded-full
                bg-primary hover:bg-primary-hover
                text-white font-semibold
                shadow-lg shadow-primary/30
                transition
                cursor-pointer
              "
            >
              <SearchIcon fontSize="small" />
              {t("show", { count })}
            </button>
          </form>

          {/* Collections */}

          <div className="flex sm:flex-wrap items-center gap-2 mt-5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            <span className="hidden sm:inline text-sm text-white/60 mr-1">{t("collections")}</span>

            {collections.map((c) => {
              const Icon = c.icon;

              return (
                <Link
                  key={c.slug}
                  href={collectionHref(c.slug)}
                  className="
                    shrink-0
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
                  {tOptions(`collections.${c.slug}.label`)}
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
        {panel === "brand" && <BrandPanel search={search} />}
        {panel === "model" && <ModelPanel search={search} brandName={brandName} />}
        {panel === "price" && <PricePanel search={search} />}
        {panel === "year" && <YearPanel search={search} />}
      </Popover>
    </section>
  );
}
