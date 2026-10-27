"use client";

import { useTranslations } from "next-intl";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import { cn } from "@/lib/utils";

import { toggleCompare, useCompare } from "../store";

type Props = {
  id: string;
  variant?: "icon" | "text";
  className?: string;
};

// «Сравнить»: круглая кнопка на фото карточки или текстовая — в шапке объявления
export default function CompareButton({ id, variant = "icon", className }: Props) {
  const t = useTranslations("compare");
  const active = useCompare().includes(id);

  const onClick = (e: React.MouseEvent) => {
    // кнопка может лежать поверх ссылки на объявление
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(id);
  };

  if (variant === "text") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(
          "inline-flex items-center gap-2 h-10 px-4 rounded-full text-sm font-medium transition cursor-pointer",
          active ? "bg-gray-900 text-white hover:bg-black" : "text-gray-900 hover:bg-gray-100",
          className
        )}
      >
        <CompareArrowsIcon fontSize="small" />
        {active ? t("inCompare") : t("add")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? t("remove") : t("add")}
      title={active ? t("remove") : t("add")}
      className={cn(
        "w-10 h-10 flex items-center justify-center rounded-full shadow-sm backdrop-blur hover:scale-105 transition cursor-pointer",
        active ? "bg-gray-900 text-white" : "bg-white/90 text-gray-700 hover:bg-white",
        className
      )}
    >
      <CompareArrowsIcon fontSize="small" />
    </button>
  );
}
