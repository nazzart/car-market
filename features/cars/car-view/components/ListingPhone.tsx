"use client";

import { useTranslations } from "next-intl";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";

import PhoneButton from "@/features/cars/car-list/components/PhoneButton";
import { useListingContact } from "@/features/dealers/contacts";
import { cn } from "@/lib/utils";

import type { Listing } from "../../data/listings";

type Props = {
  listing: Listing;
  variant?: "primary" | "outline";
  className?: string;
};

// «Показать телефон» с номером ответственного менеджера (если дилер его указал)
export default function ListingPhone({ listing, variant, className }: Props) {
  const { phone } = useListingContact(listing);
  return <PhoneButton phone={phone} variant={variant} className={className} />;
}

// «Контактное лицо: Jānis Kalniņš, Pārdošanas konsultants»
export function ContactPerson({ listing, className }: { listing: Listing; className?: string }) {
  const t = useTranslations("listing.seller");
  const { person } = useListingContact(listing);

  if (!person) return null;

  return (
    <div className={cn("flex items-start gap-2 text-sm", className)}>
      <SupportAgentOutlinedIcon sx={{ fontSize: 18 }} className="text-gray-500 mt-px shrink-0" />
      <span className="text-gray-700">
        <span className="text-gray-500">{t("contactPerson")}:</span>{" "}
        <span className="font-medium text-gray-900">{person.name}</span>
        {person.role && <span className="text-gray-500">, {person.role}</span>}
      </span>
    </div>
  );
}
