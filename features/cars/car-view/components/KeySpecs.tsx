import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import LocalGasStationOutlinedIcon from "@mui/icons-material/LocalGasStationOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";

import { useTranslations } from "next-intl";

import { formatNumber } from "@/lib/utils";

import { Listing } from "@/features/cars/types";

type KeySpecsProps = { listing: Listing };

export default function KeySpecs({ listing }: KeySpecsProps) {
  const t = useTranslations("listing.keySpecs");
  const tCommon = useTranslations("common");
  const tOptions = useTranslations("options");
  const fuel = tOptions(`fuel.${listing.fuel}`);

  const specs = [
    { icon: CalendarMonthOutlinedIcon, label: t("year"), value: String(listing.year) },
    { icon: SpeedOutlinedIcon, label: t("mileage"), value: `${formatNumber(listing.mileage)} ${tCommon("units.km")}` },
    {
      icon: LocalGasStationOutlinedIcon,
      label: t("engine"),
      value: listing.engine ? `${listing.engine.toFixed(1)} ${tCommon("units.liters")} · ${fuel}` : fuel,
    },
    { icon: BoltOutlinedIcon, label: t("power"), value: `${listing.power} ${tCommon("units.hp")}` },
    {
      icon: SettingsOutlinedIcon,
      label: t("gearbox"),
      value: tOptions(`transmission.${listing.transmission}`),
    },
    { icon: AltRouteOutlinedIcon, label: t("drive"), value: tOptions(`drive.${listing.drive}`) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {specs.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-3 px-3.5 py-3 sm:p-4 rounded-card border border-gray-200"
        >
          <span className="hidden sm:flex w-10 h-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Icon fontSize="small" />
          </span>

          <div className="min-w-0">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-medium text-gray-900 leading-snug">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
