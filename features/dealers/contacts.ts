import type { Listing } from "@/features/cars/types";

// Кто отвечает на звонки по объявлению: контактное лицо дилера или телефон из объявления.
// Телефон, имя и должность контактного лица подставляет сервер (features/cars/api)
export function useListingContact(listing: Listing): { phone: string; person?: Listing["contactPerson"] } {
  return { phone: listing.phone, person: listing.contactPerson };
}
