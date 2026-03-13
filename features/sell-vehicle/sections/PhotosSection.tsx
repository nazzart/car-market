"use client"

import { Button } from "@mui/material"
import { SectionContainer } from "../components/SectionContainer"

export function PhotosSection() {

  return (
    <SectionContainer
      id="photos"
      title="Photos"
      description="Upload photos of your vehicle"
    >

      <Button variant="outlined">
        Upload photos
      </Button>

      <div className="grid grid-cols-3 gap-3 mt-4">

        <div className="h-28 bg-gray-100 rounded" />
        <div className="h-28 bg-gray-100 rounded" />
        <div className="h-28 bg-gray-100 rounded" />

      </div>

    </SectionContainer>
  )
}