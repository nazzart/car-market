"use client";

import { TextField, InputAdornment } from "@mui/material";

import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import ProfileSectionCard from "./ProfileSectionCard";
import { Profile } from "../../types/profile";

type Props = {
  country: string;
  city: string;
  updateField: (field: keyof Profile, value: string) => void;
};

export default function LocationInformationForm({
  country,
  city,
  updateField,
}: Props) {
  return (
    <ProfileSectionCard
      title="Location"
      description="Where you are located."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <TextField
          label="Country"
          value={country}
          required
          onChange={(e) =>
            updateField("country", e.target.value)
          }
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PublicOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#9ca3af" }}
                />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="City"
          value={city}
          required
          onChange={(e) =>
            updateField("city", e.target.value)
          }
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationCityOutlinedIcon
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