import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";
import { getListing } from "@/features/cars/api";
import ContactCard from "@/features/cars/car-view/components/ContactCard";
import DamageReport from "@/features/cars/car-view/components/DamageReport";
import EquipmentList from "@/features/cars/car-view/components/EquipmentList";
import HeaderActions from "@/features/cars/car-view/components/HeaderActions";
import Highlights from "@/features/cars/car-view/components/Highlights";
import KeySpecs from "@/features/cars/car-view/components/KeySpecs";
import ListingDescription from "@/features/cars/car-view/components/ListingDescription";
import MobileContactBar from "@/features/cars/car-view/components/MobileContactBar";
import PhotoGallery from "@/features/cars/car-view/components/PhotoGallery";
import SellerInfo from "@/features/cars/car-view/components/SellerInfo";
import SimilarListings from "@/features/cars/car-view/components/SimilarListings";
import CsddCheck from "@/features/cars/car-view/components/CsddCheck";
import ListingStatusNotice from "@/features/cars/car-view/components/ListingStatusNotice";
import ConditionSummary from "@/features/cars/car-view/components/ConditionSummary";
import ListingVideo from "@/features/cars/car-view/components/ListingVideo";
import { youtubeId } from "@/lib/youtube";
import ReportButton from "@/features/moderation/ReportButton";
import SectionNav from "@/features/cars/car-view/components/SectionNav";
import SpecsTable from "@/features/cars/car-view/components/SpecsTable";
import { Link } from "@/i18n/navigation";
import { placeName } from "@/lib/places";
import { formatAgo, formatNumber } from "@/lib/utils";

type Props = { params: Promise<{ locale: string; id: string }> };

const findListing = async (params: Props["params"]) => {
  const { id } = await params;
  return getListing(id);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const listing = await findListing(params);
  if (!listing) return {};

  const t = await getTranslations({ locale, namespace: "listing" });

  const title = t("metaTitle", { title: listing.title, year: listing.year, price: formatNumber(listing.price) });
  const description = `${listing.year} · ${formatNumber(listing.mileage)} km · ${listing.power} ZS · ${formatNumber(listing.price)} €`;

  // картинку-превью добавляет opengraph-image.tsx рядом
  return {
    title,
    description,
    openGraph: { title: `${listing.title}, ${listing.year} — ${formatNumber(listing.price)} €`, description, type: "article" },
  };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-32">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-5">{title}</h2>
      {children}
    </section>
  );
}

export default async function ListingPage({ params }: Props) {
  const { locale } = await params;
  const listing = await findListing(params);
  if (!listing) notFound();

  const t = await getTranslations("listing");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const brandName = brands.find((b) => b.slug === listing.brand)?.name;

  const navItems = [
    { id: "description", label: t("sections.description") },
    listing.videoUrl && youtubeId(listing.videoUrl) && { id: "video", label: t("sections.video") },
    { id: "specs", label: t("sections.specs") },
    (listing.overallCondition || listing.service) && { id: "condition", label: t("sections.condition") },
    listing.damages && { id: "body", label: t("sections.body") },
    listing.equipment?.length && { id: "equipment", label: t("sections.equipment") },
  ].filter((x): x is { id: string; label: string } => Boolean(x));

  return (
    <Container className="pt-5 pb-28 lg:pb-12">
      {/* Breadcrumbs */}

      <nav aria-label={t("breadcrumbs.aria")} className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">{t("breadcrumbs.home")}</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href="/cars" className="hover:text-black">{tNav("cars")}</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href={`/cars?brand=${listing.brand}`} className="hover:text-black">
          {brandName}
        </Link>
      </nav>

      {/* Header */}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {listing.title}, {listing.year}
          </h1>

          <p className="text-gray-600 mt-1">
            {formatNumber(listing.mileage)} {tCommon("units.km")} · {placeName(listing.city, locale)} ·{" "}
            {formatAgo(listing.postedMinutesAgo, locale)}
          </p>
        </div>

        <HeaderActions listing={{ id: listing.id, title: listing.title, price: listing.price }} />
      </header>

      <ListingStatusNotice
        listing={{ status: listing.status, review: listing.review, moderation: listing.moderation, accountBlock: listing.accountBlock }}
        brand={listing.brand}
      />

      <div className="mt-5">
        <PhotoGallery images={listing.images} title={listing.title} />
      </div>

      {/* Content */}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 xl:gap-16 mt-8 items-start">
        <div className="min-w-0 space-y-10">
          {/* Цена на телефоне — в сайдбаре на десктопе */}
          <div className="lg:hidden">
            <div className="text-3xl font-bold tracking-tight">{formatNumber(listing.price)} €</div>
            {listing.negotiable && (
              <div className="text-sm text-emerald-700 mt-1">{t("negotiable")}</div>
            )}
          </div>

          <div className="space-y-4">
            <KeySpecs listing={listing} />
            <Highlights listing={listing} />
          </div>

          <SectionNav items={navItems} />

          <Section id="description" title={t("sections.description")}>
            {/* ~68 знаков в строке — удобно читать */}
            <div className="max-w-[68ch]">
              <ListingDescription text={listing.description} />
            </div>
          </Section>

          {listing.videoUrl && youtubeId(listing.videoUrl) && (
            <Section id="video" title={t("sections.video")}>
              <ListingVideo url={listing.videoUrl} title={listing.title} />
            </Section>
          )}

          <Section id="specs" title={t("sections.specs")}>
            <SpecsTable listing={listing} />
            <div className="mt-6">
              <CsddCheck />
            </div>
          </Section>

          {(listing.overallCondition || listing.service || listing.serviceBook !== undefined || listing.mileageLatvia) && (
            <Section id="condition" title={t("sections.condition")}>
              <ConditionSummary listing={listing} />
            </Section>
          )}

          {listing.damages && (
            <Section id="body" title={t("sections.body")}>
              <DamageReport damages={listing.damages} />
            </Section>
          )}

          {listing.equipment && listing.equipment.length > 0 && (
            <Section id="equipment" title={t("sections.equipment")}>
              <EquipmentList items={listing.equipment} />
            </Section>
          )}

          <div className="lg:hidden">
            <Section id="seller" title={t("sections.seller")}>
              <SellerInfo listing={listing} />
              <ReportButton listingId={listing.id} className="mt-5" />
            </Section>
          </div>
        </div>

        <aside className="hidden lg:block sticky top-20">
          <ContactCard listing={listing} />
        </aside>
      </div>

      <SimilarListings listing={listing} />

      <MobileContactBar listing={listing} />
    </Container>
  );
}
