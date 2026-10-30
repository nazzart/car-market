"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

import Badge from "@/components/ui/Badge";
import Button, { IconButton } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { inputClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/Toast";
import * as actions from "@/features/catalog/actions";
import type { AdminModel, CatalogResult } from "@/features/catalog/types";
import { cn } from "@/lib/utils";
import { useServerData } from "@/lib/useServerData";

// Каталог марок, моделей и версий: три колонки — марка → её модели → версии модели.
// Модель с объявлениями не удаляется, только скрывается; переименование модели меняет и её объявления
export default function CatalogTab() {
  const t = useTranslations("moderation.admin.catalog");
  const toast = useToast();

  // rev — после каждой правки перечитать (прежние данные видны, пока не придут новые)
  const [rev, setRev] = useState(0);
  const brands = useServerData(`admin-catalog:${rev}`, () => actions.loadAdminBrands(), { ttl: 0 });
  const [brand, setBrand] = useState<string | null>(null);
  const models = useServerData(brand ? `admin-catalog:${brand}:${rev}` : null, () => actions.loadAdminModels(brand!), {
    ttl: 0,
  });
  const [modelId, setModelId] = useState<number | null>(null);
  const model = models?.find((m) => m.id === modelId);
  const [brandQuery, setBrandQuery] = useState("");
  const [modelQuery, setModelQuery] = useState("");
  const [deleting, setDeleting] = useState<AdminModel | null>(null);

  const run = async (request: Promise<CatalogResult>) => {
    const result = await request;
    if (result.ok) setRev((v) => v + 1);
    else toast({ message: t(`errors.${result.error}`), tone: "error" });
    return result.ok;
  };

  const shownBrands = (brands ?? []).filter((b) => b.name.toLowerCase().includes(brandQuery.trim().toLowerCase()));
  const shownModels = (models ?? []).filter((m) => m.name.toLowerCase().includes(modelQuery.trim().toLowerCase()));
  const brandName = brands?.find((b) => b.slug === brand)?.name;

  return (
    <div className="grid lg:grid-cols-3 gap-4 items-start">
      {/* Марки */}
      <Column
        title={t("brands")}
        count={brands?.length}
        query={brandQuery}
        onQuery={setBrandQuery}
        addLabel={t("addBrand")}
        onAdd={(name) => run(actions.addBrand(name, false))}
      >
        {shownBrands.map((b) => (
          <Row
            key={b.slug}
            name={b.name}
            meta={`${t("modelsCount", { count: b.models })} · ${t("listingsCount", { count: b.listings })}`}
            selected={brand === b.slug}
            hidden={b.hidden}
            onSelect={() => {
              setBrand(b.slug);
              setModelId(null);
              setModelQuery("");
            }}
            onRename={(name) => run(actions.updateBrand(b.slug, { name }))}
          >
            <IconButton
              label={b.popular ? t("unpopular") : t("makePopular")}
              onClick={() => run(actions.updateBrand(b.slug, { popular: !b.popular }))}
              className={b.popular ? "text-warning-accent" : "text-gray-400"}
            >
              {b.popular ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
            <HideButton hidden={b.hidden} onToggle={() => run(actions.updateBrand(b.slug, { hidden: !b.hidden }))} />
          </Row>
        ))}
      </Column>

      {/* Модели марки */}
      {brand ? (
        <Column
          title={`${t("models")} · ${brandName ?? ""}`}
          count={models?.length}
          query={modelQuery}
          onQuery={setModelQuery}
          addLabel={t("addModel")}
          hint={t("renameHint")}
          onAdd={(name) => run(actions.addModel(brand, name))}
        >
          {shownModels.map((m) => (
            <Row
              key={m.id}
              name={m.name}
              meta={`${t("versionsCount", { count: m.versions.length })} · ${t("listingsCount", { count: m.listings })}`}
              selected={modelId === m.id}
              hidden={m.hidden}
              onSelect={() => setModelId(m.id)}
              onRename={(name) => run(actions.updateModel(m.id, { name }))}
            >
              <HideButton hidden={m.hidden} onToggle={() => run(actions.updateModel(m.id, { hidden: !m.hidden }))} />
              <IconButton
                label={m.listings > 0 ? t("errors.inUse") : t("delete")}
                onClick={() => setDeleting(m)}
                disabled={m.listings > 0}
                className="text-gray-400 hover:text-danger disabled:opacity-30"
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Row>
          ))}
        </Column>
      ) : (
        <Placeholder text={t("pickBrand")} />
      )}

      {/* Версии модели */}
      {model ? (
        <Card padding="none" className="overflow-hidden">
          <ColumnHeader title={`${t("versions")} · ${model.name}`} count={model.versions.length} />
          <div className="p-4">
            {model.versions.length === 0 ? (
              <p className="text-sm text-gray-500">{t("noVersions")}</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {model.versions.map((v) => (
                  <li key={v.id} className="inline-flex items-center gap-1 h-8 pl-3 pr-1 rounded-full bg-gray-100 text-sm">
                    {v.name}
                    <button
                      type="button"
                      aria-label={`${t("delete")} ${v.name}`}
                      onClick={() => run(actions.deleteVersion(v.id))}
                      className="w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-black hover:bg-gray-200 cursor-pointer"
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* версии из объявлений, которых нет в каталоге: добавить одним нажатием */}
          {model.unlisted.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">{t("unlisted")}</p>
              <ul className="flex flex-wrap gap-1.5">
                {model.unlisted.map((v) => (
                  <li key={v.name}>
                    <button
                      type="button"
                      onClick={() => run(actions.addVersion(model.id, v.name))}
                      title={t("addToCatalogue")}
                      className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-dashed border-gray-300 text-sm text-gray-700 hover:border-gray-900 cursor-pointer"
                    >
                      + {v.name}
                      <span className="text-xs text-gray-400 tabular-nums">{v.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <AddForm label={t("addVersion")} onAdd={(name) => run(actions.addVersion(model.id, name))} />
        </Card>
      ) : (
        <Placeholder text={brand ? t("pickModel") : ""} />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting && (await run(actions.deleteModel(deleting.id))) && modelId === deleting.id) setModelId(null);
          setDeleting(null);
        }}
        title={t("deleteModelTitle", { name: deleting?.name ?? "" })}
        text={t("deleteModelText")}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
      />
    </div>
  );
}

type ColumnProps = {
  title: string;
  count?: number;
  query: string;
  onQuery: (value: string) => void;
  addLabel: string;
  hint?: string;
  onAdd: (name: string) => Promise<boolean>;
  children: React.ReactNode;
};

// Колонка: заголовок, поиск, список и добавление внизу
function Column({ title, count, query, onQuery, addLabel, hint, onAdd, children }: ColumnProps) {
  const t = useTranslations("moderation.admin.catalog");
  return (
    <Card padding="none" className="overflow-hidden">
      <ColumnHeader title={title} count={count} />
      <div className="p-3 border-b border-gray-100">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t("search")}
          aria-label={`${t("search")}: ${title}`}
          className={cn(inputClass, "h-9")}
        />
        {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
      </div>
      <ul className="max-h-[480px] overflow-y-auto divide-y divide-gray-100">
        {count === undefined ? <li className="p-4 text-sm text-gray-500">…</li> : children}
      </ul>
      <AddForm label={addLabel} onAdd={onAdd} />
    </Card>
  );
}

type ColumnHeaderProps = { title: string; count?: number };

function ColumnHeader({ title, count }: ColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-4 h-12 border-b border-gray-100">
      <h2 className="font-semibold text-gray-900 truncate">{title}</h2>
      {count !== undefined && <span className="text-xs text-gray-500 tabular-nums">{count}</span>}
    </div>
  );
}

type RowProps = {
  name: string;
  meta: string;
  selected: boolean;
  hidden: boolean;
  onSelect: () => void;
  onRename: (name: string) => Promise<boolean>;
  children: React.ReactNode; // кнопки справа
};

// Строка списка: выбор, переименование на месте, кнопки действий
function Row({ name, meta, selected, hidden, onSelect, onRename, children }: RowProps) {
  const t = useTranslations("moderation.admin.catalog");
  const [editing, setEditing] = useState<string | null>(null);

  if (editing !== null) {
    const save = async () => {
      if (editing.trim() === name || (await onRename(editing))) setEditing(null);
    };
    return (
      <li className="flex items-center gap-2 p-2">
        <input
          autoFocus
          value={editing}
          onChange={(e) => setEditing(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(null);
          }}
          aria-label={t("rename")}
          className={cn(inputClass, "h-9")}
        />
        <Button size="sm" onClick={save}>
          {t("save")}
        </Button>
      </li>
    );
  }

  return (
    <li className={cn("flex items-center gap-1 pr-2", selected && "bg-gray-50")}>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="flex-1 min-w-0 text-left px-4 py-2.5 cursor-pointer">
        <span className={cn("flex items-center gap-2 font-medium", hidden ? "text-gray-400" : "text-gray-900")}>
          <span className="truncate">{name}</span>
          {hidden && <Badge tone="muted">{t("hidden")}</Badge>}
        </span>
        <span className="block text-xs text-gray-500">{meta}</span>
      </button>
      <IconButton label={t("rename")} onClick={() => setEditing(name)} className="text-gray-400">
        <EditOutlinedIcon fontSize="small" />
      </IconButton>
      {children}
    </li>
  );
}

type HideButtonProps = { hidden: boolean; onToggle: () => void };

function HideButton({ hidden, onToggle }: HideButtonProps) {
  const t = useTranslations("moderation.admin.catalog");
  return (
    <IconButton label={hidden ? t("show") : t("hide")} onClick={onToggle} className="text-gray-400">
      {hidden ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
    </IconButton>
  );
}

type AddFormProps = { label: string; onAdd: (name: string) => Promise<boolean> };

// Добавление: поле и кнопка внизу колонки; после успеха поле очищается
function AddForm({ label, onAdd }: AddFormProps) {
  const t = useTranslations("moderation.admin.catalog");
  const [name, setName] = useState("");
  return (
    <form
      className="flex gap-2 p-3 border-t border-gray-100 bg-gray-50"
      onSubmit={async (e) => {
        e.preventDefault();
        if (name.trim() && (await onAdd(name))) setName("");
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={label} aria-label={label} className={cn(inputClass, "h-9")} />
      <Button type="submit" size="sm" variant="dark" disabled={!name.trim()}>
        {t("add")}
      </Button>
    </form>
  );
}

type PlaceholderProps = { text: string };

function Placeholder({ text }: PlaceholderProps) {
  return (
    <div className="hidden lg:flex items-center justify-center min-h-40 rounded-card border border-dashed border-gray-200 text-sm text-gray-500 p-6 text-center">
      {text}
    </div>
  );
}
