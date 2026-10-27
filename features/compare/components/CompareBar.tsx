"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import { useTranslations } from "next-intl";

import { listings } from "@/features/cars/data/listings";
import { Link, usePathname } from "@/i18n/navigation";

import { MAX_COMPARE, clearCompare, onCompareFull, removeFromCompare, useCompare } from "../store";

// Плавающая панель сравнения — только там, где есть объявления
const SHOW_ON = ["/cars", "/listing", "/favorites"];

export default function CompareBar() {
  const t = useTranslations("compare");
  const pathname = usePathname();
  const ids = useCompare();
  const [fullToast, setFullToast] = useState(false);

  useEffect(() => onCompareFull(() => setFullToast(true)), []);

  const cars = ids.map((id) => listings.find((l) => l.id === id)).filter((l) => l !== undefined);
  const visible = cars.length > 0 && (pathname === "/" || SHOW_ON.some((p) => pathname.startsWith(p)));

  return (
    <>
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[1200] w-[calc(100%-2rem)] max-w-xl transition duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 p-2 pl-3 rounded-2xl bg-gray-900 text-white shadow-2xl shadow-black/30">
          {/* Миниатюры и пустые места */}
          <div className="hidden sm:flex items-center gap-1.5">
            {Array.from({ length: MAX_COMPARE }, (_, i) => {
              const car = cars[i];
              if (!car) return <span key={`empty-${i}`} className="w-12 h-9 rounded-lg border border-dashed border-white/25" />;

              return (
                <span key={car.id} className="group relative w-12 h-9 rounded-lg overflow-hidden bg-white/10" title={car.title}>
                  {car.images[0] ? (
                    <Image src={car.images[0]} alt={car.title} fill sizes="48px" className="object-cover" />
                  ) : (
                    <DirectionsCarOutlinedIcon sx={{ fontSize: 18 }} className="absolute inset-0 m-auto text-white/50" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFromCompare(car.id)}
                    aria-label={t("remove")}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                  >
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </button>
                </span>
              );
            })}
          </div>

          <div className="flex-1 min-w-0 text-sm">
            <div className="font-semibold flex items-center gap-1.5">
              <CompareArrowsIcon sx={{ fontSize: 18 }} className="sm:hidden" />
              {t("bar.title", { count: cars.length, max: MAX_COMPARE })}
            </div>
            {cars.length < 2 && <div className="text-xs text-white/60 truncate">{t("bar.addMore")}</div>}
          </div>

          <button
            type="button"
            onClick={clearCompare}
            aria-label={t("clear")}
            title={t("clear")}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>

          <Link
            href="/compare"
            className="shrink-0 h-10 px-5 inline-flex items-center rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition"
          >
            {t("bar.open")}
          </Link>
        </div>
      </div>

      <Snackbar
        open={fullToast}
        autoHideDuration={4000}
        onClose={() => setFullToast(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        message={t("full", { max: MAX_COMPARE })}
        action={
          <Link href="/compare" onClick={() => setFullToast(false)} className="px-2 text-sm font-semibold text-white underline underline-offset-4">
            {t("bar.open")}
          </Link>
        }
      />
    </>
  );
}
