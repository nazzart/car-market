"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
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
  { label: "length", test: (p: string) => p.length >= 8 },
  { label: "digit", test: (p: string) => /\d/.test(p) },
  { label: "letter", test: (p: string) => /\p{L}/u.test(p) },
];

// Регистрационный номер компании в Латвии — 11 цифр
const isRegNumber = (value: string) => /^\d{11}$/.test(value.replace(/\s/g, ""));

export default function RegisterView({ accountType, onChangeType, onLogin, onRegistered }: Props) {
  const t = useTranslations("auth");
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
      <AuthHeader title={t("register.title")} />

      {/* Выбранный тип аккаунта */}

      <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-2xl bg-gray-50 text-sm">
        <span className="inline-flex items-center gap-2 font-medium text-gray-900">
          {isCompany ? (
            <StorefrontOutlinedIcon fontSize="small" />
          ) : (
            <PersonOutlineIcon fontSize="small" />
          )}
          {isCompany ? t("types.company") : t("types.individual")}
        </span>

        <TextLinkButton onClick={onChangeType}>{t("register.change")}</TextLinkButton>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={isCompany ? t("register.companyName") : t("register.name")}
          autoComplete={isCompany ? "organization" : "given-name"}
          autoFocus
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={show("name")}
          helperText={show("name") && (isCompany ? t("register.companyRequired") : t("register.nameRequired"))}
        />

        {isCompany && (
          <TextField
            label={t("register.regNumber")}
            inputMode="numeric"
            fullWidth
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            error={show("regNumber")}
            helperText={show("regNumber") ? t("register.regNumberError") : t("register.regNumberHint")}
          />
        )}

        <TextField
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={show("email")}
          helperText={show("email") && t("invalidEmail")}
        />

        <div>
          <TextField
            label={t("passwordLabel")}
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
                  {t(`register.rules.${rule.label}`)}
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
                {t.rich("register.terms", {
                  rules: (chunks) => (
                    <Link href="/rules" target="_blank" className="underline underline-offset-4 hover:text-black">
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link href="/privacy" target="_blank" className="underline underline-offset-4 hover:text-black">
                      {chunks}
                    </Link>
                  ),
                })}
              </span>
            }
            sx={{ alignItems: "flex-start", mr: 0, "& .MuiCheckbox-root": { pt: 0.25 } }}
          />

          {show("accepted") && (
            <FormHelperText error sx={{ ml: 4 }}>
              {t("register.termsRequired")}
            </FormHelperText>
          )}
        </div>

        <Button type="submit" variant="contained" size="large" fullWidth sx={pillSx}>
          {t("register.submit")}
        </Button>
      </form>

      <p className="text-sm text-gray-600 text-center mt-6">
        {t("accountType.haveAccount")}{" "}
        <TextLinkButton onClick={onLogin}>{t("accountType.login")}</TextLinkButton>
      </p>
    </>
  );
}
