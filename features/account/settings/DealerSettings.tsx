"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Skeleton from "@/components/ui/Skeleton";
import { saveDealerProfile } from "@/features/account/actions";
import { useOwnListings } from "@/features/account/useOwnListings";
import { useAuth } from "@/features/auth/store";
import type { User } from "@/features/auth/types";
import type { Dealer } from "@/features/dealers/types";
import { useOwnDealerState } from "@/features/dealers/useOwnDealer";
import { isPhone } from "@/lib/phone";
import { placeNameLv } from "@/lib/places";
import { isEmail, isRegNumber, normalizeRegNumber } from "@/lib/validate";

import AddressCard, { hasCyrillic } from "./AddressCard";
import CompanyCard from "./CompanyCard";
import ContactDetailsCard from "./ContactDetailsCard";
import ContactsEditor from "./ContactsEditor";
import DeleteAccountCard from "./DeleteAccountCard";
import { parseAddress } from "./geocoding";
import HoursEditor, { hoursInvalid } from "./HoursEditor";
import PasswordCard from "./PasswordCard";
import { SaveBar } from "./SaveBar";
import SettingsCard from "./SettingsCard";
import SettingsHeader from "./SettingsHeader";
import { type SettingsForm, useSettingsForm } from "./useSettingsForm";

const initialForm = (user: User, dealer: Dealer) => ({
  name: user.name,
  regNumber: dealer.regNumber ?? "",
  type: dealer.type,
  brands: dealer.brands,
  description: dealer.description ?? "",
  email: user.email,
  phone: user.phone,
  // одно поле «улица, город» — как в подсказках геокодера
  address: dealer.address ? `${dealer.address}, ${placeNameLv(dealer.city)}` : "",
  lat: dealer.lat,
  lng: dealer.lng,
  hours: dealer.hours,
  contacts: dealer.contacts ?? [],
  // «контакт → кому передать его объявления» — применяется при сохранении
  reassign: {} as Record<string, string>,
});

type DealerForm = ReturnType<typeof initialForm>;

const validate = (f: DealerForm) => ({
  name: !f.name.trim(),
  regNumber: !isRegNumber(f.regNumber),
  email: !isEmail(f.email),
  phone: !isPhone(f.phone),
  address: !parseAddress(f.address) || hasCyrillic(f.address),
  hours: hoursInvalid(f.hours),
});

export type DealerSettingsForm = SettingsForm<DealerForm, keyof ReturnType<typeof validate>>;

// Форма заполняется один раз при открытии — поэтому ждём свежую страницу дилера из базы
export default function DealerSettings({ user }: { user: User }) {
  const { dealer, loading } = useOwnDealerState();
  if (loading || !dealer) return <SettingsSkeleton />;
  return <DealerSettingsForm user={user} dealer={dealer} />;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-8 w-48 rounded-lg" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-48 rounded-card" />
      ))}
    </div>
  );
}

function DealerSettingsForm({ user, dealer }: { user: User; dealer: Dealer }) {
  const t = useTranslations("account.settings");
  const { setUser } = useAuth();
  const settings = useSettingsForm(initialForm(user, dealer), validate);
  const { form, set, show, dirty, discard, save } = settings;
  // после «Отменить» карта и подсказка адреса начинают заново
  const [resets, setResets] = useState(0);

  // объявления дилера и кто за ними закреплён сейчас
  const dealerListings = useOwnListings().listings ?? [];
  const contactUsage = (contactId: string) => dealerListings.filter((l) => l.contactId === contactId).length;

  // страница дилера, контактные лица и передача объявлений удалённых контактов — одним запросом
  const submit = () =>
    save(
      async () => {
        const address = parseAddress(form.address)!;
        const result = await saveDealerProfile({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          type: form.type,
          brands: form.type === "official" ? form.brands : [],
          regNumber: normalizeRegNumber(form.regNumber),
          description: form.description.trim(),
          address: address.street,
          city: address.city,
          lat: form.lat,
          lng: form.lng,
          hours: form.hours,
          contacts: form.contacts,
          reassign: form.reassign,
        });
        if ("error" in result) return false;
        setUser(result.user);
        return true;
      },
      { reassign: {} }
    );

  return (
    <>
      <SettingsHeader dealer />

      <div className="space-y-6">
        <CompanyCard settings={settings} />

        <ContactDetailsCard
          email={form.email}
          phone={form.phone}
          onEmailChange={set("email")}
          onPhoneChange={set("phone")}
          emailError={show("email")}
          phoneError={show("phone")}
        />

        <AddressCard key={resets} settings={settings} />

        <SettingsCard title={t("contacts.persons.title")} description={t("contacts.persons.description")}>
          <ContactsEditor
            contacts={form.contacts}
            companyPhone={form.phone}
            onChange={set("contacts")}
            usage={contactUsage}
            onReassign={(fromId, toId) => set("reassign")({ ...form.reassign, [fromId]: toId })}
          />
        </SettingsCard>

        <SettingsCard title={t("hours.title")} description={t("hours.description")}>
          <HoursEditor value={form.hours} onChange={set("hours")} />
        </SettingsCard>

        <PasswordCard />
        <DeleteAccountCard isDealer />
      </div>

      <SaveBar
        visible={dirty}
        onDiscard={() => {
          discard();
          setResets((n) => n + 1);
        }}
        onSave={submit}
      />
    </>
  );
}
