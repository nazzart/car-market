"use client";

import { useState } from "react";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";

const buttonClass = `
  inline-flex items-center justify-center gap-2
  h-12 px-5
  rounded-full
  bg-primary hover:bg-primary-hover
  text-white font-semibold
  whitespace-nowrap
  transition
  cursor-pointer
`;

// Номер скрыт до клика — позже здесь будет учёт просмотров телефона
export default function ContactPhoneButton({
  phone,
  className,
}: {
  phone: string;
  className?: string;
}) {
  const [shown, setShown] = useState(false);

  if (shown) {
    return (
      <a href={`tel:${phone.replace(/\s/g, "")}`} className={`${buttonClass} ${className ?? ""}`}>
        <PhoneOutlinedIcon fontSize="small" />
        {phone}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShown(true)}
      className={`${buttonClass} ${className ?? ""}`}
    >
      <PhoneOutlinedIcon fontSize="small" />
      Показать телефон
    </button>
  );
}
