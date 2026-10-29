"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import LatviaTiles, { LATVIA_BOUNDS, MAX_ZOOM, MIN_ZOOM } from "@/components/map/LatviaTiles";

type Props = {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  // меняется, когда адрес выбран из подсказок — карта перелетает к метке
  focus?: number;
};

const pin = L.divIcon({
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  html: `<div class="w-8 h-8 rounded-full rounded-br-none rotate-45 bg-primary border-[3px] border-white shadow-lg"></div>`,
});

const round = (n: number) => Math.round(n * 1e5) / 1e5;

function ClickToMove({ onChange }: Pick<Props, "onChange">) {
  useMapEvents({
    click: (e) => onChange(round(e.latlng.lat), round(e.latlng.lng)),
  });
  return null;
}

// Карта следует за меткой, если координаты поменялись снаружи (например, «Отменить»)
function FollowMarker({ lat, lng }: Pick<Props, "lat" | "lng">) {
  const map = useMap();

  useEffect(() => {
    if (!map.getBounds().contains([lat, lng])) map.panTo([lat, lng]);
  }, [lat, lng, map]);

  return null;
}

function FlyToMarker({ lat, lng, focus }: Pick<Props, "lat" | "lng" | "focus">) {
  const map = useMap();
  const lastFocus = useRef(focus);

  useEffect(() => {
    if (focus === lastFocus.current) return;
    lastFocus.current = focus;
    map.flyTo([lat, lng], 17, { duration: 0.8 });
  }, [focus, lat, lng, map]);

  return null;
}

// Точка дилера на карте: перетаскивание метки или клик по карте
export default function LocationPicker({ lat, lng, onChange, focus }: Props) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      maxBounds={LATVIA_BOUNDS}
      maxBoundsViscosity={1}
      scrollWheelZoom={false}
      className="w-full h-full"
    >
      <LatviaTiles />

      <Marker
        position={[lat, lng]}
        icon={pin}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const p = (e.target as L.Marker).getLatLng();
            onChange(round(p.lat), round(p.lng));
          },
        }}
      />

      <ClickToMove onChange={onChange} />
      <FollowMarker lat={lat} lng={lng} />
      <FlyToMarker lat={lat} lng={lng} focus={focus} />
    </MapContainer>
  );
}
