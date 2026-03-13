"use client";

import {
  Popover,
  Chip,
  Button,
  Stack,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { useState, useEffect } from "react";

type DamageType = "paint" | "scratch" | "dent" | "rust";

const options = [
  { value: "paint", label: "Окрас" },
  { value: "scratch", label: "Царапина" },
  { value: "dent", label: "Вмятина" },
  { value: "rust", label: "Ржавчина" },
];

type Props = {
  anchorEl: HTMLElement | null;
  value?: DamageType;
  onClose: () => void;
  onSave: (type: DamageType) => void;
  onDelete: () => void;
};

export function DamagePopover({
  anchorEl,
  value,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const open = Boolean(anchorEl);

  const [selected, setSelected] = useState<DamageType | null>(value ?? null);

  useEffect(() => {
    setSelected(value ?? null);
  }, [value]);

  const handleSave = () => {
    if (!selected) return;
    onSave(selected);
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 0,
          minWidth: 230,
        },
      }}
    >
      <Box p={2}>
        {/* title */}

        <Typography
          variant="subtitle2"
          sx={{ mb: 1.5, fontWeight: 600 }}
        >
          Тип повреждения
        </Typography>

        {/* options */}

        <Stack
          direction="row"
          flexWrap="wrap"
          gap={1}
        >
          {options.map((o) => (
            <Chip
              key={o.value}
              label={o.label}
              clickable
              size="small"
              color={selected === o.value ? "primary" : "default"}
              variant={selected === o.value ? "filled" : "outlined"}
              onClick={() => setSelected(o.value as DamageType)}
            />
          ))}
        </Stack>
      </Box>

      <Divider />

      {/* actions */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p={1.5}
      >
        <Button
          size="small"
          color="error"
          onClick={onDelete}
        >
          Удалить
        </Button>

        <Button
          size="small"
          variant="contained"
          disabled={!selected}
          onClick={handleSave}
        >
          Сохранить
        </Button>
      </Stack>
    </Popover>
  );
}