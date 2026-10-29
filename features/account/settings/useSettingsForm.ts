"use client";

import { useState } from "react";

export type SaveToast = "saved" | "error" | null;

// Состояние формы настроек: значения, ошибки (показываются после первой попытки сохранить),
// «есть несохранённые изменения» и сохранение с уведомлением
export function useSettingsForm<T, E extends string>(initialValues: T, validate: (form: T) => Record<E, boolean>) {
  const [saved, setSaved] = useState(initialValues);
  const [form, setForm] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<SaveToast>(null);

  const errors = validate(form);

  const set =
    <K extends keyof T>(key: K) =>
    (value: T[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  // send — запрос на сервер, true при успехе; after — что поменять в форме после сохранения
  const save = async (send: () => Promise<boolean>, after?: Partial<T>) => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return setToast("error");
    if (!(await send().catch(() => false))) return setToast("error");

    const next = { ...form, ...after };
    setForm(next);
    setSaved(next);
    setSubmitted(false);
    setToast("saved");
  };

  return {
    form,
    set,
    errors,
    show: (key: E) => submitted && errors[key],
    dirty: JSON.stringify(form) !== JSON.stringify(saved),
    discard: () => {
      setForm(saved);
      setSubmitted(false);
    },
    save,
    toast,
    closeToast: () => setToast(null),
  };
}

export type SettingsForm<T, E extends string> = ReturnType<typeof useSettingsForm<T, E>>;
