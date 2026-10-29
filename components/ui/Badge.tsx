import { cn } from "@/lib/utils";

import type { BadgeTone } from "./types";

// Небольшая метка: статус объявления, «Jauns», марка дилера, повреждение, флаг модерации
const tones: Record<BadgeTone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  muted: "bg-gray-100 text-gray-600",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  dangerStrong: "bg-danger-muted text-danger-strong",
  solid: "bg-danger-solid text-white", // требует внимания модератора (жалобы)
};

type BadgeProps = {
  tone?: BadgeTone;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function Badge({
  tone = "neutral",
  icon,
  className,
  children,
}: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium", tones[tone], className)}>
      {icon}
      {children}
    </span>
  );
}
