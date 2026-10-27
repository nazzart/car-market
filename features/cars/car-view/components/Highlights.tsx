import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";

import { useTranslations } from "next-intl";

import { Listing } from "../../data/listings";

// Короткие «плюсы» автомобиля под характеристиками
export default function Highlights({ listing }: { listing: Listing }) {
  const t = useTranslations("listing.highlights");
  const tCommon = useTranslations("common");

  const items = [
    listing.condition === "new" && { icon: NewReleasesOutlinedIcon, text: t("new") },
    listing.noAccidents && { icon: VerifiedOutlinedIcon, text: t("noAccidents") },
    listing.owners && {
      icon: PersonOutlineIcon,
      text: tCommon("owners", { count: listing.owners }),
    },
    listing.inspectionUntil && {
      icon: FactCheckOutlinedIcon,
      text: t("inspection", { date: listing.inspectionUntil }),
    },
    listing.tuned && { icon: BuildOutlinedIcon, text: t("tuning") },
    listing.negotiable && { icon: HandshakeOutlinedIcon, text: t("negotiable") },
  ].filter(Boolean) as { icon: typeof VerifiedOutlinedIcon; text: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ icon: Icon, text }) => (
        <span
          key={text}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-800"
        >
          <Icon sx={{ fontSize: 18 }} className="text-gray-600" />
          {text}
        </span>
      ))}
    </div>
  );
}
