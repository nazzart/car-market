"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import type { SectionNavItem } from "../../types";

type SectionNavProps = { items: SectionNavItem[] };

// Липкое меню разделов объявления; подсвечивает раздел, который сейчас на экране
export default function SectionNav({ items }: SectionNavProps) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // активен раздел, верх которого в верхней части экрана
      { rootMargin: "-120px 0px -60% 0px" }
    );
    for (const { id } of items) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="sticky top-16 z-20 -mx-4 px-4 lg:mx-0 lg:px-0 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="flex gap-1 overflow-x-auto scrollbar-none py-2">
        {items.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition",
              active === id ? "bg-gray-900 text-white" : "text-gray-600 hover:text-black hover:bg-gray-100"
            )}
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
