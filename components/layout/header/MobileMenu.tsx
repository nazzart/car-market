"use client";

import { useState } from "react";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DirectionsCarOutlinedIcon from "@mui/icons-material/DirectionsCarOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import {
  collectionHref,
  visibleCollections,
} from "@/features/collections/data/collections";

import LocaleSwitcher from "./LocaleSwitcher";

export default function MobileMenu() {
  const t = useTranslations("nav");
  const tOptions = useTranslations("options");
  const tCompare = useTranslations("compare");
  const [open, setOpen] = useState(false);

  const mainLinks = [
    { href: "/cars", label: t("cars"), icon: DirectionsCarOutlinedIcon },
    { href: "/dealers", label: t("dealers"), icon: StorefrontOutlinedIcon },
    { href: "/favorites", label: t("favorites"), icon: FavoriteBorderIcon },
    { href: "/compare", label: tCompare("title"), icon: CompareArrowsIcon },
    { href: "/account", label: t("footer.account"), icon: PersonOutlineIcon },
  ];

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label={t("openMenu")}>
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div className="w-72 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)} className="font-bold text-lg text-primary">
              bestauto.lv
            </Link>

            <LocaleSwitcher />
          </div>

          <Link
            href="/sell"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 h-11 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition"
          >
            <AddIcon fontSize="small" />
            {t("postListing")}
          </Link>

          <nav className="flex flex-col gap-1 -mx-2 text-gray-800">
            {mainLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-2 py-2.5 rounded-lg font-medium hover:bg-gray-50 hover:text-black"
              >
                <Icon fontSize="small" className="text-gray-500" />
                {label}
              </Link>
            ))}
          </nav>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              {t("collections")}
            </div>

            <nav className="flex flex-col gap-1 -mx-2">
              {visibleCollections.map((c) => {
                const Icon = c.icon;

                return (
                  <Link
                    key={c.slug}
                    href={collectionHref(c.slug)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-black"
                  >
                    <Icon fontSize="small" className="text-gray-500" />
                    {tOptions(`collections.${c.slug}.label`)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </Drawer>
    </>
  );
}
