import { useTranslations } from "next-intl";
import BoltIcon from "@mui/icons-material/Bolt";

import { cn } from "@/lib/utils";

type FreshBadgeProps = { className?: string };

// «Новое объявление» — размещено за последние 24 часа
export default function FreshBadge({ className }: FreshBadgeProps) {
  const t = useTranslations("cars.row");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 pl-1.5 pr-2 py-0.5 rounded-full bg-primary text-white text-xs font-semibold shadow-sm",
        className
      )}
    >
      <BoltIcon sx={{ fontSize: 14 }} />
      {t("fresh")}
    </span>
  );
}
