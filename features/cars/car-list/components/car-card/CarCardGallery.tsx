"use client";

import Image from "next/image";
import { useState } from "react";
import PhoneIcon from "@mui/icons-material/Phone";

type Props = {
  title: string;
  images: string[];
  totalImages: number;
};

export default function CarCardGallery({ title, images, totalImages }: Props) {
  const limitedImages = images.slice(0, 5);
  const previewImages = limitedImages.slice(0, 5);
  const remaining = totalImages - previewImages.length;

  const [activeImage, setActiveImage] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percent = x / bounds.width;

    const index = Math.floor(percent * previewImages.length);

    setActiveImage(Math.min(previewImages.length - 1, Math.max(0, index)));
  };

  return (
    <>
      {/* MOBILE */}
      <div className="sm:hidden scroll-smooth w-full overflow-x-auto scrollbar-none flex gap-2 snap-x snap-mandatory scroll-pl-5 pb-1 pl-5">
        {limitedImages.map((img, i) => {
          const isLast = i === limitedImages.length - 1;

          return (
            <div
              key={i}
              className={`relative flex-shrink-0 w-[85%] h-[200px] snap-start overflow-hidden ${
                isLast ? "rounded-l-lg rounded-r-none" : "rounded-lg"
              }`}
            >
              <Image
                src={img}
                alt={title}
                fill
                sizes="85vw"
                className="object-cover"
              />
            </div>
          );
        })}

        {/* CALL SLIDE */}

        <div className="flex-shrink-0 w-[25%] snap-start -ml-2">
          <div className="w-full h-full bg-green-600 active:bg-green-700 transition flex flex-col items-center justify-center text-white gap-2">
            <PhoneIcon sx={{ fontSize: 34 }} />
            <span className="font-semibold text-sm">Call seller</span>
          </div>
        </div>
      </div>

      {/* DESKTOP */}
      <div
        className="hidden sm:block group relative w-[240px] h-[160px] flex-shrink-0 overflow-hidden rounded-lg cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setActiveImage(0)}
      >
        <Image
          src={previewImages[activeImage]}
          alt={title}
          fill
          sizes="240px"
          className="object-cover"
        />

        {remaining > 0 && activeImage === previewImages.length - 1 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold text-lg">
            +{remaining}
          </div>
        )}

        {previewImages.length > 1 && (
          <div className="absolute top-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            {previewImages.map((_, i) => (
              <div
                key={i}
                className={`h-[3px] flex-1 rounded-full ${
                  i <= activeImage ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}