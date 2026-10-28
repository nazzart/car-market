"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  MenuItem,
  Snackbar,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useTranslations } from "next-intl";

import { AccountType } from "@/features/auth/types/authView";
import { User } from "@/features/auth/data/demoUsers";
import { login, useAuth } from "@/features/auth/store";
import { isEmail } from "@/features/auth/ui";
import { brands } from "@/features/brands/data/brands";
import { ChipGroup } from "@/features/cars/car-list/components/ui";
import { Dealer, OpeningHours, dealers } from "@/features/dealers/data/dealers";
import { listings } from "@/features/cars/data/listings";
import { assignContact, useContactAssignments } from "@/features/dealers/contacts";
import { Link } from "@/i18n/navigation";
import { CITY_KEYS, cityNameLv } from "@/lib/cities";
import { isPhone } from "@/lib/phone";

import { LoggedOut } from "../AccountView";
import AddressField from "./AddressField";
import { AddressResult, parseAddress, reverseGeocode } from "./geocoding";
import ContactsEditor from "./ContactsEditor";
import HoursEditor, { hoursInvalid } from "./HoursEditor";
import SettingsCard from "./SettingsCard";

// Leaflet работает только в браузере
const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse" />,
});


const isRegNumber = (value: string) => /^\d{11}$/.test(value.replace(/\s/g, ""));
// Адрес хранится на латышском: кириллица — признак, что его ввели по-русски
const hasCyrillic = (value: string) => /[Ѐ-ӿ]/.test(value);

/* ---------- Общая логика формы ---------- */

function useSettingsForm<T>(initialValues: T) {
  const [saved, setSaved] = useState(initialValues);
  const [form, setForm] = useState(initialValues);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof T>(key: K) => (value: T[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return {
    form,
    set,
    submitted,
    setSubmitted,
    dirty: JSON.stringify(form) !== JSON.stringify(saved),
    discard: () => {
      setForm(saved);
      setSubmitted(false);
    },
    markSaved: () => {
      setSaved(form);
      setSubmitted(false);
    },
  };
}

function SaveBar({
  visible,
  onDiscard,
  onSave,
}: {
  visible: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("account.settings.saveBar");

  return (
    <div
      className={`
        fixed bottom-4 inset-x-4 z-40 mx-auto max-w-xl
        flex items-center justify-between gap-3
        pl-5 pr-2 py-2
        rounded-2xl bg-gray-900 text-white shadow-2xl
        transition duration-200
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
      `}
    >
      <span className="text-sm">{t("unsaved")}</span>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={onDiscard}
          className="h-10 px-4 rounded-full text-sm text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          {t("discard")}
        </button>
        <button
          type="button"
          onClick={onSave}
          className="h-10 px-5 rounded-full bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition cursor-pointer"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}

function SavedToast({ state, onClose }: { state: "saved" | "error" | null; onClose: () => void }) {
  const t = useTranslations("account.settings.saveBar");

  return (
    <Snackbar
      open={Boolean(state)}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={state === "error" ? "error" : "success"}
        variant="filled"
        onClose={onClose}
        sx={{ borderRadius: "14px" }}
      >
        {state === "error" ? (
          t("fixErrors")
        ) : (
          <>
            <div className="font-medium">{t("saved")}</div>
            <div className="text-xs opacity-90">{t("demoNote")}</div>
          </>
        )}
      </Alert>
    </Snackbar>
  );
}

function PageHeader({ type }: { type: AccountType | "dealer" }) {
  const t = useTranslations("account.settings");
  const isDealer = type === "dealer";

  return (
    <div className="mb-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition"
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} />
        {t("back")}
      </Link>

      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-3">
        {isDealer ? t("titleDealer") : t("title")}
      </h1>
      <p className="text-gray-500 mt-1">{isDealer ? t("subtitleDealer") : t("subtitle")}</p>
    </div>
  );
}

function CitySelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const t = useTranslations("account.settings.location");
  const tOptions = useTranslations("options");

  return (
    <TextField select label={t("city")} value={value} onChange={(e) => onChange(e.target.value)} fullWidth>
      {CITY_KEYS.map((key) => (
        <MenuItem key={key} value={key}>
          {tOptions(`cities.${key}`)}
        </MenuItem>
      ))}
    </TextField>
  );
}

function PasswordCard() {
  const t = useTranslations("account.settings.password");
  const tAuth = useTranslations("auth");

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const strong = next.length >= 8 && /\d/.test(next) && /\p{L}/u.test(next);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setDone(false);
    if (!current || !strong) return;

    // TODO: смена пароля через API
    setCurrent("");
    setNext("");
    setSubmitted(false);
    setDone(true);
  };

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <form onSubmit={handleSubmit} noValidate className="grid sm:grid-cols-2 gap-4">
        <TextField
          label={t("current")}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={submitted && !current}
          helperText={submitted && !current && t("currentRequired")}
          fullWidth
        />
        <TextField
          label={t("next")}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={submitted && !strong}
          helperText={submitted && !strong ? t("weak") : tAuth("register.rules.length")}
          fullWidth
        />

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="outlined" sx={{ borderRadius: "999px", px: 3 }}>
            {t("change")}
          </Button>
          {done && <span className="text-sm text-emerald-700">{t("changed")}</span>}
        </div>
      </form>
    </SettingsCard>
  );
}

/* ---------- Частное лицо ---------- */

function IndividualSettings({ user }: { user: User }) {
  const t = useTranslations("account.settings");
  const [toast, setToast] = useState<"saved" | "error" | null>(null);

  const [firstName, ...rest] = user.name.split(" ");

  const { form, set, dirty, discard, markSaved, submitted, setSubmitted } = useSettingsForm({
    firstName,
    lastName: rest.join(" "),
    email: user.email,
    phone: user.phone,
    city: user.city,
  });

  const errors = {
    firstName: !form.firstName.trim(),
    email: !isEmail(form.email),
    phone: !isPhone(form.phone),
  };
  const show = (key: keyof typeof errors) => submitted && errors[key];

  const save = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return setToast("error");

    login({
      ...user,
      name: [form.firstName.trim(), form.lastName.trim()].filter(Boolean).join(" "),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city,
    });
    markSaved();
    setToast("saved");
  };

  return (
    <>
      <PageHeader type="individual" />

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

        <SettingsCard title={t("contacts.title")} description={t("contacts.description")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label={t("contacts.email")}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              error={show("email")}
              helperText={show("email") && t("contacts.emailError")}
              required
              fullWidth
            />
            <TextField
              label={t("contacts.phone")}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              error={show("phone")}
              helperText={show("phone") && t("contacts.phoneError")}
              required
              fullWidth
            />
          </div>
        </SettingsCard>

        <SettingsCard title={t("location.title")} description={t("location.country")}>
          <div className="sm:w-1/2 sm:pr-2">
            <CitySelect value={form.city} onChange={set("city")} />
          </div>
        </SettingsCard>

        <PasswordCard />
      </div>

      <SaveBar visible={dirty} onDiscard={discard} onSave={save} />
      <SavedToast state={toast} onClose={() => setToast(null)} />
    </>
  );
}

/* ---------- Дилер ---------- */

function DealerSettings({ user }: { user: User }) {
  const t = useTranslations("account.settings");
  const [toast, setToast] = useState<"saved" | "error" | null>(null);

  // данные из каталога дилеров + то, что дилер уже поменял в настройках
  const base = dealers.find((d) => d.slug === user.dealerSlug) as Dealer;
  const dealer = { ...base, ...user.dealerProfile };

  const { form, set, dirty, discard, markSaved, submitted, setSubmitted } = useSettingsForm({
    name: user.name,
    regNumber: dealer.regNumber ?? "",
    type: dealer.type,
    brands: dealer.brands,
    description: dealer.description ?? "",
    email: user.email,
    phone: user.phone,
    // одно поле «улица, город» — как в подсказках геокодера
    address: `${dealer.address}, ${cityNameLv(dealer.city)}`,
    lat: dealer.lat,
    lng: dealer.lng,
    hours: dealer.hours as OpeningHours,
    contacts: dealer.contacts ?? [],
    // «контакт → кому передать его объявления» — применяется при сохранении
    reassign: {} as Record<string, string>,
  });

  // объявления дилера и кто за ними закреплён сейчас
  const assignments = useContactAssignments();
  const dealerListings = listings.filter((l) => l.dealer === user.dealerSlug);
  const contactOf = (listingId: string, fallback?: string) => assignments[listingId] ?? fallback;
  const contactUsage = (contactId: string) =>
    dealerListings.filter((l) => contactOf(l.id, l.contactId) === contactId).length;

  const parsedAddress = parseAddress(form.address);

  const errors = {
    name: !form.name.trim(),
    regNumber: !isRegNumber(form.regNumber),
    email: !isEmail(form.email),
    phone: !isPhone(form.phone),
    address: !parsedAddress || hasCyrillic(form.address),
    hours: hoursInvalid(form.hours),
  };
  const show = (key: keyof typeof errors) => submitted && errors[key];

  const brandOptions = [...brands].sort((a, b) => a.name.localeCompare(b.name));

  /* Адрес ↔ карта */

  const [mapFocus, setMapFocus] = useState(0);
  const [pinAddress, setPinAddress] = useState<AddressResult | null>(null);
  const reverseRequest = useRef<AbortController>(undefined);

  const applyAddress = (result: AddressResult) => {
    set("address")(result.label);
    setPinAddress(null);
  };

  // выбрали подсказку — подставляем адрес, город и переносим метку
  const selectAddress = (result: AddressResult) => {
    reverseRequest.current?.abort();
    applyAddress(result);
    set("lat")(result.lat);
    set("lng")(result.lng);
    setMapFocus((n) => n + 1);
  };

  // передвинули метку — ищем адрес этой точки; пустое поле заполняем сразу, иначе предлагаем
  const movePin = async (lat: number, lng: number) => {
    set("lat")(lat);
    set("lng")(lng);

    reverseRequest.current?.abort();
    const controller = new AbortController();
    reverseRequest.current = controller;

    try {
      const result = await reverseGeocode(lat, lng, controller.signal);
      if (controller.signal.aborted) return;
      if (result && !form.address.trim()) applyAddress(result);
      else setPinAddress(result);
    } catch {
      if (!controller.signal.aborted) setPinAddress(null);
    }
  };

  const save = () => {
    setSubmitted(true);
    if (Object.values(errors).some(Boolean)) return setToast("error");

    // TODO: сохранение профиля дилера через API (страница дилера пока читает dealers.ts)
    login({
      ...user,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: parsedAddress!.city,
      dealerProfile: {
        type: form.type,
        brands: form.type === "official" ? form.brands : [],
        regNumber: form.regNumber.replace(/\s/g, ""),
        description: form.description.trim(),
        address: parsedAddress!.street,
        city: parsedAddress!.city,
        lat: form.lat,
        lng: form.lng,
        hours: form.hours,
        contacts: form.contacts,
      },
    });
    // объявления удалённых контактов — тому, кого выбрал дилер
    for (const [fromId, toId] of Object.entries(form.reassign)) {
      const ids = dealerListings.filter((l) => contactOf(l.id, l.contactId) === fromId).map((l) => l.id);
      if (ids.length) assignContact(ids, toId);
    }
    set("reassign")({});

    markSaved();
    setToast("saved");
  };

  return (
    <>
      <PageHeader type="dealer" />

      <div className="space-y-6">
        {/* Company */}

        <SettingsCard title={t("company.title")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label={t("company.name")}
              autoComplete="organization"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              error={show("name")}
              helperText={show("name") && t("personal.required")}
              required
              fullWidth
            />
            <TextField
              label={t("company.regNumber")}
              inputMode="numeric"
              value={form.regNumber}
              onChange={(e) => set("regNumber")(e.target.value)}
              error={show("regNumber")}
              helperText={show("regNumber") ? t("company.regNumberError") : t("company.regNumberHint")}
              required
              fullWidth
            />

            <div className="sm:col-span-2">
              <div className="text-sm font-medium text-gray-900 mb-2">{t("company.type")}</div>
              <ChipGroup
                options={[
                  { value: "official", label: t("company.official") },
                  { value: "used", label: t("company.used") },
                ]}
                value={form.type}
                onChange={(value) => value && set("type")(value as Dealer["type"])}
              />
            </div>

            {form.type === "official" && (
              <Autocomplete
                multiple
                className="sm:col-span-2"
                options={brandOptions.map((b) => b.slug)}
                getOptionLabel={(slug) => brands.find((b) => b.slug === slug)?.name ?? slug}
                value={form.brands}
                onChange={(_, value) => set("brands")(value)}
                renderValue={(value, getItemProps) =>
                  value.map((slug, index) => {
                    const { key, ...itemProps } = getItemProps({ index });
                    return (
                      <Chip
                        key={key}
                        label={brands.find((b) => b.slug === slug)?.name ?? slug}
                        size="small"
                        {...itemProps}
                      />
                    );
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label={t("company.brands")} helperText={t("company.brandsHint")} />
                )}
              />
            )}

            <TextField
              className="sm:col-span-2"
              label={t("company.description")}
              helperText={t("company.descriptionHint")}
              value={form.description}
              onChange={(e) => set("description")(e.target.value)}
              multiline
              minRows={3}
              fullWidth
            />
          </div>
        </SettingsCard>

        {/* Contacts */}

        <SettingsCard title={t("contacts.title")} description={t("contacts.description")}>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label={t("contacts.email")}
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              error={show("email")}
              helperText={show("email") && t("contacts.emailError")}
              required
              fullWidth
            />
            <TextField
              label={t("contacts.phone")}
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              error={show("phone")}
              helperText={show("phone") && t("contacts.phoneError")}
              required
              fullWidth
            />
          </div>
        </SettingsCard>

        {/* Address */}

        <SettingsCard title={t("address.title")} description={t("address.description")}>
          <AddressField
            label={t("address.street")}
            placeholder={t("address.streetPlaceholder")}
            value={form.address}
            onChange={set("address")}
            onSelect={selectAddress}
            near={{ lat: form.lat, lng: form.lng }}
            error={show("address") || hasCyrillic(form.address)}
            helperText={
              hasCyrillic(form.address)
                ? t("address.streetError")
                : show("address")
                  ? form.address.trim() ? t("address.format") : t("address.required")
                  : t("address.searchHint")
            }
          />

          <div className="relative isolate h-72 mt-4 rounded-2xl overflow-hidden border border-gray-200">
            <LocationPicker lat={form.lat} lng={form.lng} onChange={movePin} focus={mapFocus} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("address.mapHint")} · {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
          </p>

          {/* Адрес по точке на карте — предлагаем, но не перезаписываем введённый вручную */}
          {pinAddress && pinAddress.label !== form.address && (
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
              <PlaceOutlinedIcon className="text-gray-400" sx={{ fontSize: 20 }} />
              <span className="text-gray-500">{t("address.pinAddress")}</span>
              <span className="font-medium text-gray-900">{pinAddress.label}</span>
              <Button size="small" variant="outlined" onClick={() => applyAddress(pinAddress)} className="sm:ml-auto">
                {t("address.useAddress")}
              </Button>
            </div>
          )}
        </SettingsCard>

        {/* Contact persons */}

        <SettingsCard title={t("contacts.persons.title")} description={t("contacts.persons.description")}>
          <ContactsEditor
            contacts={form.contacts}
            companyPhone={form.phone}
            onChange={set("contacts")}
            usage={contactUsage}
            onReassign={(fromId, toId) => set("reassign")({ ...form.reassign, [fromId]: toId })}
          />
        </SettingsCard>

        {/* Hours */}

        <SettingsCard title={t("hours.title")} description={t("hours.description")}>
          <HoursEditor value={form.hours} onChange={set("hours")} />
        </SettingsCard>

        <PasswordCard />
      </div>

      <SaveBar
        visible={dirty}
        onDiscard={() => {
          discard();
          setPinAddress(null);
        }}
        onSave={save}
      />
      <SavedToast state={toast} onClose={() => setToast(null)} />
    </>
  );
}

export default function SettingsView() {
  const t = useTranslations("account.settings");
  const { user } = useAuth();

  if (!user) return <LoggedOut title={t("title")} />;

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-28">
      {user.type === "dealer" ? (
        <DealerSettings key={user.id} user={user} />
      ) : (
        <IndividualSettings key={user.id} user={user} />
      )}
    </div>
  );
}
