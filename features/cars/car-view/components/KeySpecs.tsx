import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import LocalGasStationOutlinedIcon from "@mui/icons-material/LocalGasStationOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AltRouteOutlinedIcon from "@mui/icons-material/AltRouteOutlined";

import { formatNumber } from "@/lib/utils";

import { Listing } from "../../data/listings";
import {
  driveOptions,
  fuelOptions,
  labelOf,
  transmissionOptions,
} from "../../config/filterOptions";

export default function KeySpecs({ listing }: { listing: Listing }) {
  const fuel = labelOf(fuelOptions, listing.fuel);

  const specs = [
    { icon: CalendarMonthOutlinedIcon, label: "Год", value: String(listing.year) },
    { icon: SpeedOutlinedIcon, label: "Пробег", value: `${formatNumber(listing.mileage)} км` },
    {
      icon: LocalGasStationOutlinedIcon,
      label: "Двигатель",
      value: listing.engine ? `${listing.engine.toFixed(1)} л · ${fuel}` : fuel,
    },
    { icon: BoltOutlinedIcon, label: "Мощность", value: `${listing.power} л.с.` },
    {
      icon: SettingsOutlinedIcon,
      label: "Коробка",
      value: labelOf(transmissionOptions, listing.transmission),
    },
    { icon: AltRouteOutlinedIcon, label: "Привод", value: labelOf(driveOptions, listing.drive) },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {specs.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200"
        >
          <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Icon fontSize="small" />
          </span>

          <div className="min-w-0">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-medium text-gray-900 truncate">{value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
