import Container from "@/components/layout/Container";
import { SellCarLayout } from "@/features/sell-car/components/SellCarLayout";
import { SellCarProvider } from "@/features/sell-car/context/SellCarContext";

export default function SellCarPage() {
  return (
    <SellCarProvider>
      <Container>
      <SellCarLayout />
      </Container>
    </SellCarProvider>
  );
}
