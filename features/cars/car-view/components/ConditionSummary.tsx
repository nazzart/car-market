import { useTranslations } from "next-intl";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";

import { cn } from "@/lib/utils";

import { Listing } from "@/features/cars/types";

type Tone = "good" | "warn" | "bad" | "neutral";

const toneClass: Record<Tone, string> = {
  good: "bg-emerald-500",
  warn: "bg-amber-500",
  bad: "bg-red-500",
  neutral: "bg-gray-300",
};

const conditionTone = { excellent: "good", good: "good", average: "warn", repair: "bad" } as const;
const serviceTone = { recent: "good", partial: "warn", required: "bad" } as const;

// «Состояние и обслуживание»: то, что продавец указал в форме, — плитками с цветной отметкой
export default function ConditionSummary({ listing }: { listing: Listing }) {
  const t = useTranslations("listing.specs");
  const tOptions = useTranslations("options");

  const tiles = [
    listing.overallCondition && {
      icon: AutoAwesomeOutlinedIcon,
      label: t("overallCondition"),
      value: tOptions(`overallCondition.${listing.overallCondition}`),
      tone: conditionTone[listing.overallCondition],
    },
    listing.service && {
      icon: BuildCircleOutlinedIcon,
      label: t("service"),
      value: tOptions(`service.${listing.service}`),
      tone: serviceTone[listing.service],
    },
    listing.serviceBook !== undefined && {
      icon: MenuBookOutlinedIcon,
      label: t("serviceBook"),
      value: listing.serviceBook ? t("yes") : t("no"),
      tone: listing.serviceBook ? "good" : "neutral",
    },
    listing.mileageLatvia && {
      icon: PlaceOutlinedIcon,
      label: t("mileageLatvia"),
      value: tOptions(`mileageLatvia.${listing.mileageLatvia}`),
      tone: "neutral",
    },
  ].filter(Boolean) as { icon: typeof PlaceOutlinedIcon; label: string; value: string; tone: Tone }[];

  if (tiles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
      {tiles.map(({ icon: Icon, label, value, tone }) => (
        <div key={label} className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50">
          <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white text-gray-600">
            <Icon fontSize="small" />
          </span>
          <div className="min-w-0">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="flex items-center gap-1.5 font-semibold text-gray-900 leading-snug">
              <span className={cn("w-2 h-2 rounded-full shrink-0", toneClass[tone])} />
              {value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
