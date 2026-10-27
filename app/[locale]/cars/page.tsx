import { Suspense } from "react";

import Container from "@/components/layout/Container";
import CarsSearchView from "@/features/cars/car-list/components/CarsSearchView";

export default function CarsPage() {
  return (
    <Container>
      {/* Suspense нужен для useSearchParams в клиентском компоненте */}
      <Suspense>
        <CarsSearchView />
      </Suspense>
    </Container>
  );
}
