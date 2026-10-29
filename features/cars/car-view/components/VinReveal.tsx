"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// «WBS4Y9107JAC81248» → «WBS4Y910•••••••48»
const mask = (vin: string) => vin.slice(0, 8) + "•".repeat(Math.max(vin.length - 10, 0)) + vin.slice(-2);

type VinRevealProps = { vin: string };

// VIN скрыт до клика, как телефон: меньше достаётся ботам, а позже можно считать просмотры.
// После показа — полный VIN и кнопка «Копировать» (для проверки в CSDD)
export default function VinReveal({ vin }: VinRevealProps) {
  const t = useTranslations("listing.vin");
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(vin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // буфер обмена недоступен — VIN всё равно виден и выделяется целиком
    }
  };

  const buttonClass =
    "inline-flex items-center gap-1 h-8 px-2.5 rounded-full text-xs font-sans font-medium tracking-normal transition cursor-pointer";

  if (!shown) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-gray-500">{mask(vin)}</span>
        <button type="button" onClick={() => setShown(true)} className={`${buttonClass} bg-gray-100 hover:bg-gray-200 text-gray-900`}>
          <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
          {t("show")}
        </button>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="select-all">{vin}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={t("copy")}
        className={`${buttonClass} ${copied ? "bg-success-soft text-success" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
      >
        {copied ? <CheckIcon sx={{ fontSize: 15 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 15 }} />}
        {copied ? t("copied") : t("copy")}
      </button>
    </span>
  );
}
