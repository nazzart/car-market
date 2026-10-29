import Image from "next/image";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";

import { cn } from "@/lib/utils";

type NoPhotoProps = {
  iconSize?: number;
  label?: string;
  dark?: boolean; // на тёмном фоне (панель сравнения)
};

// Заглушка вместо фото: значок машины и, если нужно, подпись «Nav foto».
// Заполняет родителя — у него должны быть position: relative и размеры
export function NoPhoto({
  iconSize = 36,
  label,
  dark,
}: NoPhotoProps) {
  return (
    <span
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-1",
        dark ? "text-white/50" : "text-gray-300"
      )}
    >
      <DirectionsCarOutlinedIcon sx={{ fontSize: iconSize }} />
      {label && <span className="text-xs text-gray-500">{label}</span>}
    </span>
  );
}

type CarPhotoProps = {
  src: string | undefined;
  alt: string;
  sizes: string;
  className?: string;
  imageClassName?: string; // например, grayscale у скрытых
  unoptimized?: boolean; // локальный blob: при подаче объявления
  children?: React.ReactNode;
} & React.ComponentProps<typeof NoPhoto>;

// Фото объявления в рамке 4:3 или заглушка. Размер, скругление и отступы — через className;
// children — поверх фото (значки, кнопки)
export default function CarPhoto({
  src,
  alt,
  sizes,
  className,
  imageClassName,
  unoptimized,
  children,
  ...placeholder
}: CarPhotoProps) {
  return (
    <div className={cn("relative aspect-[4/3] overflow-hidden bg-gray-100", className)}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} unoptimized={unoptimized} className={cn("object-cover", imageClassName)} />
      ) : (
        <NoPhoto {...placeholder} />
      )}
      {children}
    </div>
  );
}
