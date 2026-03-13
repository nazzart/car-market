"use client"

import { TextField, Button } from "@mui/material"
import { SectionContainer } from "../components/SectionContainer"

export function ContactSection() {

  return (
    <SectionContainer
      id="contact"
      title="Contact details"
      description="How buyers can reach you"
    >

      <div className="space-y-4">

        <TextField
          label="Name"
          fullWidth
        />

        <TextField
          label="Phone"
          fullWidth
        />

        <Button
          variant="contained"
          size="large"
        >
          Publish Listing
        </Button>

      </div>

    </SectionContainer>
  )
}