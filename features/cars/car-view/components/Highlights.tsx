import FlightLandOutlinedIcon from "@mui/icons-material/FlightLandOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";

import { useTranslations } from "next-intl";

import { CarFrontIcon, EngineIcon, InspectionIcon, KeyIcon, ServiceIcon } from "@/components/ui/dashIcons";
import { Listing } from "@/features/cars/types";

const GOOD = "bg-success-soft text-success-strong border-success-muted";
const NEUTRAL = "bg-gray-50 text-gray-800 border-gray-200";
const WARN = "bg-warning-soft text-warning border-warning-muted";

type HighlightsProps = { listing: Listing };

// Короткие «плюсы» автомобиля под характеристиками; «Торг» показан под ценой
export default function Highlights({ listing }: HighlightsProps) {
  const t = useTranslations("listing.highlights");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");

  // значки — как лампы приборной панели (components/ui/dashIcons); «новая» и «ввезена» — обычные
  const items = [
    listing.condition === "new" && { icon: <NewReleasesOutlinedIcon sx={{ fontSize: 18 }} />, text: t("new"), tone: GOOD },
    listing.noAccidents && { icon: <CarFrontIcon />, text: t("noAccidents"), tone: GOOD },
    listing.owners && {
      icon: <KeyIcon />,
      text: tCommon("owners", { count: listing.owners }),
      tone: listing.owners === 1 ? GOOD : NEUTRAL,
    },
    listing.inspectionUntil && {
      icon: <InspectionIcon />,
      text: t("inspection", { date: listing.inspectionUntil }),
      tone: NEUTRAL,
    },
    listing.service === "required" && { icon: <ServiceIcon />, text: t("needsService"), tone: WARN },
    listing.overallCondition === "repair" && { icon: <EngineIcon />, text: tOptions("overallCondition.repair"), tone: WARN },
    listing.mileageLatvia === "none" && { icon: <FlightLandOutlinedIcon sx={{ fontSize: 18 }} />, text: t("imported"), tone: NEUTRAL },
  ].filter(Boolean) as { icon: React.ReactNode; text: string; tone: string }[];

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ icon, text, tone }) => (
        <span
          key={text}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${tone}`}
        >
          {icon}
          {text}
        </span>
      ))}
    </div>
  );
}
