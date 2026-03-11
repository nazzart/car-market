"use client";

import { TextField, InputAdornment } from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import ProfileSectionCard from "./ProfileSectionCard";
import { Profile } from "../../types/profile";


type Props = {
  email: string;
  phone: string;
  updateField: (field: keyof Profile, value: string) => void;
};

export default function ContactInformationForm({
  email,
  phone,
  updateField,
}: Props) {
  return (
    <ProfileSectionCard
      title="Contact"
      description="How buyers can reach you."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <TextField
          label="Email"
          value={email}
          onChange={(e) =>
            updateField("email", e.target.value)
          }
          required
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#9ca3af" }}
                />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Phone"
          value={phone}
          onChange={(e) =>
            updateField("phone", e.target.value)
          }
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#9ca3af" }}
                />
              </InputAdornment>
            ),
          }}
        />

      </div>
    </ProfileSectionCard>
  );
}