"use client";

import { useEffect, useEffectEvent, useState } from "react";

// Загрузка с сервера (Server Action) после открытия страницы. Ответы с тем же key на ttl мс общие для всех
// компонентов — соседние страницы не запрашивают одно и то же дважды; ttl: 0 — каждый раз заново.
// undefined — ещё загружается. keepPrevious: при смене key показывать прежний результат, пока не придёт новый
// (без мигания); false — undefined, пока не загрузится результат для нового key. key null — ничего не грузить
const cache = new Map<string, { at: number; promise: Promise<unknown> }>();

export function useServerData<T>(
  key: string | null,
  load: () => Promise<T>,
  { ttl = 60_000, keepPrevious = true }: { ttl?: number; keepPrevious?: boolean } = {}
): T | undefined {
  const [state, setState] = useState<{ key: string; value: T }>();
  const start = useEffectEvent(load);

  useEffect(() => {
    if (key === null) return;
    let entry = cache.get(key);
    if (!entry || Date.now() - entry.at >= ttl) {
      entry = { at: Date.now(), promise: start() };
      cache.set(key, entry);
      entry.promise.catch(() => cache.delete(key));
    }
    let alive = true;
    (entry.promise as Promise<T>).then(
      (value) => alive && setState({ key, value }),
      () => {}
    );
    return () => {
      alive = false;
    };
  }, [key, ttl]);

  if (!state || (!keepPrevious && state.key !== key)) return undefined;
  return state.value;
}
