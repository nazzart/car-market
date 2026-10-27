import { useSyncExternalStore } from "react";

// Текущая минута (timestamp). На сервере — null: всё, что зависит от «сейчас»,
// считаем только в браузере, иначе разметка сервера и клиента разойдётся
const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
};
const getMinute = () => Math.floor(Date.now() / 60_000) * 60_000;

export const useNow = () => useSyncExternalStore(subscribe, getMinute, () => null);
