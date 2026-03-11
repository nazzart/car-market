"use client";

import { Stepper, Step, StepLabel } from "@mui/material";
import { useSellCar } from "../context/SellCarContext";

const labels = ["Car Info", "Condition", "Contact"];

export function StepperHeader() {
  const { step } = useSellCar();

  return (
    <Stepper activeStep={step}>
      {labels.map((label) => (
        <Step key={label}>
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}
