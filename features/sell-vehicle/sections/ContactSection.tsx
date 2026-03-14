"use client";

import { useState, useEffect } from "react";
import { TextField } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";

type Props = {
  onNext?: () => void;
  onValidChange?: (valid: boolean) => void;
};

export function ContactInfoSection({ onNext, onValidChange }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    const valid = phone.trim().length >= 8;

    onValidChange?.(valid);
  }, [phone, onValidChange]);

  return (
    <SectionContainer
      id="contact"
      title="Контактная информация"
      description="Укажите данные для связи с вами"
      required
      isValid={phone.trim().length >= 8}
      onNext={onNext}
    >
      <div className="grid md:grid-cols-2 gap-4">

        {/* Name */}

        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />

        {/* Phone */}

        <TextField
          label="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          required
          placeholder="+371..."
        />

        {/* Email */}

        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          fullWidth
        />

        {/* City */}

        <TextField
          label="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          fullWidth
        />

      </div>
    </SectionContainer>
  );
}