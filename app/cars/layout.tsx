import Container from "@/components/layout/Container";

export default function CarsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Container>{children}</Container>;
}
