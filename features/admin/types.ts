// Модерация (/admin): вкладки, статусы объявлений в списках, режимы окна решения, фильтры

export type AdminTab = "overview" | "approvals" | "listings" | "reports" | "collections" | "users";

// Состояние объявления, как его видит модератор (значок в списках)
export type StatusKey = "active" | "paused" | "sold" | "deleted" | "blocked" | "removed" | "pending" | "accountBlocked";

// Окно решения модератора: что именно он делает
export type DialogMode = "block" | "remove" | "reject" | "blockAccount";

export type ListingsFilter = "all" | "public" | "pending" | "hidden" | "blocked" | "removed" | "reported";
export type UsersFilter = "all" | "dealers" | "individuals" | "unverified" | "blocked";

// Продавец в списке «Пользователи»: частное лицо или дилер
export type AdminAccount = {
  key: string; // «dealer:baltic-auto» / «user:<uuid>»
  name: string;
  kind: "dealer" | "individual";
  contact: string;
  regNumber?: string;
  dealerSlug?: string;
  verified?: boolean;
};
