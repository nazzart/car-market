"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckIcon from "@mui/icons-material/Check";

import Button from "@/components/ui/Button";

import { AccountType } from "../types/authView";
import { AuthHeader, TextLinkButton } from "../ui";

type Props = {
  initial?: AccountType;
  onSelect: (type: AccountType) => void;
  onLogin: () => void;
};

const options = [
  {
    value: "individual" as const,
    title: "individual",
    description: "individualDesc",
    icon: PersonOutlineIcon,
  },
  {
    value: "company" as const,
    title: "company",
    description: "companyDesc",
    icon: StorefrontOutlinedIcon,
  },
];

export default function AccountTypeView({ initial, onSelect, onLogin }: Props) {
  const t = useTranslations("auth");
  const [selected, setSelected] = useState<AccountType | null>(initial ?? null);

  return (
    <>
      <AuthHeader title={t("accountType.title")} subtitle={t("accountType.subtitle")} />

      <div role="radiogroup" aria-label={t("accountType.aria")} className="flex flex-col gap-3 mb-6">
        {options.map(({ value, title, description, icon: Icon }) => {
          const active = selected === value;

          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setSelected(value)}
              className={`
                flex items-center gap-4
                p-4
                rounded-card
                border
                text-left
                transition
                cursor-pointer
                ${
                  active
                    ? "border-gray-900 ring-1 ring-gray-900 bg-gray-50"
                    : "border-gray-200 hover:border-gray-400"
                }
              `}
            >
              <span
                className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl transition ${
                  active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                <Icon fontSize="small" />
              </span>

              <span className="flex-1 min-w-0">
                <span className="block font-semibold text-gray-900">{t(`types.${title}`)}</span>
                <span className="block text-sm text-gray-500">{t(`types.${description}`)}</span>
              </span>

              <span
                className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full border-2 transition ${
                  active ? "bg-gray-900 border-gray-900 text-white" : "border-gray-300"
                }`}
              >
                {active && <CheckIcon sx={{ fontSize: 14 }} />}
              </span>
            </button>
          );
        })}
      </div>

      <Button size="lg" fullWidth disabled={!selected} onClick={() => selected && onSelect(selected)}>
        {t("accountType.continue")}
      </Button>

      <p className="text-sm text-gray-600 text-center mt-6">
        {t("accountType.haveAccount")}{" "}
        <TextLinkButton onClick={onLogin}>{t("accountType.login")}</TextLinkButton>
      </p>
    </>
  );
}
