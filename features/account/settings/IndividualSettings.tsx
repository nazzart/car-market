"use client";

import { TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import PlacePicker from "@/components/ui/PlacePicker";
import { saveProfile } from "@/features/account/actions";
import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import { isPhone } from "@/lib/phone";
import { isEmail } from "@/lib/validate";

import ContactDetailsCard from "./ContactDetailsCard";
import DeleteAccountCard from "./DeleteAccountCard";
import PasswordCard from "./PasswordCard";
import { SaveBar } from "./SaveBar";
import SettingsCard from "./SettingsCard";
import SettingsHeader from "./SettingsHeader";
import { useSettingsForm } from "./useSettingsForm";

type IndividualSettingsProps = { user: User };

// Настройки частного лица: имя, контакты, город, пароль, удаление аккаунта
export default function IndividualSettings({ user }: IndividualSettingsProps) {
  const t = useTranslations("account.settings");
  const { setUser } = useAuth();

  const [firstName, ...rest] = user.name.split(" ");
  const { form, set, show, dirty, discard, save } = useSettingsForm(
    { firstName, lastName: rest.join(" "), email: user.email, phone: user.phone, city: user.city ?? "" },
    (f) => ({ firstName: !f.firstName.trim(), email: !isEmail(f.email), phone: !isPhone(f.phone) })
  );

  const submit = () =>
    save(async () => {
      const result = await saveProfile({
        name: [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" "),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city,
      });
      if ("error" in result) return false;
      setUser(result.user);
      return true;
    });

  return (
    <>
      <SettingsHeader />

      <div className="space-y-6">
        <SettingsCard title={t("personal.title")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label={t("personal.firstName")}
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => set("firstName")(e.target.value)}
              error={show("firstName")}
              helperText={show("firstName") && t("personal.required")}
              required
              fullWidth
            />
            <TextField
              label={t("personal.lastName")}
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => set("lastName")(e.target.value)}
              fullWidth
            />
          </div>
        </SettingsCard>

        <ContactDetailsCard
          email={form.email}
          phone={form.phone}
          onEmailChange={set("email")}
          onPhoneChange={set("phone")}
          emailError={show("email")}
          phoneError={show("phone")}
        />

        <SettingsCard title={t("location.title")} description={t("location.country")}>
          <div className="sm:w-1/2 sm:pr-2">
            <PlacePicker label={t("location.city")} value={form.city} onChange={set("city")} />
          </div>
        </SettingsCard>

        <PasswordCard />
        <DeleteAccountCard isDealer={false} />
      </div>

      <SaveBar visible={dirty} onDiscard={discard} onSave={submit} />
    </>
  );
}
