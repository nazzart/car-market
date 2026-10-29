"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import { Dealer } from "@/features/dealers/types";

// Leaflet работает только в браузере
const DealersMap = dynamic(() => import("./DealersMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

const noop = () => {};

// Небольшая карта с одним дилером для его страницы
export default function DealerMiniMap({ dealer }: { dealer: Dealer }) {
  return (
    <div className="relative isolate h-56 rounded-card overflow-hidden border border-gray-200">
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
