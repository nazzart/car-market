"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/store";
import type { Listing } from "@/features/cars/types";

import { loadOwnListings, setListingStatus } from "./actions";
import type { ListingStatus } from "./listings/status";

// Свои объявления в кабинете (у дилера — его компании), со статусами и решениями модератора.
// Смена статуса видна сразу; если сервер отказал — список перечитывается
export function useOwnListings() {
  const { user } = useAuth();
  const key = user?.id ?? null;
  const [state, setState] = useState<{ key: string; listings: Listing[] }>();

  const reload = (forKey: string) =>
    loadOwnListings()
      .then((listings) => setState({ key: forKey, listings }))
      .catch(() => setState({ key: forKey, listings: [] }));

  useEffect(() => {
    if (key) reload(key);
  }, [key]);

  const setStatus = async (id: string, status: ListingStatus) => {
    if (!key) return;
    setState((prev) => prev && { ...prev, listings: prev.listings.map((l) => (l.id === id ? { ...l, status } : l)) });
    const ok = await setListingStatus(id, status).catch(() => false);
    if (!ok) reload(key);
  };

  return {
    listings: state?.key === key ? state.listings : undefined, // undefined — ещё загружаются
    setStatus,
  };
}
