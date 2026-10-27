"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";

const MAX_PREVIEW = 5;

type Props = {
  href: string;
  title: string;
  images: string[];
};

// Листание фото движением курсора по превью
export default function ListingGallery({ href, title, images }: Props) {
  const [active, setActive] = useState(0);

  const preview = images.slice(0, MAX_PREVIEW);
  const remaining = images.length - preview.length;
  const isLast = active === preview.length - 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const index = Math.floor(percent * preview.length);

    setActive(Math.min(preview.length - 1, Math.max(0, index)));
  };

  return (
    <Link
      href={href}
      tabIndex={-1}
      aria-hidden
      onMouseMove={preview.length > 1 ? handleMouseMove : undefined}
      onMouseLeave={() => setActive(0)}
      className="group/gallery relative z-10 block aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
    >
      {preview.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-gray-300">
          <DirectionsCarOutlinedIcon sx={{ fontSize: 48 }} />
          <span className="text-xs text-gray-500">Нет фото</span>
        </div>
      ) : (
        <>
          <Image
            src={preview[active]}
            alt={title}
            fill
            sizes="(min-width: 768px) 280px, 100vw"
            className="object-cover"
          />

          {remaining > 0 && isLast && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-semibold text-lg">
              Ещё {remaining} фото
            </div>
          )}

          {images.length > 1 && (
            <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur text-white text-xs">
              <PhotoCameraOutlinedIcon sx={{ fontSize: 14 }} />
              {images.length}
            </span>
          )}

          {preview.length > 1 && (
            <div className="absolute bottom-2 inset-x-2 flex gap-1 opacity-0 group-hover/gallery:opacity-100 transition">
              {preview.map((_, i) => (
                <div
                  key={i}
                  className={`h-[3px] flex-1 rounded-full ${
                    i === active ? "bg-white" : "bg-white/45"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </Link>
  );
}
