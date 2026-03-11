"use client";

import { TextField, InputAdornment } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ProfileSectionCard from "./ProfileSectionCard";
import { Profile } from "../../types/profile";

type Props = {
  firstName: string;
  lastName: string;
  updateField: (field: keyof Profile, value: string) => void;
};

export default function BasicInformationForm({
  firstName,
  lastName,
  updateField,
}: Props) {
  return (
    <ProfileSectionCard title="Basic information">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          label="First name"
          value={firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon fontSize="small" sx={{ color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Last name"
          value={lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineIcon fontSize="small" sx={{ color: "#9ca3af" }} />
              </InputAdornment>
            ),
          }}
        />
      </div>
    </ProfileSectionCard>
  );
}
