"use client";

import { useState } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { AccountType } from "../types/authView";
import { AuthHeader, TextLinkButton, isEmail, pillSx } from "../ui";

type Props = {
  accountType: AccountType;
  onChangeType: () => void;
  onLogin: () => void;
  onRegistered: (email: string) => void;
};

const passwordRules = [
  { label: "Не менее 8 символов", test: (p: string) => p.length >= 8 },
  { label: "Хотя бы одна цифра", test: (p: string) => /\d/.test(p) },
  { label: "Хотя бы одна буква", test: (p: string) => /\p{L}/u.test(p) },
];

// Регистрационный номер компании в Латвии — 11 цифр
const isRegNumber = (value: string) => /^\d{11}$/.test(value.replace(/\s/g, ""));

export default function RegisterView({ accountType, onChangeType, onLogin, onRegistered }: Props) {
  const isCompany = accountType === "company";

  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const passwordOk = passwordRules.every((r) => r.test(password));

  const errors = {
    name: !name.trim(),
    regNumber: isCompany && !isRegNumber(regNumber),
    email: !isEmail(email),
    password: !passwordOk,
    accepted: !accepted,
  };

  const show = (key: keyof typeof errors) => submitted && errors[key];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.values(errors).some(Boolean)) return;

    // TODO: создание аккаунта через API и отправка письма с подтверждением
    onRegistered(email.trim());
  };

  return (
    <>
      <AuthHeader title="Регистрация" />

      {/* Выбранный тип аккаунта */}

      <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-2xl bg-gray-50 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-900">
          {isCompany ? (
            <StorefrontOutlinedIcon fontSize="small" />
          ) : (
            <PersonOutlineIcon fontSize="small" />
          )}
          {isCompany ? "Компания" : "Частное лицо"}
        </span>

        <TextLinkButton onClick={onChangeType}>Изменить</TextLinkButton>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={isCompany ? "Название компании" : "Имя"}
          autoComplete={isCompany ? "organization" : "given-name"}
          autoFocus
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={show("name")}
          helperText={show("name") && (isCompany ? "Укажите название компании" : "Укажите имя")}
        />

        {isCompany && (
          <TextField
            label="Регистрационный номер"
            inputMode="numeric"
            fullWidth
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            error={show("regNumber")}
            helperText={show("regNumber") ? "Номер состоит из 11 цифр" : "11 цифр, как в Регистре предприятий"}
          />
        )}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={show("email")}
          helperText={show("email") && "Введите корректный email"}
        />

        <div>
          <TextField
            label="Пароль"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={show("password")}
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

          {/* Требования к паролю — отмечаются по мере ввода */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 px-1">
            {passwordRules.map((rule) => {
              const ok = rule.test(password);

              return (
                <li
                  key={rule.label}
                  className={`inline-flex items-center gap-1 text-xs transition ${
                    ok ? "text-emerald-700" : show("password") ? "text-error" : "text-gray-500"
                  }`}
                >
                  <CheckIcon sx={{ fontSize: 14 }} className={ok ? "" : "opacity-40"} />
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                size="small"
              />
            }
            label={
              <span className="text-sm text-gray-700">
                Я принимаю{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black">
                  правила сайта
                </a>{" "}
                и{" "}
                <a href="#" className="underline underline-offset-4 hover:text-black">
                  политику конфиденциальности
                </a>
              </span>
            }
            sx={{ alignItems: "flex-start", mr: 0, "& .MuiCheckbox-root": { pt: 0.25 } }}
          />

          {show("accepted") && (
            <FormHelperText error sx={{ ml: 4 }}>
              Необходимо принять правила
            </FormHelperText>
          )}
        </div>

        <Button type="submit" variant="contained" size="large" fullWidth sx={pillSx}>
          Создать аккаунт
        </Button>
      </form>

      <p className="text-sm text-gray-600 text-center mt-6">
        Уже есть аккаунт? <TextLinkButton onClick={onLogin}>Войти</TextLinkButton>
      </p>
    </>
  );
}
