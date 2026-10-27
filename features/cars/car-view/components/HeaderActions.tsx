"use client";

import { useState } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import IosShareIcon from "@mui/icons-material/IosShare";
import CheckIcon from "@mui/icons-material/Check";

const buttonClass = `
  inline-flex items-center gap-2
  h-10 px-4
  rounded-full
  text-sm font-medium text-gray-900
  hover:bg-gray-100
  transition
  cursor-pointer
`;

// «Сохранить» и «Поделиться» в шапке объявления
export default function HeaderActions({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // пользователь закрыл окно «Поделиться»
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center -mx-4 sm:mx-0">
      <button type="button" onClick={share} className={buttonClass}>
        {copied ? (
          <CheckIcon fontSize="small" className="text-emerald-600" />
        ) : (
          <IosShareIcon fontSize="small" />
        )}
        {copied ? "Ссылка скопирована" : "Поделиться"}
      </button>

      <button
        type="button"
        onClick={() => setSaved((prev) => !prev)}
        aria-pressed={saved}
        className={buttonClass}
      >
        {saved ? (
          <FavoriteIcon fontSize="small" className="text-primary" />
        ) : (
          <FavoriteBorderIcon fontSize="small" />
        )}
        {saved ? "Сохранено" : "Сохранить"}
      </button>
    </div>
  );
}
