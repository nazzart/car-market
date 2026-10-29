"use client";

import { useState } from "react";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslations } from "next-intl";

import { IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";

import type { ListingStatus } from "./status";

type ListingActionsProps = {
  title: string;
  status: ListingStatus;
  onChange: (status: ListingStatus) => void;
};

// Меню «⋯» у объявления в кабинете: скрыть / активировать, продано, удалить (с подтверждением)
export default function ListingActions({ title, status, onChange }: ListingActionsProps) {
  const t = useTranslations("account.actions");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pick = (next: ListingStatus) => {
    setAnchor(null);
    onChange(next);
  };

  return (
    <>
      <IconButton label={t("menu")} aria-haspopup="menu" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 220, mt: 0.5 } } }}
      >
        {status === "active" && (
          <MenuItem onClick={() => pick("paused")}>
            <ListItemIcon><PauseCircleOutlineIcon fontSize="small" /></ListItemIcon>
            {t("pause")}
          </MenuItem>
        )}

        {status === "paused" && (
          <MenuItem onClick={() => pick("active")}>
            <ListItemIcon><PlayCircleOutlineIcon fontSize="small" /></ListItemIcon>
            {t("activate")}
          </MenuItem>
        )}

        {status !== "sold" ? (
          <MenuItem onClick={() => pick("sold")}>
            <ListItemIcon><SellOutlinedIcon fontSize="small" /></ListItemIcon>
            {t("sold")}
          </MenuItem>
        ) : (
          <MenuItem onClick={() => pick("active")}>
            <ListItemIcon><ReplayIcon fontSize="small" /></ListItemIcon>
            {t("relist")}
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            setAnchor(null);
            setConfirmDelete(true);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "inherit" }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
          {t("delete")}
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onChange("deleted");
        }}
        title={t("confirmTitle")}
        text={t("confirmText", { title })}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        maxWidth={420}
      >
        <p className="text-sm text-gray-500 mt-3">{t("confirmHint")}</p>
      </ConfirmDialog>
    </>
  );
}
