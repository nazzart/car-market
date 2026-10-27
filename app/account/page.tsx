import type { Metadata } from "next";

import Container from "@/components/layout/Container";
import AccountView from "@/features/account/AccountView";

export const metadata: Metadata = {
  title: "Личный кабинет | bestauto.lv",
};

export default function AccountPage() {
  return (
    <Container>
      <AccountView />
    </Container>
  );
}
