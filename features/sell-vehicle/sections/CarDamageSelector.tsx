"use client";

import { useState } from "react";
import {
  Popover,
  Button,
  Stack,
  Box,
  Typography,
  Divider,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslations } from "next-intl";

import {
  Damage,
  DamageMap,
  damageTypes,
  damagePoints as points,
} from "@/features/cars/config/damage";

type Props = {
  value?: DamageMap;
  onChange: (value: DamageMap) => void;
};

function DamagePoint({
  damageCount,
  onClick,
}: {
  damageCount?: number;
  onClick: (e: any) => void;
}) {
  const hasDamage = !!damageCount;

  return (
    <button
      onClick={onClick}
      className={`
        rounded-full
        flex items-center justify-center
        cursor-pointer
        transition-all duration-200
        hover:scale-110
        shadow-md

        ${
          hasDamage
            ? "w-8 h-8 bg-red-600 text-white ring-2 ring-red-300 shadow-lg"
            : "w-7 h-7 bg-black text-white hover:bg-gray-800"
        }
      `}
    >
      {!hasDamage && (
        <AddIcon
          sx={{
            fontSize: 16,
            color: "#fff",
          }}
        />
      )}

      {hasDamage && (
        <span className="text-xs font-bold leading-none">{damageCount}</span>
      )}
    </button>
  );
}

export function CarDamageSelector({ value, onChange }: Props) {
  const t = useTranslations("sell.damage");
  const tOptions = useTranslations("options");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const [selected, setSelected] = useState<Damage[]>([]);

  const damages = value ?? {};

  const openPopover = (e: any, id: string) => {
    setAnchorEl(e.currentTarget);
    setActivePoint(id);
    setSelected(damages[id] ?? []);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const toggleDamage = (damage: Damage) => {
    setSelected((prev) =>
      prev.includes(damage)
        ? prev.filter((d) => d !== damage)
        : [...prev, damage]
    );
  };

  const saveDamage = () => {
    if (!activePoint) return;

    if (selected.length === 0) {
      deleteDamage();
      return;
    }

    onChange({
      ...damages,
      [activePoint]: selected,
    });

    closePopover();
  };

  const deleteDamage = () => {
    if (!activePoint) return;

    const copy = { ...damages };
    delete copy[activePoint];
    onChange(copy);

    closePopover();
  };

  const getDamageLabel = (damages?: Damage[]) => {
    if (!damages || damages.length === 0) return null;

    return damages
      .map((d) => tOptions(`damageTypes.${d}`))
      .join(", ");
  };

  const activePart = points.find((p) => p.id === activePoint);

  return (
    <div className="relative">
      {/* изображение машины */}

      <img src="/cars/car-top.png" alt="car" className="w-full opacity-50" />

      {/* точки */}

      {points.map((p) => {
        const damageList = damages[p.id];
        const damageLabel = getDamageLabel(damageList);

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: p.top,
              left: p.left,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Tooltip
              arrow
              placement="top"
              title={
                <div className="text-center">
                  <div className="font-semibold text-white">{tOptions(`damageParts.${p.id}`)}</div>

                  {damageLabel && (
                    <div className="text-sm text-white">{damageLabel}</div>
                  )}
                </div>
              }
            >
              <div>
                <DamagePoint
                  damageCount={damageList?.length}
                  onClick={(e) => openPopover(e, p.id)}
                />
              </div>
            </Tooltip>
          </div>
        );
      })}

      {/* popover */}

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 220,
          },
        }}
      >
        <Box p={2}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {activePart ? tOptions(`damageParts.${activePart.id}`) : t("part")}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mb: 1.5, display: "block" }}
          >
            {t("choose")}
          </Typography>

          <Stack gap={1}>
            {damageTypes.map((value) => {
              const active = selected.includes(value);

              return (
                <Button
                  key={value}
                  variant={active ? "contained" : "outlined"}
                  size="small"
                  onClick={() => toggleDamage(value)}
                  sx={{ textTransform: "none" }}
                >
                  {tOptions(`damageTypes.${value}`)}
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between" p={1.5}>
          <Button size="small" color="error" onClick={deleteDamage}>
            {t("remove")}
          </Button>

          <Button size="small" variant="contained" onClick={saveDamage}>
            {t("save")}
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}
