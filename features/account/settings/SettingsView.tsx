"use client";

import { useTranslations } from "next-intl";

import { useAuth } from "@/features/auth/store";

import LoggedOut from "../LoggedOut";
import DealerSettings from "./DealerSettings";
import IndividualSettings from "./IndividualSettings";

// /account/profile: настройки частного лица или компании
export default function SettingsView() {
  const t = useTranslations("account.settings");
  const { user } = useAuth();

  if (!user) return <LoggedOut title={t("title")} />;

  return (
    <div className="max-w-3xl mx-auto pt-8 pb-28">
      {user.type === "dealer" ? <DealerSettings key={user.id} user={user} /> : <IndividualSettings key={user.id} user={user} />}
    </div>
  );
}
