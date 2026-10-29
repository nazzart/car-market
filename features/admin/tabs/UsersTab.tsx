"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import BlockIcon from "@mui/icons-material/Block";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReplayIcon from "@mui/icons-material/Replay";
import VerifiedIcon from "@mui/icons-material/Verified";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";

import Card from "@/components/ui/Card";
import { IconButton } from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { dealerAccount, ownerOf, userAccount } from "@/features/moderation/accounts";
import { setDealerVerified, unblockAccount, useBlockedAccounts, useReports } from "@/features/moderation/store";
import { useDealerVerified } from "@/features/moderation/visibility";
import { Link } from "@/i18n/navigation";
import { cn, initials } from "@/lib/utils";

import { pillClass, useAdminData, useModerationDialog } from "../shared";

// Реестр предприятий Латвии — модератор сверяет название и рег. номер дилера
const REGISTER_URL = "https://info.ur.gov.lv/";

type Account = {
  key: string; // «dealer:baltic-auto» / «user:<uuid>»
  name: string;
  kind: "dealer" | "individual";
  contact: string;
  regNumber?: string;
  dealerSlug?: string;
};

// Зарегистрированные продавцы: частные пользователи + дилеры (демо-дилер = дилер Baltic Auto)
function useAccounts(): Account[] {
  const { users, dealers } = useAdminData();
  return [
    ...users
      .filter((u) => u.type === "individual" && u.role !== "admin")
      .map((u) => ({ key: userAccount(u.id), name: u.name, kind: "individual" as const, contact: `${u.email} · ${u.phone}` })),
    ...dealers.map((d) => ({
      key: dealerAccount(d.slug),
      name: d.name,
      kind: "dealer" as const,
      contact: d.phone,
      regNumber: d.regNumber,
      dealerSlug: d.slug,
    })),
  ];
}

type Filter = "all" | "dealers" | "individuals" | "unverified" | "blocked";

export default function UsersTab({ onShowListings }: { onShowListings: (query: string) => void }) {
  const t = useTranslations("moderation.admin.users");
  const tReasons = useTranslations("moderation.reasons");
  const accounts = useAccounts();
  const { listings } = useAdminData();
  const blocked = useBlockedAccounts();
  const reports = useReports();
  const isVerified = useDealerVerified();
  const { dialog, blockAccount } = useModerationDialog();
  const [filter, setFilter] = useState<Filter>("all");

  const listingsOf = (key: string) => listings.filter((l) => ownerOf(l) === key);
  const reportsOf = (key: string) => {
    const ids = new Set(listingsOf(key).map((l) => l.id));
    return reports.filter((r) => ids.has(r.listingId) && !r.resolved).length;
  };

  const filters: Filter[] = ["all", "dealers", "individuals", "unverified", "blocked"];
  const shown = accounts.filter((a) => {
    switch (filter) {
      case "dealers":
        return a.kind === "dealer";
      case "individuals":
        return a.kind === "individual";
      case "unverified":
        return a.kind === "dealer" && !isVerified(a.dealerSlug!);
      case "blocked":
        return Boolean(blocked[a.key]);
      default:
        return true;
    }
  });

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
        {filters.map((f) => (
          <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={pillClass(filter === f)}>
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>

      {filter === "unverified" && <p className="text-sm text-gray-500 mb-3">{t("verifyHint")}</p>}

      {shown.length === 0 ? (
        <EmptyState text={t("empty")} />
      ) : (
        <Card as="ul" padding="none" className="divide-y divide-gray-100 overflow-hidden">
          {shown.map((a) => {
            const block = blocked[a.key];
            const verified = a.kind === "dealer" && isVerified(a.dealerSlug!);
            const count = listingsOf(a.key).length;
            const reportsCount = reportsOf(a.key);

            return (
              <li key={a.key} className={cn("flex items-center gap-3 sm:gap-4 p-3", block && "bg-danger-soft/40")}>
                <span
                  className={cn(
                    "w-11 h-11 shrink-0 flex items-center justify-center bg-gray-900 text-white text-sm font-bold",
                    a.kind === "dealer" ? "rounded-xl" : "rounded-full"
                  )}
                >
                  {initials(a.name)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-gray-900">{a.name}</span>
                    {verified && <VerifiedIcon sx={{ fontSize: 16 }} className="text-info-accent" titleAccess={t("verified")} />}
                    <Badge tone="muted">{t(`kind.${a.kind}`)}</Badge>
                    {a.kind === "dealer" && !verified && <Badge tone="warning">{t("unverified")}</Badge>}
                    {block && <Badge tone="danger">{t("blocked")}</Badge>}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {a.contact}
                    {a.regNumber && ` · ${t("regNumber", { value: a.regNumber })}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t("listings", { count })}
                    {reportsCount > 0 && <span className="text-danger"> · {t("reports", { count: reportsCount })}</span>}
                    {block && <span className="text-danger"> · {tReasons(block.reason)}</span>}
                  </div>
                </div>

                <AccountMenu
                  account={a}
                  verified={verified}
                  blocked={Boolean(block)}
                  onBlock={() => blockAccount(a.key, a.name)}
                  onShowListings={() => onShowListings(a.name)}
                />
              </li>
            );
          })}
        </Card>
      )}

      {dialog}
    </div>
  );
}

function AccountMenu({
  account,
  verified,
  blocked,
  onBlock,
  onShowListings,
}: {
  account: Account;
  verified: boolean;
  blocked: boolean;
  onBlock: () => void;
  onShowListings: () => void;
}) {
  const t = useTranslations("moderation.admin.users");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
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
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 240, mt: 0.5 } } }}
      >
        <MenuItem onClick={run(onShowListings)}>
          <ListItemIcon><ListAltOutlinedIcon fontSize="small" /></ListItemIcon>
          {t("showListings")}
        </MenuItem>

        {account.dealerSlug && (
          <MenuItem component={Link} href={`/dealers/${account.dealerSlug}`} target="_blank" onClick={close}>
            <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
            {t("dealerPage")}
          </MenuItem>
        )}

        {account.regNumber && [
          <MenuItem key="copy" onClick={run(() => navigator.clipboard?.writeText(account.regNumber!))}>
            <ListItemIcon><ContentCopyOutlinedIcon fontSize="small" /></ListItemIcon>
            {t("copyReg")}
          </MenuItem>,
          <MenuItem key="register" component="a" href={REGISTER_URL} target="_blank" rel="noopener noreferrer" onClick={close}>
            <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
            {t("openRegister")}
          </MenuItem>,
        ]}

        {account.dealerSlug && (
          <MenuItem onClick={run(() => setDealerVerified(account.dealerSlug!, !verified))}>
            <ListItemIcon><VerifiedOutlinedIcon fontSize="small" /></ListItemIcon>
            {verified ? t("unverify") : t("verify")}
          </MenuItem>
        )}

        {blocked ? (
          <MenuItem onClick={run(() => unblockAccount(account.key))}>
            <ListItemIcon><ReplayIcon fontSize="small" /></ListItemIcon>
            {t("unblock")}
          </MenuItem>
        ) : (
          <MenuItem onClick={run(onBlock)} sx={{ color: "error.main" }}>
            <ListItemIcon sx={{ color: "inherit" }}><BlockIcon fontSize="small" /></ListItemIcon>
            {t("block")}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
