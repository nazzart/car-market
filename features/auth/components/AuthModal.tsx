"use client";

import { useState, useEffect } from "react";
import { Paper } from "@mui/material";

import LoginView from "../views/LoginView";
import ForgotPasswordView from "../views/ForgotPasswordView";
import AccountTypeView from "../views/AccountTypeView";
import { AuthView } from "../types/authView";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AuthModal({ open, onClose }: Props) {
  const [view, setView] = useState<AuthView>("login");

  // reset view when modal opens
  useEffect(() => {
    if (open) setView("login");
  }, [open]);

  // ESC close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      <Paper
        elevation={10}
        className="relative w-full max-w-[440px] rounded-3xl p-10 shadow-xl animate-[modalIn_.18s_ease-out]"
      >
        {view === "login" && (
          <LoginView
            onForgotPassword={() => setView("forgotPassword")}
            onCreateAccount={() => setView("accountType")}
          />
        )}

        {view === "forgotPassword" && (
          <ForgotPasswordView onBack={() => setView("login")} />
        )}

        {view === "accountType" && (
          <AccountTypeView
            onSelect={(type) => {
              console.log("Selected:", type);
            }}
          />
        )}
      </Paper>
    </section>
  );
}
