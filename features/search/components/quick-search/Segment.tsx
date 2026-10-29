"use client";

import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";

type SegmentProps = {
  label: string;
  value: string;
  placeholder: string;
  active: boolean;
  disabled?: boolean;
  onOpen: (el: HTMLElement) => void;
  onClear: () => void;
  segmentRef?: React.Ref<HTMLDivElement>;
};

// Часть строки поиска («Марка», «Цена»…): по клику открывает панель выбора, крестик очищает значение
export function Segment({
  label,
  value,
  placeholder,
  active,
  disabled,
  onOpen,
  onClear,
  segmentRef,
}: SegmentProps) {
  const t = useTranslations("search");

  return (
    <div ref={segmentRef} className="relative flex-1 min-w-0">
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => onOpen(e.currentTarget.parentElement!)}
        className={`
          w-full text-left
          px-5 py-2.5
          rounded-card md:rounded-full
          transition
          cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-60
          ${active ? "bg-gray-100" : "hover:bg-gray-50"}
        `}
      >
        <div className="text-xs font-semibold text-gray-900">{label}</div>
        <div className={`text-sm truncate pr-6 ${value ? "text-gray-900" : "text-gray-500"}`}>{value || placeholder}</div>
      </button>

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label={t("clear", { label })}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </button>
      )}
    </div>
  );
}

export function SegmentDivider() {
  return (
    <>
      <div className="hidden md:block w-px h-8 bg-gray-200 shrink-0" />
      <div className="md:hidden h-px bg-gray-100 mx-4" />
    </>
  );
}
