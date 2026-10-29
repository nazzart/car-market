"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useTranslations } from "next-intl";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";

import { Link } from "@/i18n/navigation";
import { usePlaceName } from "@/lib/places";
import { initials } from "@/lib/utils";

import type { DealerPin } from "@/features/dealers/types";
import OpenStatus from "./OpenStatus";

export type MapBounds = { north: number; south: number; east: number; west: number };

type Props = {
  dealers: DealerPin[]; // все подходящие под фильтры, а не только текущая страница списка
  activeSlug: string | null;
  hoveredSlug: string | null;
  fitKey: string; // меняется при смене фильтров → карта подстраивается под результаты
  onSelect: (slug: string) => void;
  onBoundsChange: (bounds: MapBounds) => void;
};

const LATVIA_CENTER: [number, number] = [56.88, 24.6];


// Метка — HTML-иконка, чтобы стилизовать её Tailwind-классами
const markerIcon = (dealer: DealerPin, highlighted: boolean) =>
  L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
    html: `<div class="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg transition-transform duration-150 ${
      highlighted ? "bg-primary scale-125" : "bg-gray-900"
    }">${initials(dealer.name)}</div>`,
  });

// Кластер — тот же стиль, что и метки, с числом дилеров внутри
const clusterIcon = (cluster: L.MarkerCluster) =>
  L.divIcon({
    className: "",
    iconSize: [48, 48],
    html: `<div class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-900/90 text-white text-sm font-bold border-4 border-white/70 shadow-lg">${cluster.getChildCount()}</div>`,
  });

function FitToDealers({ dealers, fitKey }: { dealers: DealerPin[]; fitKey: string }) {
  const map = useMap();
  const dealersRef = useRef(dealers);

  useEffect(() => {
    dealersRef.current = dealers;
  });

  const fit = () => {
    const list = dealersRef.current;
    if (list.length === 0) return;

    map.fitBounds(
      list.map((d) => [d.lat, d.lng] as [number, number]),
      { padding: [48, 48], maxZoom: 13 }
    );
  };

  useEffect(() => {
    fit();
    // подстраиваемся только при смене фильтров, не при каждом рендере
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, map]);

  // На телефоне карта сначала скрыта (display: none) — когда она появляется,
  // Leaflet нужно пересчитать размер и заново показать дилеров
  useEffect(() => {
    const container = map.getContainer();
    let wasHidden = container.clientWidth === 0;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();

      const hidden = container.clientWidth === 0;
      if (wasHidden && !hidden) fit();
      wasHidden = hidden;
    });

    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function FlyToActive({ dealer }: { dealer?: DealerPin }) {
  const map = useMap();

  useEffect(() => {
    if (!dealer) return;
    map.flyTo([dealer.lat, dealer.lng], Math.max(map.getZoom(), 13), { duration: 0.6 });
  }, [dealer, map]);

  return null;
}

function BoundsWatcher({ onChange }: { onChange: Props["onBoundsChange"] }) {
  const map = useMapEvents({
    moveend: () => report(),
  });

  const report = () => {
    const b = map.getBounds();
    onChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
  };

  return null;
}

export default function DealersMap({
  dealers,
  activeSlug,
  hoveredSlug,
  fitKey,
  onSelect,
  onBoundsChange,
}: Props) {
  const t = useTranslations("dealers");
  const placeName = usePlaceName();
  const active = dealers.find((d) => d.slug === activeSlug);

  return (
    <MapContainer
      center={LATVIA_CENTER}
      zoom={7}
      scrollWheelZoom
      className="w-full h-full"
    >
      {/* Тайлы OpenStreetMap подходят для разработки; для продакшена нужен свой
          провайдер (MapTiler, Stadia и т.п.) — см. tile usage policy OSM */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitToDealers dealers={dealers} fitKey={fitKey} />
      <FlyToActive dealer={active} />
      <BoundsWatcher onChange={onBoundsChange} />

      <MarkerClusterGroup
        iconCreateFunction={clusterIcon}
        showCoverageOnHover={false}
        maxClusterRadius={48}
        disableClusteringAtZoom={13}
        chunkedLoading
      >
        {dealers.map((dealer) => (
          <Marker
            key={dealer.slug}
            position={[dealer.lat, dealer.lng]}
            icon={markerIcon(dealer, dealer.slug === activeSlug || dealer.slug === hoveredSlug)}
            zIndexOffset={dealer.slug === activeSlug ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(dealer.slug) }}
          >
            <Popup>
              <div className="min-w-48">
                <div className="font-semibold text-gray-900 text-sm">{dealer.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {dealer.address}, {placeName(dealer.city)}
                </div>
                <OpenStatus hours={dealer.hours} className="mt-1.5 text-xs" />
                <div className="flex gap-3 mt-2">
                  <Link
                    href={`/dealers/${dealer.slug}`}
                    className="text-xs font-semibold !text-gray-900 underline underline-offset-2"
                  >
                    {t("popup.about")}
                  </Link>
                  <Link
                    href={`/cars?dealer=${dealer.slug}`}
                    className="text-xs font-semibold !text-gray-900 underline underline-offset-2"
                  >
                    {t("popup.cars", { count: dealer.carsInStock })}
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
