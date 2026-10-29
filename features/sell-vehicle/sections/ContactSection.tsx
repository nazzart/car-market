"use client";

import { useEffect, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { ContactForm } from "@/features/account/settings/ContactsEditor";
import { addContact, completeProfile, saveCompanyPhone } from "@/features/account/actions";
import { openAuthModal, useAuth } from "@/features/auth/store";
import { useDealerContacts } from "@/features/dealers/contacts";
import { useOwnDealer } from "@/features/dealers/useOwnDealer";
import { Link } from "@/i18n/navigation";
import PlacePicker from "@/components/ui/PlacePicker";
import { usePlaceName } from "@/lib/places";
import { isPhone } from "@/lib/phone";

import { SectionContainer } from "../components/SectionContainer";
import { useSectionNext } from "../hooks/useSectionNext";
import { useSectionValidation } from "../hooks/useSectionValidation";
import { FormStepProps } from "../types";
import { validateField } from "../utils/validationRules";

// Контакты берутся из аккаунта — повторно вводить не нужно.
// Частное лицо может поменять телефон и место авто для этого объявления,
// дилер выбирает, кто отвечает на звонки (компания или менеджер)
export function ContactInfoSection({ id, title, data, required, fields, onNext, updateField }: FormStepProps) {
  const t = useTranslations("sell.contact");
  const placeName = usePlaceName();
  const { user, setUser } = useAuth();
  const { isValid } = useSectionValidation(fields, data);
  const { attemptedNext, handleNext } = useSectionNext(isValid, required, onNext);
  const [custom, setCustom] = useState(false); // частное лицо: «изменить для этого объявления»
  const [adding, setAdding] = useState(false); // дилер: новый контакт прямо из формы

  const isDealer = user?.type === "dealer";
  const dealerCity = useOwnDealer()?.city ?? "";
  const { contacts, phone: companyPhone } = useDealerContacts(user?.dealerSlug);
  const selectedContact = contacts.find((c) => c.id === data.contactId);
  // нет ни телефона компании, ни менеджеров — телефон нужно ввести (и он сохранится в профиль)
  const needsCompanyPhone = isDealer && !companyPhone;

  // данные аккаунта → в поля формы (пока продавец не изменил их для этого объявления)
  useEffect(() => {
    if (!user) {
      updateField("account", "");
      return;
    }
    updateField("account", user.id);
    if (isDealer) {
      updateField("sellerCity", dealerCity);
      if (!needsCompanyPhone || selectedContact) updateField("sellerPhone", selectedContact?.phone ?? companyPhone);
    } else if (!custom) {
      updateField("sellerPhone", user.phone);
      updateField("sellerCity", user.city ?? "");
    }
    // updateField стабилен по смыслу; синхронизируем при смене аккаунта, контакта или режима
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isDealer, custom, dealerCity, companyPhone, selectedContact?.phone]);

  // в профиле ещё нет телефона или места (первое объявление) — поля сразу открыты, введённое сохранится в профиль
  const missingProfile = !isDealer && Boolean(user) && (!user?.phone || !user?.city);
  const saveToProfile = (input: { phone?: string; city?: string }) => {
    if (missingProfile) completeProfile(input).then((next) => next && setUser(next), () => {});
  };

  const getRules = (name: string) => fields.find((f) => f.name === name)?.rules;
  const phoneError = attemptedNext && !validateField(data.sellerPhone, getRules("sellerPhone"));

  return (
    <SectionContainer id={id} title={title} required={required} isValid={isValid} onNext={handleNext}>
      {!user ? (
        /* Гость: публиковать можно только из аккаунта — так объявлением можно управлять */
        <div className="text-center py-6 px-4 rounded-card bg-gray-50">
          <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-white shadow-sm">
            <LockOutlinedIcon className="text-gray-700" />
          </span>
          <h3 className="font-semibold mt-3">{t("loginTitle")}</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{t("loginText")}</p>
          <Button variant="dark" onClick={openAuthModal} className="mt-4 px-6">
            {t("login")}
          </Button>
          {attemptedNext && <p className="text-sm text-error mt-3">{t("loginRequired")}</p>}
        </div>
      ) : isDealer ? (
        /* Дилер: компания и место — из профиля; на звонки отвечает компания или выбранный менеджер */
        <div className="space-y-4">
          <SummaryRow
            icon={<StorefrontOutlinedIcon fontSize="small" />}
            title={user.name}
            text={`${placeName(dealerCity)} · ${t("fromCompany")}`}
          />

          {needsCompanyPhone && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">{t("noCompanyPhone")}</p>
              <TextField
                label={t("companyPhone")}
                value={data.sellerPhone}
                onChange={(e) => updateField("sellerPhone", e.target.value)}
                onBlur={() => {
                  // сохраняем в профиль, чтобы в следующий раз не вводить
                  if (isPhone(data.sellerPhone)) saveCompanyPhone(data.sellerPhone.trim());
                }}
                error={phoneError}
                helperText={phoneError ? t("phoneError") : t("savedToProfile")}
                placeholder="+371 2000 0000"
                inputMode="tel"
                required
                fullWidth
              />
            </div>
          )}

          {!needsCompanyPhone && (
            <TextField
              select
              label={t("whoAnswers")}
              value={data.contactId || "company"}
              onChange={(e) => updateField("contactId", e.target.value === "company" ? "" : e.target.value)}
              fullWidth
            >
              <MenuItem value="company">
                {t("companyPhone")} · {companyPhone}
              </MenuItem>
              {contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                  {c.role && ` (${c.role})`} · {c.phone}
                </MenuItem>
              ))}
            </TextField>
          )}

          {adding ? (
            <ContactForm
              onCancel={() => setAdding(false)}
              onSave={async (contact) => {
                // сохраняем в профиль дилера сразу — контакт пригодится и для других объявлений
                const id = await addContact(contact).catch(() => null);
                if (id) updateField("contactId", id);
                setAdding(false);
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-primary transition cursor-pointer"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              {t("addContact")}
            </button>
          )}
        </div>
      ) : (
        /* Частное лицо: контакты из профиля, при необходимости — другие для этого объявления */
        <div className="space-y-4">
          <SummaryRow
            icon={<PersonOutlineIcon fontSize="small" />}
            title={user.name}
            text={t("fromAccount")}
            action={
              <Link href="/account/profile" target="_blank" className="text-sm text-gray-600 hover:text-black underline underline-offset-4">
                {t("editProfile")}
              </Link>
            }
          />

          {missingProfile && <p className="text-sm text-gray-600">{t("completeProfile")}</p>}

          {!custom && !missingProfile ? (
            <div className="grid sm:grid-cols-2 gap-3">
              <SummaryRow icon={<PhoneOutlinedIcon fontSize="small" />} title={data.sellerPhone} text={t("phone")} />
              <SummaryRow
                icon={<PlaceOutlinedIcon fontSize="small" />}
                title={data.sellerCity ? placeName(data.sellerCity) : "—"}
                text={t("carLocation")}
              />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                label={t("phone")}
                value={data.sellerPhone}
                onChange={(e) => updateField("sellerPhone", e.target.value)}
                onBlur={() => isPhone(data.sellerPhone) && saveToProfile({ phone: data.sellerPhone.trim() })}
                error={phoneError}
                helperText={phoneError ? t("phoneError") : undefined}
                placeholder="+371 2000 0000"
                inputMode="tel"
                required
                fullWidth
              />
              <PlacePicker
                label={t("carLocation")}
                value={data.sellerCity}
                onChange={(key) => {
                  updateField("sellerCity", key);
                  if (key) saveToProfile({ city: key });
                }}
                required
              />
            </div>
          )}

          {!missingProfile && (
            <button
              type="button"
              onClick={() => setCustom(!custom)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-primary transition cursor-pointer"
            >
              <EditOutlinedIcon sx={{ fontSize: 18 }} />
              {custom ? t("useAccount") : t("changeForListing")}
            </button>
          )}
        </div>
      )}
    </SectionContainer>
  );
}

type SummaryRowProps = {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
};

function SummaryRow({
  icon,
  title,
  text,
  action,
}: SummaryRowProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-card bg-gray-50">
      <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white text-gray-600">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-gray-900 truncate">{title}</div>
        <div className="text-xs text-gray-500">{text}</div>
      </div>
      {action}
    </div>
  );
}
