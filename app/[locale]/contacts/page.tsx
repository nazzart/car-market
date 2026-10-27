import InfoPage, { infoMetadata } from "@/features/info/InfoPage";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return infoMetadata((await params).locale, "contacts");
}

export default function Page() {
  return <InfoPage page="contacts" />;
}
