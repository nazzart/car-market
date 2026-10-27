"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckIcon from "@mui/icons-material/Check";

import { AccountType } from "../types/authView";
import { AuthHeader, TextLinkButton, pillSx } from "../ui";

type Props = {
  initial?: AccountType;
  onSelect: (type: AccountType) => void;
  onLogin: () => void;
};

const options = [
  {
    value: "individual" as const,
    title: "Частное лицо",
    description: "Продаю свой автомобиль",
    icon: PersonOutlineIcon,
  },
  {
    value: "company" as const,
    title: "Компания",
    description: "Автосалон, дилер или другой бизнес",
    icon: StorefrontOutlinedIcon,
  },
];

export default function AccountTypeView({ initial, onSelect, onLogin }: Props) {
  const [selected, setSelected] = useState<AccountType | null>(initial ?? null);

  return (
    <>
      <AuthHeader title="Регистрация" subtitle="Кто будет размещать объявления?" />

      <div role="radiogroup" aria-label="Тип аккаунта" className="flex flex-col gap-3 mb-6">
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
                rounded-2xl
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
                <span className="block font-semibold text-gray-900">{title}</span>
                <span className="block text-sm text-gray-500">{description}</span>
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

      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        sx={pillSx}
      >
        Продолжить
      </Button>

      <p className="text-sm text-gray-600 text-center mt-6">
        Уже есть аккаунт? <TextLinkButton onClick={onLogin}>Войти</TextLinkButton>
      </p>
    </>
  );
}
