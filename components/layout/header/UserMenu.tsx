"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";

import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";

import { User } from "@/features/auth/data/demoUsers";
import { logout } from "@/features/auth/store";
import { initials } from "@/lib/utils";

type Props = {
  user: User | null;
  onLoginClick: () => void;
};

export default function UserMenu({ user, onLoginClick }: Props) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const close = () => setAnchorEl(null);

  if (!user) {
    return (
      <button
        type="button"
        onClick={onLoginClick}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-black cursor-pointer"
      >
        <PersonOutlineIcon fontSize="small" />
        Войти
      </button>
    );
  }

  const isDealer = user.type === "dealer";

  const items = [
    { href: "/account", label: "Личный кабинет", icon: DashboardOutlinedIcon },
    { href: "/sell", label: "Разместить объявление", icon: AddIcon },
    ...(isDealer && user.dealerSlug
      ? [{ href: `/dealers/${user.dealerSlug}`, label: "Страница дилера", icon: StorefrontOutlinedIcon }]
      : []),
    { href: "/account/profile", label: "Настройки профиля", icon: ManageAccountsOutlinedIcon },
  ];

  return (
    <>
      <button
        type="button"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Меню аккаунта"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        className={`w-9 h-9 flex items-center justify-center text-white text-xs font-bold bg-gray-900 hover:ring-4 hover:ring-gray-200 transition cursor-pointer ${
          isDealer ? "rounded-xl" : "rounded-full"
        }`}
      >
        {initials(user.name)}
      </button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: "16px",
              minWidth: 240,
              boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              p: "6px",
            },
          },
        }}
      >
        <div className="px-3 pt-2 pb-3">
          <div className="font-semibold text-gray-900">{user.name}</div>
          <div className="text-xs text-gray-500">
            {isDealer ? "Дилер" : "Частное лицо"} · {user.email}
          </div>
        </div>

        <Divider sx={{ mb: 0.5 }} />

        {items.map(({ href, label, icon: Icon }) => (
          <MenuItem key={href} component={Link} href={href} onClick={close} sx={{ borderRadius: "10px" }}>
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
          </MenuItem>
        ))}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            close();
            logout();
            router.push("/");
          }}
          sx={{ borderRadius: "10px", color: "#dc2626" }}
        >
          <ListItemIcon sx={{ color: "#dc2626" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Выйти</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
