import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";

export default function EquipmentList({ items }: { items: string[] }) {
  const t = useTranslations("options.equipment");

  return (
    <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 text-gray-800">
          <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckIcon sx={{ fontSize: 16 }} />
          </span>
          {t(item)}
        </li>
      ))}
    </ul>
  );
}
