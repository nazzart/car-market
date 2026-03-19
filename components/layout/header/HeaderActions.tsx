"use client";

import { useState } from "react";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AddIcon from "@mui/icons-material/Add";

import { IconButton, Button } from "@mui/material";

import UserMenu from "./UserMenu";
import AuthModal from "@/features/auth/components/AuthModal";

export default function HeaderActions() {
  const [authOpen, setAuthOpen] = useState(false);

  const isLoggedIn = false; // replace with real auth

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        <IconButton>
          <FavoriteBorderIcon className="text-gray-600" />
        </IconButton>

        <IconButton>
          <NotificationsNoneIcon className="text-gray-600" />
        </IconButton>

        <UserMenu
          isLoggedIn={isLoggedIn}
          onLoginClick={() => setAuthOpen(true)}
        />

        <div className="hidden sm:block">
          <Button
            variant="contained"
            color="success"
            href="/sell"
            startIcon={<AddIcon fontSize="small" />}
          >
            Разместить
          </Button>
        </div>

        <div className="sm:hidden">
          <IconButton
            href="/sell"
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
