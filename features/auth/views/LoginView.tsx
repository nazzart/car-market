"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button, IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { DEMO_PASSWORD, demoAccounts, signInWithPassword } from "../api";
import type { User } from "../types";
import { login } from "../store";
import { AuthHeader, TextLinkButton, isEmail, pillSx } from "../ui";

type Props = {
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onLoggedIn: () => void;
};

const demoButtons = [
  { id: "demo-individual", label: "types.individual", icon: PersonOutlineIcon },
  { id: "demo-dealer", label: "types.dealer", icon: StorefrontOutlinedIcon },
  { id: "demo-admin", label: "login.demoAdmin", icon: AdminPanelSettingsOutlinedIcon },
] as const;

export default function LoginView({ onForgotPassword, onCreateAccount, onLoggedIn }: Props) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const emailError = submitted && !isEmail(email);
  const passwordError = submitted && !password;

  const signIn = (user: User) => {
    login(user);
    onLoggedIn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (!isEmail(email) || !password) return;

    const user = await signInWithPassword(email, password);

    if (!user) {
      setError(t("login.wrong"));
      return;
    }

    signIn(user);
  };

  return (
    <>
      <AuthHeader title={t("login.title")} subtitle={t("login.subtitle")} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          autoFocus
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError && t("invalidEmail")}
        />

        <TextField
          label={t("passwordLabel")}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          helperText={passwordError && t("enterPassword")}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />

        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-gray-600 hover:text-black hover:underline underline-offset-4 cursor-pointer"
          >
            {t("login.forgot")}
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <Button type="submit" variant="contained" size="large" fullWidth sx={pillSx}>
          {t("login.submit")}
        </Button>
      </form>

      {/* Демо-доступ — пока нет настоящих аккаунтов */}

      <div className="mt-6 p-4 rounded-2xl bg-gray-50">
        <div className="text-sm font-semibold text-gray-900">{t("login.demoTitle")}</div>
        <p className="text-xs text-gray-500 mt-0.5">
          {t("login.demoText", { email: demoAccounts[0].email, password: DEMO_PASSWORD })}
        </p>

        <div className="grid grid-cols-3 gap-2 mt-3">
          {demoButtons.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => signIn(demoAccounts.find((u) => u.id === id)!)}
              className="inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 min-h-10 py-1.5 px-2 rounded-2xl sm:rounded-full border border-gray-200 bg-white text-xs sm:text-sm font-medium text-gray-900 hover:border-gray-900 transition cursor-pointer"
            >
              <Icon sx={{ fontSize: 18 }} />
              {t(label)}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center mt-6">
        {t("login.noAccount")}{" "}
        <TextLinkButton onClick={onCreateAccount}>{t("login.register")}</TextLinkButton>
      </p>
    </>
  );
}
