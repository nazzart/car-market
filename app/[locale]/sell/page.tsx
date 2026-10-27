import { Suspense } from "react";

import Container from "@/components/layout/Container";
import { SellVehicleLayout } from "@/features/sell-vehicle/components/SellVehicleLayout";

export default function SellVehiclePage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <SellVehicleLayout />
      </Suspense>
    </Container>
  );
}
