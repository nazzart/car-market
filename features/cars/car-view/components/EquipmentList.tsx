import CheckIcon from "@mui/icons-material/Check";
import { useTranslations } from "next-intl";

import { equipmentGroups } from "../../config/equipment";

// Опции по группам (Комфорт, Безопасность…), чтобы длинный список легко читался
export default function EquipmentList({ items }: { items: string[] }) {
  const t = useTranslations("options");

  const groups = Object.entries(equipmentGroups)
    .map(([group, keys]) => ({ group, items: (keys as readonly string[]).filter((k) => items.includes(k)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="grid sm:grid-cols-2 gap-x-10 gap-y-6">
      {groups.map(({ group, items }) => (
        <div key={group}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2.5">
            {t(`equipmentGroups.${group}`)}
          </h3>
          <ul className="space-y-2.5">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-800">
                <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-success-soft text-success-accent">
                  <CheckIcon sx={{ fontSize: 16 }} />
                </span>
                {t(`equipment.${item}`)}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
