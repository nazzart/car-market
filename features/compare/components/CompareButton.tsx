"use client";

import { useTranslations } from "next-intl";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

import { photoButtonClass } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { toggleCompare, useCompare } from "../store";

type CompareButtonProps = {
  id: string;
  variant?: "icon" | "soft" | "text";
  // icon: на компьютере появляется при наведении на карточку (если ещё не добавлено)
  revealOnHover?: boolean;
  className?: string;
};

// «Сравнить»: круглая кнопка на фото карточки или текстовая — в шапке объявления
export default function CompareButton({ id, variant = "icon", revealOnHover, className }: CompareButtonProps) {
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

  const label = active ? t("remove") : t("add");

  // soft — на белой карточке
  if (variant === "soft") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        title={label}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-full transition cursor-pointer",
          active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          className
        )}
      >
        <CompareArrowsIcon fontSize="small" />
      </button>
    );
  }

  // icon — поверх фото
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={photoButtonClass(
        active,
        cn(
          revealOnHover && !active &&
            "[@media(hover:hover)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          className
        )
      )}
    >
      <CompareArrowsIcon sx={{ fontSize: 18 }} />
    </button>
  );
}
