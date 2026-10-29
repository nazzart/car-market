"use client";

import { useState } from "react";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReplayIcon from "@mui/icons-material/Replay";
import SearchIcon from "@mui/icons-material/Search";
import { useLocale, useTranslations } from "next-intl";

import { IconButton } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { inputClass } from "@/components/ui/form";
import { Listing } from "@/features/cars/types";
import { clearModeration, dismissReports } from "@/features/moderation/store";
import { Link } from "@/i18n/navigation";
import { cn, formatAgo, formatPrice } from "@/lib/utils";

import { StatusKey, Thumb, pillClass, statusTone, useAdminData, useListingAdmin, useModerationDialog } from "../shared";

type Filter = "all" | "public" | "pending" | "hidden" | "blocked" | "removed" | "reported";

export default function ListingsTab({ query, onQueryChange }: { query: string; onQueryChange: (q: string) => void }) {
  const t = useTranslations("moderation.admin");
  const tReasons = useTranslations("moderation.reasons");
  const { listings, sellerOf } = useAdminData();
  const locale = useLocale();
  const { statusKey, openReports, of } = useListingAdmin();
  const { dialog, block, remove } = useModerationDialog();
  const [filter, setFilter] = useState<Filter>("all");

  const filters: Filter[] = ["all", "public", "pending", "hidden", "blocked", "removed", "reported"];
  const groups: Record<Exclude<Filter, "all" | "reported">, StatusKey[]> = {
    public: ["active"],
    pending: ["pending"],
    hidden: ["paused", "sold", "deleted"],
    blocked: ["blocked", "accountBlocked"],
    removed: ["removed"],
  };
  const matches = (l: Listing) =>
    filter === "all" ? true : filter === "reported" ? openReports(l.id).length > 0 : groups[filter].includes(statusKey(l.id));

  const q = query.trim().toLowerCase();
  const privateLabel = t("table.private");
  const rows = listings
    .filter(matches)
    .filter(
      (l) =>
        !q ||
        l.id === q.replace("#", "") ||
        l.title.toLowerCase().includes(q) ||
        sellerOf(l, privateLabel).toLowerCase().includes(q)
    )
    // сначала объявления с жалобами, потом свежие
    .sort((a, b) => openReports(b.id).length - openReports(a.id).length || a.postedMinutesAgo - b.postedMinutesAgo);

  return (
    <div>
      <div className="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
        <div className="relative xl:w-96">
          <SearchIcon fontSize="small" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("filters.search")}
            className={`${inputClass} pl-9`}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 xl:mx-0 xl:px-0">
          {filters.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={pillClass(filter === f)}>
              {t(`filters.${f}`)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4 mb-3">{t("table.count", { count: rows.length })}</p>

      {rows.length === 0 ? (
        <EmptyState text={t("table.empty")} />
      ) : (
        <ul className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {rows.map((l) => {
            const status = statusKey(l.id);
            const reportsCount = openReports(l.id).length;
            const v = of(l.id)!;
            const reason = v.moderation?.reason ?? v.accountBlock?.reason;

            return (
              <li key={l.id} className={cn("flex items-center gap-3 sm:gap-4 p-3", reportsCount > 0 && "bg-red-50/40")}>
                <Thumb listing={l} muted={status !== "active"} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <Badge tone={statusTone[status]}>{t(`status.${status}`)}</Badge>
                    {reportsCount > 0 && (
                      <Badge tone="solid" icon={<FlagOutlinedIcon sx={{ fontSize: 13 }} />}>
                        {t("reports.count", { count: reportsCount })}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">#{l.id}</span>
                  </div>
                  <div className="font-semibold text-gray-900 truncate mt-1">
                    {l.title}, {l.year}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    <span className="font-medium text-gray-700">{formatPrice(l.price)}</span> · {sellerOf(l, privateLabel)} ·{" "}
                    {formatAgo(l.postedMinutesAgo, locale)}
                    {reason && ` · ${tReasons(reason)}`}
                  </div>
                </div>

                <ActionsMenu
                  listing={l}
                  status={status}
                  hasReports={reportsCount > 0}
                  onBlock={() => block(l.id, l.title, openReports(l.id)[0]?.reason)}
                  onRemove={() => remove(l.id, l.title, openReports(l.id)[0]?.reason)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {dialog}
    </div>
  );
}

function ActionsMenu({
  listing,
  status,
  hasReports,
  onBlock,
  onRemove,
}: {
  listing: Listing;
  status: StatusKey;
  hasReports: boolean;
  onBlock: () => void;
  onRemove: () => void;
}) {
  const t = useTranslations("moderation.admin.actions");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const moderated = status === "blocked" || status === "removed";
  const close = () => setAnchor(null);
  const run = (fn: () => void) => () => {
    close();
    fn();
  };

  return (
    <>
      <IconButton label={t("menu")} aria-haspopup="menu" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 220, mt: 0.5 } } }}
      >
        <MenuItem component={Link} href={`/listing/${listing.id}`} target="_blank" onClick={close}>
          <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
          {t("view")}
        </MenuItem>

        {moderated ? (
          <MenuItem onClick={run(() => clearModeration(listing.id))}>
            <ListItemIcon><ReplayIcon fontSize="small" /></ListItemIcon>
            {status === "blocked" ? t("unblock") : t("restore")}
          </MenuItem>
        ) : (
          <MenuItem onClick={run(onBlock)}>
            <ListItemIcon><BlockIcon fontSize="small" /></ListItemIcon>
            {t("block")}
          </MenuItem>
        )}

        {hasReports && (
          <MenuItem onClick={run(() => dismissReports(listing.id))}>
            <ListItemIcon><DoneAllIcon fontSize="small" /></ListItemIcon>
            {t("dismiss")}
          </MenuItem>
        )}

        {status !== "removed" && (
          <MenuItem onClick={run(onRemove)} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "inherit" }}><DeleteOutlineIcon fontSize="small" /></ListItemIcon>
            {t("remove")}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
