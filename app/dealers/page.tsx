import type { Metadata } from "next";

import Container from "@/components/layout/Container";
import DealersView from "@/features/dealers/components/DealersView";

export const metadata: Metadata = {
  title: "Дилеры и автосалоны в Латвии | bestauto.lv",
};

export default function DealersPage() {
  return (
    <Container>
      <DealersView />
    </Container>
  );
}
