import type { Metadata } from "next";
import { Suspense } from "react";

import Container from "@/components/layout/Container";
import DealersView from "@/features/dealers/components/DealersView";

export const metadata: Metadata = {
  title: "Дилеры и автосалоны в Латвии | bestauto.lv",
};

export default function DealersPage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <DealersView />
      </Suspense>
    </Container>
  );
}
