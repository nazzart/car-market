"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import AddressField from "./AddressField";
import type { DealerSettingsForm } from "../types";
import { type AddressResult, reverseGeocode } from "./geocoding";
import SettingsCard from "./SettingsCard";

// Leaflet работает только в браузере
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

// Адрес хранится на латышском: кириллица — признак, что его ввели по-русски
export const hasCyrillic = (value: string) => /[Ѐ-ӿ]/.test(value);

type AddressCardProps = { settings: DealerSettingsForm };

// Адрес дилера и метка на карте: выбор подсказки переносит метку, перенос метки предлагает адрес этой точки
export default function AddressCard({ settings }: AddressCardProps) {
  const t = useTranslations("account.settings.address");
  const { form, set, show } = settings;

  const [mapFocus, setMapFocus] = useState(0);
  const [pinAddress, setPinAddress] = useState<AddressResult | null>(null);
  const reverseRequest = useRef<AbortController>(undefined);

  const applyAddress = (result: AddressResult) => {
    set("address")(result.label);
    setPinAddress(null);
  };

  // выбрали подсказку — подставляем адрес, город и переносим метку
  const selectAddress = (result: AddressResult) => {
    reverseRequest.current?.abort();
    applyAddress(result);
    set("lat")(result.lat);
    set("lng")(result.lng);
    setMapFocus((n) => n + 1);
  };

  // передвинули метку — ищем адрес этой точки; пустое поле заполняем сразу, иначе предлагаем
  const movePin = async (lat: number, lng: number) => {
    set("lat")(lat);
    set("lng")(lng);

    reverseRequest.current?.abort();
    const controller = new AbortController();
    reverseRequest.current = controller;

    try {
      const result = await reverseGeocode(lat, lng, controller.signal);
      if (controller.signal.aborted) return;
      if (result && !form.address.trim()) applyAddress(result);
      else setPinAddress(result);
    } catch {
      if (!controller.signal.aborted) setPinAddress(null);
    }
  };

  const cyrillic = hasCyrillic(form.address);

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <AddressField
        label={t("street")}
        placeholder={t("streetPlaceholder")}
        value={form.address}
        onChange={set("address")}
        onSelect={selectAddress}
        near={{ lat: form.lat, lng: form.lng }}
        error={show("address") || cyrillic}
        helperText={
          cyrillic
            ? t("streetError")
            : show("address")
              ? form.address.trim()
                ? t("format")
                : t("required")
              : t("searchHint")
        }
      />

      <div className="relative isolate h-72 mt-4 rounded-card overflow-hidden border border-gray-200">
        <LocationPicker lat={form.lat} lng={form.lng} onChange={movePin} focus={mapFocus} />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {t("mapHint")} · {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
      </p>

      {/* Адрес по точке на карте — предлагаем, но не перезаписываем введённый вручную */}
      {pinAddress && pinAddress.label !== form.address && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card bg-gray-50 px-4 py-3 text-sm">
          <PlaceOutlinedIcon className="text-gray-400" sx={{ fontSize: 20 }} />
          <span className="text-gray-500">{t("pinAddress")}</span>
          <span className="font-medium text-gray-900">{pinAddress.label}</span>
          <Button variant="outline" size="sm" onClick={() => applyAddress(pinAddress)} className="sm:ml-auto">
            {t("useAddress")}
          </Button>
        </div>
      )}
    </SettingsCard>
  );
}
