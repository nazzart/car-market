"use client";

import { useState } from "react";
import { Button } from "@mui/material";

import BasicInformationForm from "../individual/components/BasicInformationForm";
import ContactInformationForm from "../individual/components/ContactInformationForm";
import LocationInformationForm from "../individual/components/LocationInformationForm";
import ProfileHeader from "../individual/components/ProfileHeader";
import { Profile, ProfileMode } from "../types/profile";

type Props = {
  mode: ProfileMode;
};

export default function IndividualProfilePage({ mode }: Props) {
  const [profile, setProfile] = useState<Profile>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
  });

  const updateField = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isEdit = mode === "edit";

  const handleSubmit = () => {
    if (mode === "create") {
      createProfile();
    } else {
      //updateProfile(profile);
    }
  };

  const createProfile = () => {};

  return (
    <section className="max-w-[760px] mx-auto py-16 px-6">
      <ProfileHeader mode={mode} />

      <div className="mt-10 space-y-6">
        <BasicInformationForm
          firstName={profile.firstName}
          lastName={profile.lastName}
          updateField={updateField}
        />

        <ContactInformationForm
          email={profile.email}
          phone={profile.phone}
          updateField={updateField}
        />

        <LocationInformationForm
          country={profile.country}
          city={profile.city}
          updateField={updateField}
        />
      </div>

      <div className="mt-10 flex justify-between">
        <Button
          variant="outlined"
          sx={{ textTransform: "none", borderRadius: "10px" }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          sx={{
            backgroundColor: "#ef4444",
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {isEdit ? "Save changes" : "Create profile"}
        </Button>
      </div>
    </section>
  );
}
