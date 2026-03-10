"use client";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Button from "@mui/material/Button";
import { useState } from "react";
import LoginModal from "@/features/auth/components/LoginModal";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-[1280px] mx-auto h-16 flex items-center justify-between">
        {/* logo */}
        <div className="font-bold text-primary">auto.ru</div>

        {/* navigation */}
        <nav className="flex items-center gap-8 text-sm text-gray-700">
          <a className="text-primary font-medium">Легковые</a>
          <a className="hover:text-black">Дилеры</a>
          <a className="hover:text-black">Коммерческие</a>
        </nav>

        {/* right side */}
        <div className="flex items-center gap-4">
          <FavoriteBorderIcon className="text-gray-600 cursor-pointer hover:text-black" />

          <NotificationsNoneIcon className="text-gray-600 cursor-pointer hover:text-black" />

          <button
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-black"
            onClick={() => setOpen(true)}
          >
            <PersonOutlineIcon fontSize="small" />
            Войти
          </button>

          <LoginModal open={open} onClose={() => setOpen(false)} />

          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon fontSize="small" />}
          >
            Разместить авто
          </Button>
        </div>
      </div>
    </header>
  );
}
