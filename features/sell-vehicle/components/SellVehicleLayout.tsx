"use client";

import CategoryView from "../views/CategoryView";
import { useEffect, useState } from "react";
import { SellCarView } from "../views/SellCarView";

export function SellVehicleLayout() {
  const [category, setCategory] = useState<string | null>(null);

  // scroll to top when category selected
  useEffect(() => {
    if (category) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [category]);

  return (
    <>
      {!category && <CategoryView onSelect={(cat) => setCategory(cat)} />}

      {category && <SellCarView></SellCarView>}
    </>
  );
}
