"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const buttonClass = `
  relative z-10
  inline-flex items-center justify-center gap-2
  h-10 px-4
  rounded-full
  border border-gray-200
  text-sm font-medium text-gray-900
  whitespace-nowrap
  hover:border-gray-900
  transition
  cursor-pointer
`;

// Номер скрыт до клика — позже здесь будет учёт просмотров телефона
export default function PhoneButton({ phone }: { phone: string }) {
  const t = useTranslations("common");
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <a href={`tel:${phone.replace(/\s/g, "")}`} className={buttonClass}>
        <PhoneOutlinedIcon fontSize="small" />
        {phone}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => setShown(true)} className={buttonClass}>
      <PhoneOutlinedIcon fontSize="small" />
      {t("showPhone")}
    </button>
  );
}
