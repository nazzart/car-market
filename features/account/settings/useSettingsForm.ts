"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useToast } from "@/components/ui/Toast";

// Состояние формы настроек: значения, ошибки (показываются после первой попытки сохранить),
// «есть несохранённые изменения» и сохранение с уведомлением (useToast)
export function useSettingsForm<T, E extends string>(initialValues: T, validate: (form: T) => Record<E, boolean>) {
  const [saved, setSaved] = useState(initialValues);
  const [form, setForm] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const t = useTranslations("account.settings.saveBar");
  const toast = useToast();
  const failed = () => toast({ message: t("fixErrors"), tone: "error" });

  const errors = validate(form);

  const set =
    <K extends keyof T>(key: K) =>
    (value: T[K]) =>
      setForm((prev) => ({ ...prev, [key]: value }));

  // send — запрос на сервер: true при успехе, текст — своя причина ошибки; after — что поменять в форме после сохранения
  const save = async (send: () => Promise<boolean | string>, after?: Partial<T>) => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return failed();
    const result = await send().catch(() => false);
    if (typeof result === "string") return toast({ message: result, tone: "error" });
    if (!result) return failed();

    const next = { ...form, ...after };
    setForm(next);
    setSaved(next);
    setSubmitted(false);
    toast({ message: t("saved"), tone: "success" });
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
  };
}

export type SettingsForm<T, E extends string> = ReturnType<typeof useSettingsForm<T, E>>;
