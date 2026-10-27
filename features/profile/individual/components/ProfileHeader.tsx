import { useTranslations } from "next-intl";

import { ProfileMode } from "../../types/profile";

export default function ProfileHeader({ mode }: { mode: ProfileMode }) {
  const t = useTranslations("account.profilePage");
  const isEdit = mode === "edit";
  return (
    <header>
      <h1 className="text-[28px] font-semibold tracking-tight">
        {isEdit ? t("editTitle") : t("createTitle")}
      </h1>

      <p className="text-gray-500 mt-2">
        {t("subtitle")}
      </p>
    </header>
  );
}
