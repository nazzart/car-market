"use client";

import { useEffect, useRef, useState } from "react";

// Значение, которое меняется не чаще, чем раз в ms: пока пользователь печатает — прежнее,
// через ms после последнего изменения — новое (поиск по тексту, пересчёт числа объявлений)
export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  const key = JSON.stringify(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(JSON.parse(key)), ms);
    return () => clearTimeout(timer);
  }, [key, ms]);

  return debounced;
}

// Функция, которая выполняется через ms после последнего вызова (движение карты, подсказки адреса).
// cancel — отменить ожидающий вызов; при уходе со страницы отменяется сама
export function useDebouncedCallback<Args extends unknown[]>(callback: (...args: Args) => void, ms: number) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // последняя версия callback — таймер вызывает её, а не ту, что была при первом вызове
  const latest = useRef(callback);
  useEffect(() => {
    latest.current = callback;
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  const call = (...args: Args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => latest.current(...args), ms);
  };
  const cancel = () => clearTimeout(timer.current);

  return { call, cancel };
}
