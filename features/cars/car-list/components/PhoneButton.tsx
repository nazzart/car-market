"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

import { telHref } from "@/lib/phone";
import { cn } from "@/lib/utils";

// primary — главная кнопка на странице объявления и дилера; outline — в списках и карточках
const variants = {
  primary: "h-12 px-5 bg-primary hover:bg-primary-hover text-white font-semibold",
  outline: "h-10 px-4 border border-gray-200 hover:border-gray-900 text-sm font-medium text-gray-900",
};

type Props = {
  phone: string;
  variant?: keyof typeof variants;
  className?: string;
};

// Номер скрыт до клика — позже здесь будет учёт просмотров телефона
export default function PhoneButton({ phone, variant = "outline", className }: Props) {
  const t = useTranslations("common");
  const [shown, setShown] = useState(false);

  // relative z-10 — кнопка кликабельна поверх растянутой ссылки карточки
  const classes = cn(
    "relative z-10 inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap transition cursor-pointer",
    variants[variant],
    className
  );

  if (shown) {
    return (
      <a href={telHref(phone)} className={classes}>
        <PhoneOutlinedIcon fontSize="small" />
        {phone}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => setShown(true)} className={classes}>
      <PhoneOutlinedIcon fontSize="small" />
      {t("showPhone")}
    </button>
  );
}
