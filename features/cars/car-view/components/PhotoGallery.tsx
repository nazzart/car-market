"use client";

import { useState } from "react";
import Image from "next/image";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { useTranslations } from "next-intl";

import { NoPhoto } from "@/components/ui/CarPhoto";

import PhotoLightbox from "./PhotoLightbox";

type PhotoGalleryProps = {
  images: string[];
  title: string;
};

// Десктоп: мозаика (1 большое + до 4 маленьких). Телефон: свайп-карусель
export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const t = useTranslations("listing.gallery");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative h-64 md:h-[420px] rounded-card bg-gray-100">
        <NoPhoto iconSize={64} label={t("noPhotos")} />
      </div>
    );
  }

  // Мозаика выглядит ровно только с 4 или 2 маленькими фото
  const small = images.length >= 5 ? images.slice(1, 5) : images.slice(1, 3);

  const tile = (src: string, i: number, className: string, sizes: string) => (
    <button
      key={src}
      type="button"
      onClick={() => setLightboxIndex(i)}
      aria-label={t("open", { n: i + 1 })}
      className={`relative overflow-hidden bg-gray-100 cursor-zoom-in group ${className}`}
    >
      <Image
        src={src}
        alt={t("alt", { title, n: i + 1 })}
        fill
        sizes={sizes}
        priority={i === 0}
        className="object-cover transition duration-300 group-hover:scale-[1.02] group-hover:brightness-95"
      />
    </button>
  );

  return (
    <>
      {/* Desktop: одно фото — целиком, по центру, на размытом фоне из него же,
          а не растянутое на всю ширину с обрезкой */}

      {images.length === 1 && (
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          aria-label={t("open", { n: 1 })}
          className="hidden md:block relative w-full h-[420px] lg:h-[480px] rounded-card overflow-hidden bg-gray-900 cursor-zoom-in group"
        >
          <Image
            src={images[0]}
            alt=""
            fill
            sizes="100vw"
            className="object-cover scale-110 blur-2xl opacity-60"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative h-full aspect-[4/3] mx-auto">
            <Image
              src={images[0]}
              alt={t("alt", { title, n: 1 })}
              fill
              priority
              sizes="(min-width: 1024px) 640px, 560px"
              className="object-cover shadow-2xl transition duration-300 group-hover:brightness-95"
            />
          </div>
        </button>
      )}

      {/* Desktop mosaic */}

      <div
        className={`${images.length === 1 ? "hidden" : "hidden md:grid"} relative grid-cols-4 grid-rows-2 gap-2 rounded-card overflow-hidden h-[440px] lg:h-[500px]`}
      >
        {tile(
          images[0],
          0,
          small.length ? "col-span-2 row-span-2" : "col-span-4 row-span-2",
          small.length ? "50vw" : "100vw"
        )}

        {small.map((src, i) =>
          // 2 фото — второе на всю правую половину; 3 фото — друг под другом; 5+ — сетка 2×2
          tile(src, i + 1, small.length === 1 ? "col-span-2 row-span-2" : small.length === 2 ? "col-span-2" : "", "25vw")
        )}

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-sm font-medium shadow-lg transition cursor-pointer"
          >
            <GridViewOutlinedIcon sx={{ fontSize: 18 }} />
            {t("all", { count: images.length })}
          </button>
        )}
      </div>

      {/* Mobile carousel */}

      <div className="md:hidden relative -mx-4">
        <div
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
          onScroll={(e) => {
            const el = e.currentTarget;
            setSlide(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((src, i) =>
            tile(src, i, "w-full shrink-0 aspect-[4/3] snap-center", "100vw")
          )}
        </div>

        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur text-white text-xs tabular-nums pointer-events-none">
            {slide + 1} / {images.length}
          </span>
        )}
      </div>

      <PhotoLightbox
        images={images}
        title={title}
        index={lightboxIndex}
        onChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
}
