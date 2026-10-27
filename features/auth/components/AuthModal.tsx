"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, useMediaQuery, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import LoginView from "../views/LoginView";
import ForgotPasswordView from "../views/ForgotPasswordView";
import AccountTypeView from "../views/AccountTypeView";
import RegisterView from "../views/RegisterView";
import RegisterSuccessView from "../views/RegisterSuccessView";
import { AccountType, AuthView } from "../types/authView";

type Props = {
  open: boolean;
  onClose: () => void;
  initialView?: AuthView;
};

// Куда ведёт кнопка «Назад» с каждого шага
const backTo: Partial<Record<AuthView, AuthView>> = {
  forgotPassword: "login",
  accountType: "login",
  register: "accountType",
};

const iconButtonClass =
  "w-10 h-10 flex items-center justify-center rounded-full text-gray-700 hover:bg-gray-100 transition cursor-pointer";

// MUI Dialog: фокус внутри окна, блокировка прокрутки, Esc; на телефоне — на весь экран
export default function AuthModal({ open, onClose, initialView = "login" }: Props) {
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [view, setView] = useState<AuthView>(initialView);
  const [accountType, setAccountType] = useState<AccountType | undefined>();
  const [registeredEmail, setRegisteredEmail] = useState("");

  const back = backTo[view];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      aria-label="Вход и регистрация"
      slotProps={{
        paper: {
          sx: {
            width: "100%",
            maxWidth: fullScreen ? "none" : 440,
            borderRadius: fullScreen ? 0 : "24px",
            m: fullScreen ? 0 : 2,
          },
        },
        // сбрасываем шаги, когда окно закрылось (а не в момент закрытия — без «мигания»)
        transition: {
          onExited: () => {
            setView(initialView);
            setAccountType(undefined);
          },
        },
      }}
    >
      <div className="relative px-6 pb-8 pt-16 sm:px-8">
        {/* Top bar */}

        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          {back ? (
            <button type="button" onClick={() => setView(back)} aria-label="Назад" className={iconButtonClass}>
              <ArrowBackIcon fontSize="small" />
            </button>
          ) : (
            <span />
          )}

          <button type="button" onClick={onClose} aria-label="Закрыть" className={iconButtonClass}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Steps */}

        {view === "login" && (
          <LoginView
            onForgotPassword={() => setView("forgotPassword")}
            onCreateAccount={() => setView("accountType")}
            onLoggedIn={() => {
              onClose();
              router.push("/account");
            }}
          />
        )}

        {view === "forgotPassword" && <ForgotPasswordView onBack={() => setView("login")} />}

        {view === "accountType" && (
          <AccountTypeView
            initial={accountType}
            onLogin={() => setView("login")}
            onSelect={(type) => {
              setAccountType(type);
              setView("register");
            }}
          />
        )}

        {view === "register" && (
          <RegisterView
            accountType={accountType ?? "individual"}
            onChangeType={() => setView("accountType")}
            onLogin={() => setView("login")}
            onRegistered={(email) => {
              setRegisteredEmail(email);
              setView("registerSuccess");
            }}
          />
        )}

        {view === "registerSuccess" && (
          <RegisterSuccessView email={registeredEmail} onClose={onClose} />
        )}
      </div>
    </Dialog>
  );
}
