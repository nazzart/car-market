import SpeedIcon from "@mui/icons-material/Speed";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import SettingsIcon from "@mui/icons-material/Settings";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";

export default function CarKeySpecs() {
  const specs = [
    {
      icon: <CalendarMonthIcon fontSize="small" />,
      label: "Год",
      value: "2012",
    },
    {
      icon: <SpeedIcon fontSize="small" />,
      label: "Пробег",
      value: "261 256 км",
    },
    {
      icon: <LocalGasStationIcon fontSize="small" />,
      label: "Двигатель",
      value: "2.0 бензин",
    },
    {
      icon: <SettingsIcon fontSize="small" />,
      label: "Коробка",
      value: "Вариатор",
    },
    {
      icon: <DirectionsCarIcon fontSize="small" />,
      label: "Привод",
      value: "Передний",
    },
    {
      icon: <AirportShuttleIcon fontSize="small" />,
      label: "Кузов",
      value: "Седан",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3"
        >
          <div className="text-gray-600">{spec.icon}</div>

          <div>
            <div className="text-xs text-gray-500">{spec.label}</div>

            <div className="text-sm font-medium">{spec.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
