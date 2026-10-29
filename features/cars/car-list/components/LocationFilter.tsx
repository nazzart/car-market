"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CloseIcon from "@mui/icons-material/Close";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";

import PlacePicker from "@/components/ui/PlacePicker";
import { placePoint, usePlaceName } from "@/lib/places";

import { radiusOptions } from "../../config/filterOptions";
import { Origin, clearOrigin, nearestCity, setOrigin, useOrigin } from "../../lib/location";
import { useCarFilters } from "../hooks/useCarFilters";
import { Segmented } from "./ui";

// «Рядом со мной»: точка посетителя (GPS или город) + радиус. Точка — только в браузере
export default function LocationFilter() {
  const t = useTranslations("cars.location");
  const placeName = usePlaceName();
  const origin = useOrigin();
  const { params, updateFilter } = useCarFilters();
  const [state, setState] = useState<"idle" | "locating" | "error">("idle");

  // выбрали точку — сразу показываем ближайшие, если посетитель не выбрал другую сортировку
  const apply = (next: Origin) => {
    setOrigin(next);
    setState("idle");
    if (!params.get("sort")) updateFilter("sort", "distance");
  };

  const locate = () => {
    if (!navigator.geolocation) return setState("error");
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const point = { lat: coords.latitude, lng: coords.longitude };
        apply({ ...point, source: "gps", city: nearestCity(point) });
      },
      () => setState("error"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 }
    );
  };

  const pickCity = (city: string) => {
    const point = placePoint(city);
    if (point) apply({ ...point, source: "city", city });
  };

  const reset = () => {
    clearOrigin();
    if (params.get("sort") === "distance") updateFilter("sort", null);
    if (params.get("radius")) updateFilter("radius", null);
  };

  if (!origin) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={locate}
          disabled={state === "locating"}
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 hover:border-gray-900 text-sm font-medium text-gray-900 transition cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          <MyLocationIcon sx={{ fontSize: 18 }} className={state === "locating" ? "animate-pulse" : ""} />
          {state === "locating" ? t("locating") : t("useMine")}
        </button>

        {state === "error" && <p className="text-xs text-error">{t("error")}</p>}

        <PlacePicker variant="compact" label={t("orCity")} placeholder={t("orCity")} value="" onChange={pickCity} />
      </div>
    );
  }

  const where = origin.city ? placeName(origin.city) : "";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50">
        <NearMeOutlinedIcon sx={{ fontSize: 20 }} className="text-primary shrink-0" />
        <div className="flex-1 min-w-0 text-sm leading-tight">
          <div className="font-medium text-gray-900 truncate">
            {origin.source === "gps" ? t("myLocation") : where}
          </div>
          {origin.source === "gps" && where && <div className="text-xs text-gray-500">{t("near", { city: where })}</div>}
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label={t("change")}
          title={t("change")}
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-200 transition cursor-pointer"
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-1.5">{t("radius")}</div>
        <Segmented
          anyLabel={t("anywhere")}
          options={radiusOptions.map((value) => ({ value, label: value }))}
          value={params.get("radius") ?? ""}
          onChange={(value) => updateFilter("radius", value)}
        />
      </div>
    </div>
  );
}
