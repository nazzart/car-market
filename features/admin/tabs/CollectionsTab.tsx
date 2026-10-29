"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { collections } from "@/features/collections/config";
import { setExcluded, useExcluded } from "@/features/moderation/store";
import { useCollectionMembership } from "@/features/moderation/visibility";
import { formatPrice } from "@/lib/utils";

import { EmptyBox, Thumb, pillClass, useAdminData } from "../shared";

// Подборки собираются автоматически по правилам; модератор может снять объявление, которому там не место
export default function CollectionsTab() {
  const t = useTranslations("moderation.admin.collections");
  const tOptions = useTranslations("options");
  const { listings } = useAdminData();
  const excluded = useExcluded();
  const inCollection = useCollectionMembership();
  const [slug, setSlug] = useState(collections[0].slug);

  const collection = collections.find((c) => c.slug === slug)!;
  // в подборке + снятые модератором (чтобы их можно было вернуть)
  const members = listings.filter((l) => inCollection(l, collection) || excluded[l.id]?.includes(slug));

  return (
    <div>
      {/* Состав подборок */}
      <section>
        <h2 className="text-lg font-semibold">{t("contentTitle")}</h2>
        <p className="text-sm text-gray-500 mt-0.5 mb-4">{t("contentHint")}</p>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
          {collections.map((c) => (
            <button key={c.slug} type="button" aria-pressed={slug === c.slug} onClick={() => setSlug(c.slug)} className={pillClass(slug === c.slug)}>
              {tOptions(`collections.${c.slug}.label`)}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-3">{tOptions(`collections.${slug}.description`)}</p>

        {members.length === 0 ? (
          <EmptyBox>{t("contentEmpty")}</EmptyBox>
        ) : (
          <ul className="rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {members.map((l) => {
              const isExcluded = excluded[l.id]?.includes(slug);
              return (
                <li key={l.id} className="flex items-center gap-3 p-3">
                  <Thumb listing={l} muted={isExcluded} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{l.title}, {l.year}</div>
                    <div className="text-xs text-gray-500">
                      {formatPrice(l.price)} · {l.power} ZS
                      {isExcluded && <span className="text-red-700"> · {t("excluded")}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExcluded(l.id, slug, !isExcluded)}
                    className="shrink-0 h-9 px-4 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium transition cursor-pointer"
                  >
                    {isExcluded ? t("include") : t("exclude")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
