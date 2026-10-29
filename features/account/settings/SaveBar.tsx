"use client";

import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";

// Панель «Есть несохранённые изменения» внизу экрана
export function SaveBar({ visible, onDiscard, onSave }: { visible: boolean; onDiscard: () => void; onSave: () => void }) {
  const t = useTranslations("account.settings.saveBar");

  return (
    <div
      className={`
        fixed bottom-4 inset-x-4 z-40 mx-auto max-w-xl
        flex items-center justify-between gap-3
        pl-5 pr-2 py-2
        rounded-2xl bg-gray-900 text-white shadow-2xl
        transition duration-200
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <span className="text-sm">{t("unsaved")}</span>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={onDiscard}
          className="h-10 px-4 rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t("discard")}
        </button>
        <Button variant="white" onClick={onSave} className="h-10">
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
