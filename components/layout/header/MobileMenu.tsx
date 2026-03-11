"use client";

import { useState } from "react";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <div className="w-64 p-6 flex flex-col gap-6">
          <Link href="/" className="font-bold text-lg">
            auto.ru
          </Link>

          <nav className="flex flex-col gap-4 text-gray-700">
            <a className="hover:text-black">Легковые</a>

            <a className="hover:text-black">Дилеры</a>

            <a className="hover:text-black">Коммерческие</a>
          </nav>
        </div>
      </Drawer>
    </>
  );
}
