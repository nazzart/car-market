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
  { value: "scratch", label: "Царапина" },
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
  damage,
  onClick,
}: {
  damage?: Damage;
  onClick: (e: any) => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
          w-9 h-9
          rounded-full
          cursor-pointer
          flex items-center justify-center
          transition-all duration-200
          hover:scale-110
          bg-black
          shadow-md
        "
    >
      {!damage && (
        <AddIcon
          sx={{
            fontSize: 18,
            color: "#fff",
          }}
        />
      )}

      {damage && <span className="w-3 h-3 rounded-full bg-red-500" />}
    </button>
  );
}

export function CarDamageSelector() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activePoint, setActivePoint] = useState<string | null>(null);
  const [selected, setSelected] = useState<Damage | null>(null);

  const [damages, setDamages] = useState<Record<string, Damage>>({});

  const openPopover = (e: any, id: string) => {
    setAnchorEl(e.currentTarget);
    setActivePoint(id);
    setSelected(damages[id] ?? null);
  };

  const closePopover = () => {
    setAnchorEl(null);
  };

  const saveDamage = () => {
    if (!activePoint || !selected) return;

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

  const getDamageLabel = (damage?: Damage) => {
    if (!damage) return null;

    const option = options.find((o) => o.value === damage);
    return option?.label;
  };

  return (
    <div className="relative ">

      <img src="/cars/car-top.png" alt="car" className="w-full" />

      {points.map((p) => {
        const damage = damages[p.id];
        const damageLabel = getDamageLabel(damage);

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
                  <div className="font-medium">{p.label}</div>

                  {damageLabel && (
                    <div className="text-xs opacity-70">{damageLabel}</div>
                  )}
                </div>
              }
            >
              <div>
                <DamagePoint
                  damage={damage}
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
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Тип повреждения
          </Typography>

          <Stack gap={1}>
            {options.map((o) => (
              <Button
                key={o.value}
                variant={selected === o.value ? "contained" : "outlined"}
                size="small"
                onClick={() => setSelected(o.value)}
                sx={{ textTransform: "none" }}
              >
                {o.label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between" p={1.5}>
          <Button size="small" color="error" onClick={deleteDamage}>
            Удалить
          </Button>

          <Button
            size="small"
            variant="contained"
            disabled={!selected}
            onClick={saveDamage}
          >
            Сохранить
          </Button>
        </Stack>
      </Popover>
    </div>
  );
}
