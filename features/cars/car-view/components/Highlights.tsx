import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import FlightLandOutlinedIcon from "@mui/icons-material/FlightLandOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";

import { useTranslations } from "next-intl";

import { Listing } from "@/features/cars/types";

const GOOD = "bg-success-soft text-success-strong border-success-muted";
const NEUTRAL = "bg-gray-50 text-gray-800 border-gray-200";
const WARN = "bg-warning-soft text-warning border-warning-muted";

// Короткие «плюсы» автомобиля под характеристиками; «Торг» показан под ценой
export default function Highlights({ listing }: { listing: Listing }) {
  const t = useTranslations("listing.highlights");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  const items = [
    listing.condition === "new" && { icon: NewReleasesOutlinedIcon, text: t("new"), tone: GOOD },
    listing.noAccidents && { icon: VerifiedOutlinedIcon, text: t("noAccidents"), tone: GOOD },
    listing.owners && {
      icon: PersonOutlineIcon,
      text: tCommon("owners", { count: listing.owners }),
      tone: listing.owners === 1 ? GOOD : NEUTRAL,
    },
    listing.inspectionUntil && {
      icon: FactCheckOutlinedIcon,
      text: t("inspection", { date: listing.inspectionUntil }),
      tone: NEUTRAL,
    },
    listing.service === "required" && { icon: BuildCircleOutlinedIcon, text: t("needsService"), tone: WARN },
    listing.overallCondition === "repair" && { icon: BuildCircleOutlinedIcon, text: tOptions("overallCondition.repair"), tone: WARN },
    listing.mileageLatvia === "none" && { icon: FlightLandOutlinedIcon, text: t("imported"), tone: NEUTRAL },
  ].filter(Boolean) as { icon: typeof VerifiedOutlinedIcon; text: string; tone: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ icon: Icon, text, tone }) => (
        <span
          key={text}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${tone}`}
        >
          <Icon sx={{ fontSize: 18 }} />
          {text}
        </span>
      ))}
    </div>
  );
}
