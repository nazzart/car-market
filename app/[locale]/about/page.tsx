import type { LocaleParams } from "@/i18n/types";
import InfoPage, { infoMetadata } from "@/features/info/InfoPage";

export async function generateMetadata({ params }: LocaleParams) {
  return infoMetadata((await params).locale, "about");
}

export default function Page() {
  return <InfoPage page="about" />;
}
