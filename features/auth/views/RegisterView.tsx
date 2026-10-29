"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { isEmail, isRegNumber } from "@/lib/validate";
import { Alert, Checkbox, FormControlLabel, FormHelperText, IconButton, InputAdornment, TextField } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import CheckIcon from "@mui/icons-material/Check";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { signUp } from "../actions";
import { useAuth } from "../store";
import { AccountType } from "../types/authView";
import { AuthHeader, TextLinkButton } from "../ui";

type Props = {
  accountType: AccountType;
  onChangeType: () => void;
  onLogin: () => void;
  onRegistered: (email: string) => void; // нужно подтвердить email
  onLoggedIn: () => void; // аккаунт создан и пользователь сразу вошёл
};

const passwordRules = [
  { label: "length", test: (p: string) => p.length >= 8 },
  { label: "digit", test: (p: string) => /\d/.test(p) },
  { label: "letter", test: (p: string) => /\p{L}/u.test(p) },
];

// Регистрационный номер компании в Латвии — 11 цифр

export default function RegisterView({ accountType, onChangeType, onLogin, onRegistered, onLoggedIn }: Props) {
  const t = useTranslations("auth");
  const isCompany = accountType === "company";

  const [name, setName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useAuth();

  const passwordOk = passwordRules.every((r) => r.test(password));

  const errors = {
    name: !name.trim(),
    regNumber: isCompany && !isRegNumber(regNumber),
    email: !isEmail(email),
    password: !passwordOk,
    accepted: !accepted,
  };

  const show = (key: keyof typeof errors) => submitted && errors[key];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setError("");

    if (Object.values(errors).some(Boolean)) return;

    setSending(true);
    const result = await signUp({
      type: isCompany ? "dealer" : "individual",
      name,
      regNumber: isCompany ? regNumber : undefined,
      email,
      password,
    }).catch(() => ({ error: "failed" as const }));
    setSending(false);

    if ("error" in result) return setError(t(`errors.${result.error === "invalid" ? "failed" : result.error}`));
    if ("confirmEmail" in result) return onRegistered(email.trim());
    setUser(result.user);
    onLoggedIn();
  };

  return (
    <>
      <AuthHeader title={t("register.title")} />

      {/* Выбранный тип аккаунта */}

      <div className="flex items-center justify-between gap-3 mb-5 px-4 py-3 rounded-card bg-gray-50 text-sm">
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
                    ok ? "text-success" : show("password") ? "text-error" : "text-gray-500"
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

        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <Button type="submit"  size="lg" fullWidth disabled={sending}>
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
