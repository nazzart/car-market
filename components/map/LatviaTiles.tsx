"use client";

import { useEffect } from "react";
import type L from "leaflet";
import { useLocale } from "next-intl";
import { namedFlavor } from "@protomaps/basemaps";
import { labelRules, leafletLayer, paintRules } from "protomaps-leaflet";
import { useMap } from "react-leaflet";

// Карта с нашего же сервера — без внешних картографических сервисов. Данные © OpenStreetMap.
// Два файла (npm run map:download): подробная Латвия и упрощённые соседи, чтобы края карты не были пустыми.
// TODO(backend): в продакшене — те же файлы на своём хранилище/CDN, папка через NEXT_PUBLIC_MAP_BASE
const MAP_BASE = process.env.NEXT_PUBLIC_MAP_BASE ?? "/maps";

// Дальше соседних стран карту не отпускаем — там данных нет
export const LATVIA_BOUNDS: L.LatLngBoundsExpression = [
  [55.0, 19.8],
  [58.8, 29.0],
];
export const MIN_ZOOM = 6;
// Ближе 19 смысла нет: данные детализированы до 15, дальше — просто увеличение
export const MAX_ZOOM = 19;

// Слой карты для react-leaflet: <MapContainer><LatviaTiles />…</MapContainer>
export default function LatviaTiles() {
  const map = useMap();
  const locale = useLocale();

  useEffect(() => {
    // правила стиля «light» передаём сами: с flavor библиотека всегда красит фон серым,
    // а слою Латвии фон не нужен — за её пределами должен быть виден слой соседей
    const flavor = namedFlavor("light");
    const style = { paintRules: paintRules(flavor), labelRules: labelRules(flavor, locale) }; // подписи на языке сайта (Rīga → Рига)

    const layers = [
      // соседи (zoom до 10) — под Латвией, с фоном; вблизи не нужны, поэтому только до 12
      leafletLayer({ ...style, backgroundColor: flavor.background, url: `${MAP_BASE}/region.pmtiles`, maxDataZoom: 10, maxZoom: 12, zIndex: 1, attribution: "" }),
      // Латвия целиком до 15-го зума; ближе карта просто увеличивается
      leafletLayer({
        ...style,
        url: `${MAP_BASE}/latvia.pmtiles`,
        maxDataZoom: 15,
        zIndex: 2,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }),
    ] as unknown as L.Layer[];

    layers.forEach((layer) => layer.addTo(map));
    return () => layers.forEach((layer) => map.removeLayer(layer));
  }, [map, locale]);

  return null;
}
