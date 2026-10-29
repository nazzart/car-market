"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Alert, Button, IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { isEmail } from "@/lib/validate";

import { signIn } from "../actions";
import { useAuth } from "../store";
import { AuthHeader, pillSx } from "../ui";

type Props = {
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onLoggedIn: () => void;
};

export default function LoginView({ onForgotPassword, onCreateAccount, onLoggedIn }: Props) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const { setUser } = useAuth();

  const emailError = submitted && !isEmail(email);
  const passwordError = submitted && !password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (!isEmail(email) || !password) return;

    setSending(true);
    const result = await signIn(email, password).catch(() => ({ error: "failed" as const }));
    setSending(false);

    if ("error" in result) {
      setError(result.error === "invalid" ? t("login.wrong") : t(`errors.${result.error}`));
      return;
    }

    setUser(result.user);
    onLoggedIn();
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

        <Button type="submit" variant="contained" size="large" fullWidth disabled={sending} sx={pillSx}>
          {t("login.submit")}
        </Button>
      </form>

      {/* Регистрация — отдельной заметной кнопкой, а не ссылкой внизу */}
      <div className="flex items-center gap-3 my-5 text-sm text-gray-500">
        <span className="h-px flex-1 bg-gray-200" />
        {t("login.newHere")}
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <Button variant="outlined" size="large" fullWidth onClick={onCreateAccount} sx={{ ...pillSx, borderColor: "grey.300", color: "grey.900", "&:hover": { borderColor: "grey.900", bgcolor: "transparent" } }}>
        {t("login.createAccount")}
      </Button>
    </>
  );
}
