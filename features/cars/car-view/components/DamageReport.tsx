"use client";

import Image from "next/image";
import { Tooltip } from "@mui/material";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import { useTranslations } from "next-intl";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

import { DamageMap, damagePoints } from "../../config/damage";

type DamageReportProps = { damages: DamageMap };

// Схема кузова «только для просмотра»: те же точки, что и в форме продажи.
// Маркеры пронумерованы и продублированы списком — на телефоне подсказки не работают
export default function DamageReport({ damages }: DamageReportProps) {
  const t = useTranslations("listing.damage");
  const tOptions = useTranslations("options");

  const partLabel = (id: string) => tOptions(`damageParts.${id}`);
  const damageLabel = (damage: string) => tOptions(`damageTypes.${damage}`);

  const damaged = damagePoints.filter((p) => damages[p.id]?.length);

  if (damaged.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-card bg-success-soft text-success-strong">
        <VerifiedOutlinedIcon className="text-success-accent" />
        <div>
          <div className="font-medium">{t("none")}</div>
          <div className="text-sm text-success-strong/80">
            {t("noneText")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card padding="sm" className="sm:p-6">
      {/* Diagram */}

      <div className="max-w-xl mx-auto">
        <div className="relative">
          <Image
            src="/cars/car-top.png"
            alt={t("diagramAlt")}
            width={680}
            height={352}
            className="w-full h-auto opacity-40"
          />

          {damaged.map((point, i) => (
            <Tooltip
              key={point.id}
              arrow
              placement="top"
              title={
                <div className="text-center">
                  <div className="font-semibold">{partLabel(point.id)}</div>
                  <div className="text-sm">
                    {damages[point.id].map(damageLabel).join(", ")}
                  </div>
                </div>
              }
            >
              <span
                tabIndex={0}
                aria-label={`${i + 1}. ${partLabel(point.id)}`}
                style={{ top: point.top, left: point.left }}
                className="
                  absolute -translate-x-1/2 -translate-y-1/2
                  w-7 h-7
                  flex items-center justify-center
                  rounded-full
                  bg-danger-solid text-white
                  text-xs font-bold
                  ring-4 ring-danger-solid/20
                  shadow-md
                  cursor-default
                "
              >
                {i + 1}
              </span>
            </Tooltip>
          ))}
        </div>

      </div>

      {/* List */}

      <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mt-6 pt-6 border-t border-gray-100">
        {damaged.map((point, i) => (
          <li key={point.id} className="flex items-start gap-3">
            <span className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full bg-danger-solid text-white text-xs font-bold">
              {i + 1}
            </span>

            <div className="min-w-0">
              <div className="font-medium text-gray-900">{partLabel(point.id)}</div>

              <div className="flex flex-wrap gap-1 mt-1">
                {damages[point.id].map((damage) => (
                  <Badge key={damage} tone="danger">
                    {damageLabel(damage)}
                  </Badge>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
