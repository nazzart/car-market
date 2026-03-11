"use client"

import { Switch } from "@mui/material"
import { SectionContainer } from "../components/SectionContainer"

export function ConditionSection() {

  return (
    <SectionContainer
      id="condition"
      title="Condition"
      description="Describe vehicle condition"
    >

      <div className="flex items-center gap-3">

        <Switch />

        <span>No accidents</span>

      </div>

    </SectionContainer>
  )
}