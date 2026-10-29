"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import MyLocationIcon from "@mui/icons-material/MyLocation";

import PlacePicker from "@/components/ui/PlacePicker";

import { areaOptions } from "../../config/filterOptions";
import { nearestCity } from "../../lib/location";
import { useCarFilters } from "../hooks/useCarFilters";
import { Segmented } from "./ui";

// Место: город или край (край — со своими городами), по желанию с окрестностями.
// Километры до машины не показываем: люди ориентируются по названиям мест, а не по расстоянию
export default function LocationFilter() {
  const t = useTranslations("cars.location");
  const { params, updateFilter } = useCarFilters();
  const [state, setState] = useState<"idle" | "locating" | "error">("idle");
  const place = params.get("place") ?? "";

  // GPS → ближайший город; дальше — как будто его выбрали в списке
  const locate = () => {
    if (!navigator.geolocation) return setState("error");
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setState("idle");
        updateFilter("place", nearestCity({ lat: coords.latitude, lng: coords.longitude }));
      },
      () => setState("error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  };

  return (
    <div className="space-y-2">
      <PlacePicker
        variant="compact"
        label={t("place")}
        placeholder={t("choose")}
        value={place}
        onChange={(key) => updateFilter("place", key || null)}
      />

      {place ? (
        <div className="pt-1">
          <div className="text-xs text-gray-500 mb-1.5">{t("area")}</div>
          <Segmented
            anyLabel={t("areaNone")}
            options={areaOptions.map((km) => ({ value: km, label: t("areaKm", { km }) }))}
            value={params.get("area") ?? ""}
            onChange={(value) => updateFilter("area", value)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={locate}
          disabled={state === "locating"}
          className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          <MyLocationIcon sx={{ fontSize: 18 }} className={state === "locating" ? "animate-pulse" : ""} />
          {state === "locating" ? t("locating") : t("useMine")}
        </button>
      )}

      {state === "error" && <p className="text-xs text-error">{t("error")}</p>}
    </div>
  );
}
