"use client";

import Image from "next/image";
import { Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslations } from "next-intl";

type PhotoLightboxProps = {
  images: string[];
  title: string;
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

const navButtonClass = `
  absolute top-1/2 -translate-y-1/2
  w-12 h-12
  hidden sm:flex items-center justify-center
  rounded-full
  bg-white/10 hover:bg-white/20
  text-white
  backdrop-blur
  transition
  cursor-pointer
`;

// Полноэкранный просмотр фото: стрелки, клавиатура, миниатюры
export default function PhotoLightbox({ images, title, index, onChange, onClose }: PhotoLightboxProps) {
  const t = useTranslations("listing.gallery");
  const tCommon = useTranslations("common");
  const open = index !== null;
  const current = index ?? 0;

  const go = (delta: number) =>
    onChange((current + delta + images.length) % images.length);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      slotProps={{ paper: { sx: { backgroundColor: "#0a0a0a" } } }}
    >
      <div className="h-full flex flex-col text-white">
        {/* Top bar */}

        <div className="flex items-center justify-between px-4 sm:px-6 h-16 shrink-0">
          <span className="text-sm text-white/70 tabular-nums">
            {current + 1} / {images.length}
          </span>

          <span className="hidden sm:block text-sm font-medium truncate px-4">
            {title}
          </span>

          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon("close")}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Photo */}

        <div className="relative flex-1 min-h-0 mx-2 sm:mx-20">
          {open && (
            <Image
              key={images[current]}
              src={images[current]}
              alt={t("alt", { title, n: current + 1 })}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label={t("prev")}
                className={`${navButtonClass} -left-16`}
              >
                <ChevronLeftIcon />
              </button>

              <button
                type="button"
                onClick={() => go(1)}
                aria-label={t("next")}
                className={`${navButtonClass} -right-16`}
              >
                <ChevronRightIcon />
              </button>

              {/* на телефоне — тап по краям */}
              <button
                type="button"
                aria-label={t("prev")}
                onClick={() => go(-1)}
                className="sm:hidden absolute inset-y-0 left-0 w-1/3"
              />
              <button
                type="button"
                aria-label={t("next")}
                onClick={() => go(1)}
                className="sm:hidden absolute inset-y-0 right-0 w-1/3"
              />
            </>
          )}
        </div>

        {/* Thumbnails */}

        {images.length > 1 && (
          <div className="flex justify-center gap-2 px-4 py-4 overflow-x-auto scrollbar-none shrink-0">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => onChange(i)}
                aria-label={t("photo", { n: i + 1 })}
                className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden transition cursor-pointer ${
                  i === current ? "ring-2 ring-white" : "opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
