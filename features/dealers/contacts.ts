"use client";

import type { Listing } from "@/features/cars/types";
import { createLocalStore } from "@/lib/localStore";

import { useDealerLookup } from "./hooks";
import type { DealerContact } from "./types";
import { useOwnDealer } from "./useOwnDealer";

// Переназначения «объявление → контактное лицо», сделанные дилером (демо: в браузере).
// "company" — основной телефон компании. TODO(backend): поле contactId объявления в БД
const assignments = createLocalStore<Record<string, string>>("bestauto.listingContacts", {});

export const useContactAssignments = assignments.useValue;

export function assignContact(listingIds: string[], contactId: string) {
  const next = { ...assignments.get() };
  for (const id of listingIds) next[id] = contactId;
  assignments.set(next);
}

// Контакты дилера: из настроек вошедшего дилера, иначе из каталога.
// Без slug — свой аккаунт дилера, у которого ещё нет страницы в каталоге (новый дилер)
export function useDealerContacts(slug?: string) {
  const own = useOwnDealer();
  const dealerOf = useDealerLookup();
  const dealer = own && (own.slug || undefined) === slug ? own : dealerOf(slug);

  return {
    contacts: dealer?.contacts ?? [],
    // пустой телефон — дилер ещё не указал его (форма продажи попросит)
    phone: dealer?.phone ?? "",
  };
}

// Кто отвечает на звонки по объявлению: контактное лицо дилера или телефон из объявления
export function useListingContact(listing: Listing): { phone: string; person?: DealerContact } {
  const { contacts, phone: companyPhone } = useDealerContacts(listing.dealer);
  const overrides = useContactAssignments();

  if (!listing.dealer) return { phone: listing.phone };

  const contactId = overrides[listing.id] ?? listing.contactId;
  const person = contacts.find((c) => c.id === contactId);

  return person ? { phone: person.phone, person } : { phone: companyPhone || listing.phone };
}
