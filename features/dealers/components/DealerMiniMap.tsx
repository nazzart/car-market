"use client";

import dynamic from "next/dynamic";

import { Dealer } from "../data/dealers";

// Leaflet работает только в браузере
const DealersMap = dynamic(() => import("./DealersMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
});

const noop = () => {};

// Небольшая карта с одним дилером для его страницы
export default function DealerMiniMap({ dealer }: { dealer: Dealer }) {
  return (
    <div className="relative isolate h-56 rounded-2xl overflow-hidden border border-gray-200">
      <DealersMap
        dealers={[dealer]}
        activeSlug={dealer.slug}
        hoveredSlug={null}
        fitKey={dealer.slug}
        onSelect={noop}
        onBoundsChange={noop}
      />
    </div>
  );
}
