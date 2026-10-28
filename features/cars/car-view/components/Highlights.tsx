import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";

import { useTranslations } from "next-intl";

import { Listing } from "../../data/listings";

const GOOD = "bg-emerald-50 text-emerald-800 border-emerald-100";
const NEUTRAL = "bg-gray-50 text-gray-800 border-gray-200";

// Короткие «плюсы» автомобиля под характеристиками; «Торг» показан под ценой
export default function Highlights({ listing }: { listing: Listing }) {
  const t = useTranslations("listing.highlights");
  const tCommon = useTranslations("common");

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
    listing.tuned && { icon: BuildOutlinedIcon, text: t("tuning"), tone: "bg-amber-50 text-amber-800 border-amber-100" },
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
