"use client";

import { useState } from "react";
import { Typography, TextField, Button, InputAdornment } from "@mui/material";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type Props = {
  onBack: () => void;
};

export default function ForgotPasswordView({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      {!sent ? (
        <>
          {/* back */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-black mb-6"
          >
            <ArrowBackIcon fontSize="small" />
            Back
          </button>

          {/* header */}
          <header className="text-center mb-8">
            <Typography variant="h5" fontWeight={600}>
              Reset password
            </Typography>

            <Typography color="text.secondary">
              Enter your email and we'll send you a reset link.
            </Typography>
          </header>

          {/* form */}
          <div className="flex flex-col gap-6">
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              size="large"
              disabled={!email}
              onClick={() => setSent(true)}
            >
              Send reset link
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* success */}
          <header className="text-center mb-8">
            <Typography variant="h5" fontWeight={600}>
              Check your email
            </Typography>

            <Typography color="text.secondary">
              If an account exists for <b>{email}</b>, you'll receive a password
              reset link shortly.
            </Typography>
          </header>

          <Button variant="contained" size="large" fullWidth onClick={onBack}>
            Back to login
          </Button>
        </>
      )}
    </>
  );
}
