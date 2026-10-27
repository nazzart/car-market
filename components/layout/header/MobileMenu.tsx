"use client";

import { useState } from "react";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)} aria-label={t("openMenu")}>
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div className="w-64 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link href="/" onClick={() => setOpen(false)} className="font-bold text-lg text-primary">
              bestauto.lv
            </Link>

            <LocaleSwitcher />
          </div>

          <nav className="flex flex-col gap-4 text-gray-700">
            <Link href="/cars" onClick={() => setOpen(false)} className="hover:text-black">
              {t("cars")}
            </Link>

            <Link href="/dealers" onClick={() => setOpen(false)} className="hover:text-black">
              {t("dealers")}
            </Link>
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
