"use client";

import { useState } from "react";
import { Dialog, ListItemIcon, Menu, MenuItem } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PauseCircleOutlineIcon from "@mui/icons-material/PauseCircleOutline";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import ReplayIcon from "@mui/icons-material/Replay";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslations } from "next-intl";

import type { ListingStatus } from "./status";

type Props = {
  title: string;
  status: ListingStatus;
  onChange: (status: ListingStatus) => void;
};

// Меню «⋯» у объявления в кабинете: скрыть / активировать, продано, удалить (с подтверждением)
export default function ListingActions({ title, status, onChange }: Props) {
  const t = useTranslations("account.actions");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pick = (next: ListingStatus) => {
    setAnchor(null);
    onChange(next);
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label={t("menu")}
        aria-haspopup="menu"
        className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-900 text-gray-700 transition cursor-pointer"
      >
        <MoreHorizIcon fontSize="small" />
      </button>

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

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        slotProps={{ paper: { sx: { borderRadius: 4, m: 2, maxWidth: 420 } } }}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold">{t("confirmTitle")}</h2>
          <p className="text-gray-600 mt-2">{t("confirmText", { title })}</p>
          <p className="text-sm text-gray-500 mt-3">{t("confirmHint")}</p>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="h-11 px-5 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium transition cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(false);
                onChange("deleted");
              }}
              className="h-11 px-5 rounded-full bg-error hover:opacity-90 text-white text-sm font-semibold transition cursor-pointer"
            >
              {t("confirmDelete")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
