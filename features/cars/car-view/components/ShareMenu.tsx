"use client";

import { useState } from "react";
import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";
import CheckIcon from "@mui/icons-material/Check";
import LinkIcon from "@mui/icons-material/Link";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import FacebookIcon from "@mui/icons-material/Facebook";
import { useTranslations } from "next-intl";

import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

type ShareMenuProps = {
  title: string; // «BMW M4 Coupe, 2018 — 47 500 €»
  className: string;
};

// «Поделиться»: мессенджеры, ссылка и системное меню телефона (если есть)
export default function ShareMenu({ title, className }: ShareMenuProps) {
  const t = useTranslations("listing.actions");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const { copied, copy: copyText } = useCopyToClipboard();

  const url = () => window.location.href;

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setAnchor(null);
  };

  const targets = [
    { key: "whatsapp", icon: WhatsAppIcon, color: "#25D366", href: () => `https://wa.me/?text=${encodeURIComponent(`${title} ${url()}`)}` },
    {
      key: "telegram",
      icon: TelegramIcon,
      color: "#229ED9",
      href: () => `https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(title)}`,
    },
    { key: "facebook", icon: FacebookIcon, color: "#1877F2", href: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url())}` },
  ];

  const copy = () => {
    copyText(url());
    setAnchor(null);
  };

  const nativeShare = async () => {
    setAnchor(null);
    try {
      await navigator.share({ title, url: url() });
    } catch {
      // пользователь закрыл окно «Поделиться»
    }
  };

  return (
    <>
      <button type="button" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="menu" className={className}>
        {copied ? <CheckIcon fontSize="small" className="text-success-accent" /> : <IosShareIcon fontSize="small" />}
        {copied ? t("copied") : t("share")}
      </button>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 220, mt: 0.5 } } }}
      >
        {targets.map(({ key, icon: Icon, color, href }) => (
          <MenuItem key={key} onClick={() => open(href())}>
            <ListItemIcon>
              <Icon fontSize="small" sx={{ color }} />
            </ListItemIcon>
            {t(`shareTo.${key}`)}
          </MenuItem>
        ))}

        <MenuItem onClick={copy}>
          <ListItemIcon>
            <LinkIcon fontSize="small" />
          </ListItemIcon>
          {t("shareTo.copy")}
        </MenuItem>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <MenuItem onClick={nativeShare}>
            <ListItemIcon>
              <MoreHorizIcon fontSize="small" />
            </ListItemIcon>
            {t("shareTo.more")}
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
