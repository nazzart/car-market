"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Props = {
  sections: {
    id: string;
    title: string;
    required?: boolean;
  }[];
  sectionsValid: Record<string, boolean>;
};

export function SellCarSidebar({ sections, sectionsValid }: Props) {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <aside className="sticky top-12">
      <div className="space-y-3">
        {sections.map((item) => {
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

              {!valid && (
                <CheckCircleIcon
                  sx={{
                    fontSize: 18,
                    color: "#ccc",
                  }}
                />
              )}

              {/* Label */}

              <span className="text-sm text-gray-700">
                {item.title}

                {item.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
