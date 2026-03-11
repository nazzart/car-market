"use client"

import { createContext, useContext, useState } from "react"

type FormState = {
  photos?: string[]
  brand?: string
  model?: string
  mileage?: string
  condition?: string
}

type ErrorState = Record<number, boolean>

const SellCarContext = createContext<any>(null)

export function SellCarProvider({ children }: { children: React.ReactNode }) {

  const [step, setStep] = useState(0)

  const [form, setFormState] = useState<FormState>({
    photos: []
  })

  const [errors, setErrors] = useState<ErrorState>({})

  const setForm = (data: Partial<FormState>) =>
    setFormState((prev) => ({ ...prev, ...data }))

  const next = () => setStep((s) => Math.min(s + 1, 3))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  return (
    <SellCarContext.Provider
      value={{
        step,
        setStep,
        next,
        prev,
        form,
        setForm,
        errors,
        setErrors
      }}
    >
      {children}
    </SellCarContext.Provider>
  )
}

export const useSellCar = () => useContext(SellCarContext)