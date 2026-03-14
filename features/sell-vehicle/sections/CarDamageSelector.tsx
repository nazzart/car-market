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

type Damage = "paint" | "scratch" | "dent" | "rust";

const options: { value: Damage; label: string }[] = [
  { value: "paint", label: "Окрас" },
  { value: "scratch", label: "Скол / Царапина" },
  { value: "dent", label: "Вмятина" },
  { value: "rust", label: "Ржавчина" },
];

const points = [
  { id: "frontBumper", label: "Передний бампер", top: "50%", left: "93%" },

  { id: "hood", label: "Капот", top: "50%", left: "80%" },

  {
    id: "leftFrontFender",
    label: "Левое переднее крыло",
    top: "18%",
    left: "75%",
  },
  {
    id: "rightFrontFender",
    label: "Правое переднее крыло",
    top: "81%",
    left: "75%",
  },

  { id: "roof", label: "Крыша", top: "50%", left: "45%" },

  {
    id: "leftFrontDoor",
    label: "Левая передняя дверь",
    top: "18%",
    left: "55%",
  },
  {
    id: "rightFrontDoor",
    label: "Правая передняя дверь",
    top: "81%",
    left: "55%",
  },

  { id: "leftRearDoor", label: "Левая задняя дверь", top: "18%", left: "40%" },
  {
    id: "rightRearDoor",
    label: "Правая задняя дверь",
    top: "81%",
    left: "40%",
  },

  { id: "trunk", label: "Багажник", top: "50%", left: "18%" },

  {
    id: "leftRearFender",
    label: "Левое заднее крыло",
    top: "18%",
    left: "23%",
  },
  {
    id: "rightRearFender",
    label: "Правое заднее крыло",
    top: "81%",
    left: "23%",
  },

  { id: "rearBumper", label: "Задний бампер", top: "50%", left: "8%" },
];

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

export function CarDamageSelector() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);

  const [selected, setSelected] = useState<Damage[]>([]);
  const [damages, setDamages] = useState<Record<string, Damage[]>>({});

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

    setDamages((prev) => ({
      ...prev,
      [activePoint]: selected,
    }));

    closePopover();
  };

  const deleteDamage = () => {
    if (!activePoint) return;

    setDamages((prev) => {
      const copy = { ...prev };
      delete copy[activePoint];
      return copy;
    });

    closePopover();
  };

  const getDamageLabel = (damages?: Damage[]) => {
    if (!damages || damages.length === 0) return null;

    return damages
      .map((d) => options.find((o) => o.value === d)?.label)
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
                  <div className="font-semibold text-white">{p.label}</div>

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
            {activePart?.label ?? "Деталь кузова"}
          </Typography>

          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mb: 1.5, display: "block" }}
          >
            Выберите повреждения
          </Typography>

          <Stack gap={1}>
            {options.map((o) => {
              const active = selected.includes(o.value);

              return (
                <Button
                  key={o.value}
                  variant={active ? "contained" : "outlined"}
                  size="small"
                  onClick={() => toggleDamage(o.value)}
                  sx={{ textTransform: "none" }}
                >
                  {o.label}
                </Button>
              );
            })}
          </Stack>
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between" p={1.5}>
          <Button size="small" color="error" onClick={deleteDamage}>
            Удалить
          </Button>

          <Button size="small" variant="contained" onClick={saveDamage}>
            Сохранить
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}
