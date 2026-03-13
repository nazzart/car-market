import { useState } from "react";

export function useProgressiveSections(sections: { id: string }[]) {
  const [visibleSections, setVisibleSections] = useState([sections[0].id]);
  const [sectionsValid, setSectionsValid] = useState<Record<string, boolean>>({});

  const revealSection = (id: string) => {
    setVisibleSections((prev) => [...prev, id]);

    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;

      const offset = 160;

      const y =
        el.getBoundingClientRect().top +
        window.scrollY -
        offset;

      window.scrollTo({
        top: y,
        behavior: "smooth",
      });
    }, 100);
  };

  const setSectionValid = (id: string, valid: boolean) => {
    setSectionsValid((prev) => ({
      ...prev,
      [id]: valid,
    }));
  };

  return {
    visibleSections,
    sectionsValid,
    revealSection,
    setSectionValid,
  };
}