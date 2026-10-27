"use client";

import { useState } from "react";
import { Alert, Button, IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { DEMO_PASSWORD, User, demoUsers, findDemoUser } from "../data/demoUsers";
import { login } from "../store";
import { AuthHeader, TextLinkButton, isEmail, pillSx } from "../ui";

type Props = {
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  onLoggedIn: () => void;
};

const demoButtons = [
  { type: "individual", label: "Частное лицо", icon: PersonOutlineIcon },
  { type: "dealer", label: "Дилер", icon: StorefrontOutlinedIcon },
] as const;

export default function LoginView({ onForgotPassword, onCreateAccount, onLoggedIn }: Props) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (!isEmail(email) || !password) return;

    // TODO: настоящая авторизация (Auth.js / Supabase). Пока принимаем только демо-аккаунты
    const user = findDemoUser(email, password);

    if (!user) {
      setError("Неверный email или пароль");
      return;
    }

    signIn(user);
  };

  return (
    <>
      <AuthHeader title="Вход" subtitle="Размещайте объявления и сохраняйте избранное" />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError && "Введите корректный email"}
        />

        <TextField
          label="Пароль"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          helperText={passwordError && "Введите пароль"}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
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
            Забыли пароль?
          </button>
        </div>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <Button type="submit" variant="contained" size="large" fullWidth sx={pillSx}>
          Войти
        </Button>
      </form>

      {/* Демо-доступ — пока нет настоящих аккаунтов */}

      <div className="mt-6 p-4 rounded-2xl bg-gray-50">
        <div className="text-sm font-semibold text-gray-900">Демо-доступ</div>
        <p className="text-xs text-gray-500 mt-0.5">
          Войдите в один клик или используйте {demoUsers[0].email} / {DEMO_PASSWORD}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3">
          {demoButtons.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => signIn(demoUsers.find((u) => u.type === type)!)}
              className="inline-flex items-center justify-center gap-1.5 h-10 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-900 hover:border-gray-900 transition cursor-pointer"
            >
              <Icon sx={{ fontSize: 18 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center mt-6">
        Нет аккаунта? <TextLinkButton onClick={onCreateAccount}>Зарегистрироваться</TextLinkButton>
      </p>
    </>
  );
}
