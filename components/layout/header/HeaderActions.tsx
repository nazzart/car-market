"use client";

import { useEffect, useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";

import { Badge, IconButton, Button } from "@mui/material";
import { useTranslations } from "next-intl";

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

        <IconButton aria-label={t("notifications")}>
          <NotificationsNoneIcon className="text-gray-600" />
        </IconButton>

        <UserMenu user={user} onLoginClick={() => setAuthOpen(true)} />

        <div className="hidden sm:block">
          <Button
            variant="contained"
            color="success"
            component={Link}
            href="/sell"
            startIcon={<AddIcon fontSize="small" />}
          >
            {t("post")}
          </Button>
        </div>

        <div className="sm:hidden">
          <IconButton
            component={Link}
            href="/sell"
            aria-label={t("postListing")}
            sx={{
              width: 42,
              height: 42,
              background: "linear-gradient(135deg,#10b981,#059669)",
              color: "white",
              boxShadow: "0 8px 20px rgba(16,185,129,0.35)",
              transition: "all .2s ease",
              "&:hover": {
                background: "linear-gradient(135deg,#34d399,#10b981)",
                transform: "scale(1.05)",
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </div>
      </div>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
