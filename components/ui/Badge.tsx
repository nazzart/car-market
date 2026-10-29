import { cn } from "@/lib/utils";

// Небольшая метка: статус объявления, «Jauns», марка дилера, повреждение, флаг модерации
const tones = {
  neutral: "bg-gray-100 text-gray-700",
  muted: "bg-gray-100 text-gray-600",
  success: "bg-emerald-50 text-emerald-700",
  info: "bg-sky-50 text-sky-700",
  warning: "bg-amber-50 text-amber-800",
  danger: "bg-red-50 text-red-700",
  dangerStrong: "bg-red-100 text-red-800",
  solid: "bg-red-600 text-white", // требует внимания модератора (жалобы)
};

export type BadgeTone = keyof typeof tones;

export default function Badge({
  tone = "neutral",
  icon,
  className,
  children,
}: {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
