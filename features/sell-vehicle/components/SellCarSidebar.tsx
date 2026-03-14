"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Props = {
  sectionsValid: Record<string, boolean>;
};

export function SellCarSidebar({ sectionsValid }: Props) {
  const items = [
    { id: "basic-info", label: "Основная информация", required: true },
    { id: "technical", label: "Технические характеристики", required: true },
    { id: "history", label: "История автомобиля", required: true },
    { id: "condition", label: "Состояние автомобиля", required: false },
    { id: "equipment", label: "Комплектация", required: false },
    { id: "description", label: "Описание", required: false },
    { id: "contact", label: "Контактная информация", required: true },
    { id: "photos", label: "Фотографии", required: false },
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <aside className="sticky top-12">
      <div className="space-y-3">
        {items.map((item) => {
          const valid = sectionsValid?.[item.id];

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="flex items-center gap-2 w-full text-left"
            >
              {/* Check */}

              {valid && (
                <CheckCircleIcon
                  sx={{
                    fontSize: 18,
                    color: "#16a34a",
                  }}
                />
              )}

              {!valid && <span className="w-[18px]" />}

              {/* Label */}

              <span className="text-sm text-gray-700">
                {item.label}

                {item.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
