"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Link } from "@/i18n/navigation";

import { SellCarSidebar } from "../components/SellCarSidebar";
import { useProgressiveSections } from "../hooks/useProgressiveSections";

import { PublishSection } from "../sections/PublishSection";
import { sections } from "../config/sectionsConfig";
import { getInitialFormData, getSectionsState } from "../utils/sectionUtils";
import { validateAndScroll } from "../lib/formSubmit";
import { SellFormData, UpdateField } from "../types";

export function SellCarView() {
  const t = useTranslations("sell");
  const { visibleSections, revealSection } = useProgressiveSections(sections);

  const [formData, setFormData] = useState(() => getInitialFormData<SellFormData>(sections));

  const updateField: UpdateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sectionsState = getSectionsState(sections, formData as Record<string, unknown>);

  const handleSubmit = () => {
    const isOk = validateAndScroll(sections, formData);

    if (!isOk) return;

    // TODO: отправка объявления на сервер (API), затем переход на страницу «объявление на проверке»
  };

  const lastSection = sections.at(-1);
  const isLastVisible = lastSection
    ? visibleSections.includes(lastSection.id)
    : false;

  const required = sections.filter((s) => s.required);
  const requiredDone = required.filter((s) => sectionsState[s.id]).length;

  return (
    <div className="max-w-6xl mx-auto pt-6 pb-16">
      {/* Header */}

      <div className="mb-8">
        <Link
          href="/sell"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-black transition"
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          {t("form.back")}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-3">
          {t("form.title")}
        </h1>

        <p className="text-gray-500 mt-1">
          {t("form.subtitle")}
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
        <SellCarSidebar
          sections={sections}
          sectionsValid={sectionsState}
          visibleSections={visibleSections}
          requiredDone={requiredDone}
          requiredTotal={required.length}
        />

        <div className="space-y-6 min-w-0 max-w-3xl">
          {sections.map((section, index) => {
            if (!visibleSections.includes(section.id)) return null;

            const Component = section.component;
            const nextSection = sections[index + 1];

            return (
              <Component
                key={section.id}
                id={section.id}
                title={t(`sections.${section.id}`)}
                data={formData}
                required={section.required}
                fields={section.fields}
                updateField={updateField}
                onNext={() => nextSection && revealSection(nextSection.id)}
              />
            );
          })}

          {isLastVisible && (
            <PublishSection
              data={formData}
              requiredDone={requiredDone}
              requiredTotal={required.length}
              onSubmit={handleSubmit}
            />
          )}

          {!isLastVisible && <div className="h-[40vh]" />}
        </div>
      </div>
    </div>
  );
}
