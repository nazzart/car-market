"use client";

import type { Listing } from "@/features/cars/types";

import { useDealerLookup } from "./hooks";
import type { DealerContact } from "./types";

// Контакты дилера из базы (каталог дилеров в CatalogProvider)
export function useDealerContacts(slug?: string) {
  const dealer = useDealerLookup()(slug);

  return {
    contacts: dealer?.contacts ?? [],
    // пустой телефон — дилер ещё не указал его (форма продажи попросит)
    phone: dealer?.phone ?? "",
  };
}

// Кто отвечает на звонки по объявлению: контактное лицо дилера (listings.contact_id) или телефон из объявления.
// Телефон уже подставлен сервером; здесь — ещё имя и должность контактного лица для карточки
export function useListingContact(listing: Listing): { phone: string; person?: DealerContact } {
  const { contacts } = useDealerContacts(listing.dealer);
  const person = listing.dealer ? contacts.find((c) => c.id === listing.contactId) : undefined;
  return person ? { phone: person.phone, person } : { phone: listing.phone };
}
