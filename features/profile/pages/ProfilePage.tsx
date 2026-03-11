// import DealerProfilePage from "../dealer/DealerProfilePage";

import IndividualProfilePage from "./IndividualProfilePage";

export default function ProfilePage() {
  const user = {
    accountType: "individual",
  };

  if (user.accountType === "dealer") {
    // return <DealerProfilePage />;
  }

  return <IndividualProfilePage mode="create" />;
}