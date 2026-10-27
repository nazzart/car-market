import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";
import { listings } from "@/features/cars/data/listings";
import ContactCard from "@/features/cars/car-view/components/ContactCard";
import EquipmentList from "@/features/cars/car-view/components/EquipmentList";
import HeaderActions from "@/features/cars/car-view/components/HeaderActions";
import Highlights from "@/features/cars/car-view/components/Highlights";
import KeySpecs from "@/features/cars/car-view/components/KeySpecs";
import ListingDescription from "@/features/cars/car-view/components/ListingDescription";
import MobileContactBar from "@/features/cars/car-view/components/MobileContactBar";
import PhotoGallery from "@/features/cars/car-view/components/PhotoGallery";
import SellerInfo from "@/features/cars/car-view/components/SellerInfo";
import SimilarListings from "@/features/cars/car-view/components/SimilarListings";
import SpecsTable from "@/features/cars/car-view/components/SpecsTable";
import { formatNumber } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

const findListing = async (params: Props["params"]) => {
  const { id } = await params;
  return listings.find((l) => l.id === id);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await findListing(params);
  if (!listing) return {};

  return {
    title: `${listing.title}, ${listing.year} — ${formatNumber(listing.price)} € | bestauto.lv`,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default async function ListingPage({ params }: Props) {
  const listing = await findListing(params);
  if (!listing) notFound();

  const brandName = brands.find((b) => b.slug === listing.brand)?.name;

  return (
    <Container className="pt-5 pb-28 lg:pb-12">
      {/* Breadcrumbs */}

      <nav aria-label="Навигация" className="flex items-center flex-wrap gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-black">Главная</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href="/cars" className="hover:text-black">Легковые</Link>
        <ChevronRightIcon sx={{ fontSize: 16 }} />
        <Link href={`/cars?brand=${listing.brand}`} className="hover:text-black">
          {brandName}
        </Link>
      </nav>

      {/* Header */}

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            {listing.title}, {listing.year}
          </h1>

          <p className="text-gray-600 mt-1">
            {formatNumber(listing.mileage)} км · {listing.city} · {listing.postedAt}
          </p>
        </div>

        <HeaderActions title={listing.title} />
      </header>

      <PhotoGallery images={listing.images} title={listing.title} />

      {/* Content */}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-10 xl:gap-16 mt-8 items-start">
        <div className="min-w-0 space-y-10">
          {/* Цена на телефоне — в сайдбаре на десктопе */}
          <div className="lg:hidden">
            <div className="text-3xl font-bold tracking-tight">{formatNumber(listing.price)} €</div>
            {listing.negotiable && (
              <div className="text-sm text-emerald-700 mt-1">Торг возможен</div>
            )}
          </div>

          <div className="space-y-4">
            <KeySpecs listing={listing} />
            <Highlights listing={listing} />
          </div>

          <Section title="Описание">
            <ListingDescription text={listing.description} />
          </Section>

          <Section title="Характеристики">
            <SpecsTable listing={listing} />
          </Section>

          {listing.equipment && listing.equipment.length > 0 && (
            <Section title="Комплектация">
              <EquipmentList items={listing.equipment} />
            </Section>
          )}

          <div className="lg:hidden">
            <Section title="Продавец">
              <SellerInfo listing={listing} />
            </Section>
          </div>
        </div>

        <aside className="hidden lg:block sticky top-24">
          <ContactCard listing={listing} />
        </aside>
      </div>

      <SimilarListings listing={listing} />

      <MobileContactBar listing={listing} />
    </Container>
  );
}
