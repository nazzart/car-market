"use client";

import { useEffect } from "react";

import { recordListingView } from "@/features/cars/actions";

type ViewTrackerProps = { listingId: string };

// Засчитать просмотр, когда страница объявления открылась в браузере (не при предзагрузке ссылки)
export default function ViewTracker({ listingId }: ViewTrackerProps) {
  useEffect(() => {
    recordListingView(listingId);
  }, [listingId]);
  return null;
}
