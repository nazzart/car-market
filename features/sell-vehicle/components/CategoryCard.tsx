"use client";

import Image from "next/image";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

type CategoryCardProps = {
  title: string;
  description: string;
  image: string;
  soon?: boolean;
  onClick?: () => void;
};

export default function CategoryCard({
  title,
  description,
  image,
  soon,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={soon}
      className="
        group relative
        text-left
        rounded-3xl
        border border-gray-200
        bg-white
        overflow-hidden
        transition duration-200
        enabled:hover:border-gray-300
        enabled:hover:shadow-xl enabled:hover:shadow-black/5
        enabled:hover:-translate-y-1
        enabled:cursor-pointer
        disabled:cursor-not-allowed
      "
    >
      {soon && (
        <span className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-medium">
          Скоро
        </span>
      )}

      {/* Image */}

      <div className={`bg-gray-50 px-6 pt-8 pb-4 ${soon ? "opacity-50" : ""}`}>
        <Image
          src={image}
          width={300}
          height={200}
          alt=""
          className="w-full h-auto mix-blend-multiply transition duration-300 group-enabled:group-hover:scale-105"
        />
      </div>

      {/* Content */}

      <div className="flex items-end justify-between gap-4 p-6">
        <div>
          <h3 className={`text-lg font-semibold ${soon ? "text-gray-400" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>

        {!soon && (
          <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 transition group-hover:bg-primary group-hover:text-white">
            <ArrowForwardIcon fontSize="small" />
          </span>
        )}
      </div>
    </button>
  );
}
