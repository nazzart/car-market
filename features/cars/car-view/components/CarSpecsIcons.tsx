import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SpeedIcon from "@mui/icons-material/Speed";
import SettingsIcon from "@mui/icons-material/Settings";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

export default function CarSpecsIcons() {
  return (
    <div className="flex flex-wrap gap-6 text-sm text-gray-700">

      <div className="flex items-center gap-2">
        <LocalGasStationIcon fontSize="small" />
        Бензин 1.4 л
      </div>

      <div className="flex items-center gap-2">
        <SettingsIcon fontSize="small" />
        Автомат
      </div>

      <div className="flex items-center gap-2">
        <DirectionsCarIcon fontSize="small" />
        Передний
      </div>

      <div className="flex items-center gap-2">
        <SpeedIcon fontSize="small" />
        24 900 км
      </div>

    </div>
  );
}