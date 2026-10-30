import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { cn } from "@/lib/utils";

import VerifiedBadge from "./VerifiedBadge";

type DealerNameProps = { name: string; verified?: boolean; className?: string };

// Продавец-дилер на карточке объявления: значок салона, название и «проверен» — заметнее серой строки вокруг
export default function DealerName({ name, verified, className }: DealerNameProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 min-w-0 font-medium text-gray-900", className)}>
      <StorefrontOutlinedIcon sx={{ fontSize: "1.15em" }} className="shrink-0 text-gray-500" />
      <span className="truncate">{name}</span>
      <VerifiedBadge verified={verified} size={14} />
    </span>
  );
}
