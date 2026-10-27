"use client";

import { useState } from "react";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

import {
  collectionHref,
  visibleCollections,
} from "@/features/collections/data/collections";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div className="w-64 p-6 flex flex-col gap-6">
          <Link href="/" className="font-bold text-lg text-primary">
            bestauto.lv
          </Link>

          <nav className="flex flex-col gap-4 text-gray-700">
            <Link href="/cars" className="hover:text-black">
              Легковые
            </Link>

            <Link href="/dealers" onClick={() => setOpen(false)} className="hover:text-black">
              Дилеры
            </Link>

            <a className="hover:text-black">Коммерческие</a>
          </nav>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              Подборки
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
                    {c.label}
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
