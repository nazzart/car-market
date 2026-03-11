"use client"

import { TextField, MenuItem } from "@mui/material"
import { SectionContainer } from "../components/SectionContainer"

export function CarInfoSection() {

  return (
    <SectionContainer
      id="car-info"
      title="Car information"
      description="Provide basic details"
    >

      <div className="space-y-4">

        <TextField
          select
          label="Brand"
          fullWidth
        >
          {["Audi","BMW","Mercedes"].map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </TextField>

        <div className="grid grid-cols-2 gap-4">

          <TextField
            label="Model"
            fullWidth
          />

          <TextField
            label="Mileage"
            fullWidth
          />

        </div>

      </div>

    </SectionContainer>
  )
}