"use client";

import { useState } from "react";
import { Dialog, MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import { useTranslations } from "next-intl";

import type { DealerContact } from "@/features/dealers/types";
import { isPhone } from "@/lib/phone";

/* ---------- Форма одного контакта (и в настройках, и в форме продажи) ---------- */

type FormProps = {
  initial?: DealerContact;
  onSave: (contact: DealerContact) => void;
  onCancel: () => void;
};

export function ContactForm({ initial, onSave, onCancel }: FormProps) {
  const t = useTranslations("account.settings.contacts.persons");
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [submitted, setSubmitted] = useState(false);

  const errors = { name: !name.trim(), phone: !isPhone(phone) };

  const save = () => {
    setSubmitted(true);
    if (errors.name || errors.phone) return;
    onSave({
      id: initial?.id ?? `c-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      role: role.trim() || undefined,
    });
  };

  return (
    <div className="p-4 rounded-2xl bg-gray-50 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <TextField
          label={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={submitted && errors.name}
          required
          fullWidth
          size="small"
          sx={{ bgcolor: "white" }}
        />
        <TextField
          label={t("phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={submitted && errors.phone}
          helperText={submitted && errors.phone ? t("phoneError") : undefined}
          placeholder="+371 2000 0000"
          inputMode="tel"
          required
          fullWidth
          size="small"
          sx={{ bgcolor: "white" }}
        />
        <TextField
          label={t("role")}
          placeholder={t("rolePlaceholder")}
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          size="small"
          sx={{ bgcolor: "white" }}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-full border border-gray-200 bg-white hover:border-gray-900 text-sm font-medium transition cursor-pointer"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={save}
          className="h-9 px-4 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
        >
          {initial ? t("saveEdit") : t("add")}
        </button>
      </div>
    </div>
  );
}

/* ---------- Список контактов в настройках дилера ---------- */

type Props = {
  contacts: DealerContact[];
  companyPhone: string;
  onChange: (contacts: DealerContact[]) => void;
  // сколько объявлений закреплено за контактом — чтобы при удалении спросить, кому их передать
  usage: (contactId: string) => number;
  onReassign: (fromId: string, toId: string) => void;
};

export default function ContactsEditor({ contacts, companyPhone, onChange, usage, onReassign }: Props) {
  const t = useTranslations("account.settings.contacts.persons");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [removing, setRemoving] = useState<DealerContact | null>(null);
  const [target, setTarget] = useState("company");

  const remove = (contact: DealerContact) => {
    if (usage(contact.id) > 0) {
      setTarget("company");
      setRemoving(contact);
    } else {
      onChange(contacts.filter((c) => c.id !== contact.id));
    }
  };

  const confirmRemove = () => {
    if (!removing) return;
    onReassign(removing.id, target);
    onChange(contacts.filter((c) => c.id !== removing.id));
    setRemoving(null);
  };

  return (
    <div className="space-y-3">
      {/* основной телефон компании — всегда есть, редактируется выше в «Контактах» */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200">
        <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          <PhoneOutlinedIcon fontSize="small" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-gray-900">{t("company")}</div>
          <div className="text-sm text-gray-500">{companyPhone}</div>
        </div>
        <span className="text-xs text-gray-500">{t("default")}</span>
      </div>

      {contacts.map((c) =>
        editing === c.id ? (
          <ContactForm
            key={c.id}
            initial={c}
            onCancel={() => setEditing(null)}
            onSave={(updated) => {
              onChange(contacts.map((x) => (x.id === c.id ? updated : x)));
              setEditing(null);
            }}
          />
        ) : (
          <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200">
            <span className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-900 text-white text-sm font-semibold">
              {c.name.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-gray-900 truncate">
                {c.name}
                {c.role && <span className="font-normal text-gray-500"> · {c.role}</span>}
              </div>
              <div className="text-sm text-gray-500">
                {c.phone} · {t("listings", { count: usage(c.id) })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setEditing(c.id)}
              aria-label={t("edit")}
              title={t("edit")}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition cursor-pointer"
            >
              <EditOutlinedIcon fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => remove(c)}
              aria-label={t("remove")}
              title={t("remove")}
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-600 hover:text-red-700 transition cursor-pointer"
            >
              <DeleteOutlineIcon fontSize="small" />
            </button>
          </div>
        )
      )}

      {editing === "new" ? (
        <ContactForm
          onCancel={() => setEditing(null)}
          onSave={(contact) => {
            onChange([...contacts, contact]);
            setEditing(null);
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="w-full inline-flex items-center justify-center gap-1.5 h-11 rounded-2xl border border-dashed border-gray-300 hover:border-gray-900 text-sm font-medium text-gray-900 transition cursor-pointer"
        >
          <AddIcon fontSize="small" />
          {t("addPerson")}
        </button>
      )}

      {/* удаление контакта, за которым закреплены объявления */}
      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        slotProps={{ paper: { sx: { borderRadius: 4, m: 2, width: "100%", maxWidth: 440 } } }}
      >
        {removing && (
          <div className="p-6">
            <h2 className="text-lg font-semibold">{t("removeTitle", { name: removing.name })}</h2>
            <p className="text-sm text-gray-600 mt-1">{t("removeText", { count: usage(removing.id) })}</p>

            <TextField select label={t("reassignTo")} value={target} onChange={(e) => setTarget(e.target.value)} fullWidth sx={{ mt: 3 }}>
              <MenuItem value="company">
                {t("company")} · {companyPhone}
              </MenuItem>
              {contacts
                .filter((c) => c.id !== removing.id)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} · {c.phone}
                  </MenuItem>
                ))}
            </TextField>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setRemoving(null)}
                className="h-11 px-5 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium transition cursor-pointer"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={confirmRemove}
                className="h-11 px-5 rounded-full bg-error hover:opacity-90 text-white text-sm font-semibold transition cursor-pointer"
              >
                {t("removeConfirm")}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
