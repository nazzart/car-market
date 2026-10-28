"use client";

import { useAuth } from "@/features/auth/store";
import type { Listing } from "@/features/cars/data/listings";
import { createLocalStore } from "@/lib/localStore";

import { DealerContact, dealers } from "./data/dealers";

// Переназначения «объявление → контактное лицо», сделанные дилером (демо: в браузере).
// "company" — основной телефон компании. TODO: поле contactId объявления в БД
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
  const { user } = useAuth();
  const base = slug ? dealers.find((d) => d.slug === slug) : undefined;
  const own = user?.type === "dealer" && user.dealerSlug === slug ? user : null;

  return {
    contacts: own?.dealerProfile?.contacts ?? base?.contacts ?? [],
    // телефон компании: из аккаунта, иначе из каталога; пустой — дилер укажет его в форме
    phone: own?.phone || base?.phone || "",
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
