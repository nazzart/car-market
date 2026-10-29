"use client";

import { useEffect, useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AddIcon from "@mui/icons-material/Add";

import { Badge, IconButton } from "@mui/material";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";

import LocaleSwitcher from "./LocaleSwitcher";
import UserMenu from "./UserMenu";
import AuthModal from "@/features/auth/components/AuthModal";
import { onOpenAuthModal, useAuth } from "@/features/auth/store";
import { useFavorites } from "@/features/favorites/store";

export default function HeaderActions() {
  const t = useTranslations("nav");
  const [authOpen, setAuthOpen] = useState(false);

  const { user } = useAuth();
  const { count: favoritesCount } = useFavorites();

  // окно входа можно открыть с любой страницы через openAuthModal()
  useEffect(() => onOpenAuthModal(() => setAuthOpen(true)), []);

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        <LocaleSwitcher className="hidden lg:inline-flex mr-1" />

        <IconButton component={Link} href="/favorites" aria-label={t("favorites")}>
          <Badge
            badgeContent={favoritesCount}
            max={99}
            sx={{ "& .MuiBadge-badge": { bgcolor: "var(--color-primary)", color: "white", fontWeight: 600 } }}
          >
            <FavoriteBorderIcon className="text-gray-600" />
          </Badge>
        </IconButton>

        {/* Колокольчик вернётся вместе с уведомлениями (снижение цены, новые по сохранённому поиску) */}

        <UserMenu user={user} onLoginClick={() => setAuthOpen(true)} />

        <div className="hidden sm:block">
          <Button size="sm" href="/sell" icon={<AddIcon fontSize="small" />}>
            {t("post")}
          </Button>
        </div>

        <div className="sm:hidden">
          <Button
            href="/sell"
            aria-label={t("postListing")}
            className="w-11 px-0 shadow-lg shadow-primary/35 hover:scale-105"
          >
            <AddIcon />
          </Button>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
