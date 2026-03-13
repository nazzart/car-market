"use client";

import Image from "next/image";

type CategoryCardProps = {
  title: string;
  description: string;
  sub?: string;
  image: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function CategoryCard({
  title,
  description,
  sub,
  image,
  onClick,
}: CategoryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.05)]
        cursor-pointer
        rounded-2xl
        border
        bg-white
        overflow-hidden
        transition-all
        duration-200
        hover:border-blue-400 shadow-[0_6px_18px_rgba(0,0,0,0.06)]
       
      `}
    >
      {/* IMAGE */}
      <div className="flex justify-center pt-10 pb-6 px-2">
        <Image src={image} width={280} height={180} alt={title} />
      </div>

      {/* CONTENT */}
      <div className="px-8 pb-8">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold leading-snug">{title}</h3>

          <svg
            className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        <p className="text-gray-500 mt-2">{description}</p>

        {sub && <p className="text-gray-400 text-sm">{sub}</p>}
      </div>
    </div>
  );
}
