"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { Link } from "@/i18n/navigation";
import { formatNumber } from "@/lib/utils";

import { useListingStats } from "@/features/cars/hooks";

import { collectionHref, collections } from "../config";

// Выпадающее меню «Подборки» в шапке (десктоп)
export default function CollectionsMenu() {
  const t = useTranslations("nav");
  const { byCollection } = useListingStats();
  const countOf = (collection: { slug: string }) => byCollection[collection.slug] ?? 0;
  const tOptions = useTranslations("options");
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-0.5 hover:text-black cursor-pointer"
      >
        {t("collections")}
        <KeyboardArrowDownIcon
          sx={{ fontSize: 18 }}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* pt-3 — «мостик», чтобы меню не закрывалось при переходе курсора */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 top-full pt-3
          transition duration-150
          ${open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-1"}
        `}
      >
        <div className="w-80 p-2 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-black/10">
          {collections.map((c) => {
            const Icon = c.icon;

            return (
              <Link
                key={c.slug}
                href={collectionHref(c.slug)}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
              >
                <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 group-hover:bg-primary/10 group-hover:text-primary transition">
                  <Icon fontSize="small" />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="block font-medium text-gray-900">
                    {tOptions(`collections.${c.slug}.label`)}
                  </span>
                  <span className="block text-xs text-gray-500 truncate">
                    {tOptions(`collections.${c.slug}.description`)}
                  </span>
                </span>

                <span className="text-xs text-gray-500 tabular-nums">
                  {formatNumber(countOf(c))}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
