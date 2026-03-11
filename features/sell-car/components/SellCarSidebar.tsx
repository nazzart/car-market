"use client";

type Section = {
  id: string;
  label: string;
  required?: boolean;
};

const sections: Section[] = [
  { id: "photos", label: "Photos" },
  { id: "car-info", label: "Car Info", required: true },
  { id: "condition", label: "Condition" },
  { id: "contact", label: "Contact" },
];

export function SellCarSidebar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);

    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <aside className="hidden lg:block sticky top-24 self-start w-[200px]">
      <p className="text-xs uppercase text-gray-400 mb-5 tracking-wider">
        Listing sections
      </p>

      <ul className="space-y-4">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollTo(section.id)}
              className="
                flex items-center
                text-gray-600
                hover:text-black
                transition
              "
            >
              {section.label}

              {section.required && <span className="ml-1 text-red-500">*</span>}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
