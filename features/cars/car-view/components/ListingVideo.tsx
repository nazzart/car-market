"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";

import { youtubeId } from "@/lib/youtube";

// Видео продавца с YouTube. До клика — только превью: страница не тормозит,
// а YouTube ничего не загружает, пока посетитель сам не нажмёт «смотреть»
export default function ListingVideo({ url, title }: { url: string; title: string }) {
  const t = useTranslations("listing.video");
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);

  if (!id) return null;

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-900">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={t("frameTitle", { title })}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={t("play")} className="group absolute inset-0 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element -- превью с img.youtube.com, без настройки next/image */}
          <img
            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
          />
          <span className="absolute inset-0 m-auto w-20 h-14 flex items-center justify-center rounded-2xl bg-primary text-white shadow-xl group-hover:scale-105 transition">
            <PlayArrowRoundedIcon sx={{ fontSize: 44 }} />
          </span>
          <span className="absolute left-4 bottom-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium">
            {t("play")}
          </span>
        </button>
      )}
    </div>
  );
}
