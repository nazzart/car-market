"use client"

import { Button } from "@mui/material"
import { useSellCar } from "../context/SellCarContext"

export function StepNavigation({ last }: { last?: boolean }) {

  const { step, next, prev } = useSellCar()

  return (
    <div className="mt-8">

      <p className="text-sm text-gray-500 mb-3">
        Step {step + 1} of 4
      </p>

      <div className="flex justify-between">

        <Button
          disabled={step === 0}
          onClick={prev}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={next}
        >
          {last ? "Publish Listing" : "Continue"}
        </Button>

      </div>

    </div>
  )
}