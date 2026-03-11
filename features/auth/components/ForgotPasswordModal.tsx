"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";

import MailOutlineIcon from "@mui/icons-material/MailOutline";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  // ESC close
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!open) return null;

  return (
    <section className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
      />

      <Paper
        elevation={10}
        className="relative w-full max-w-[420px] rounded-3xl p-10 shadow-xl animate-[modalIn_.18s_ease-out]"
      >
        {!sent ? (
          <>
            <header className="text-center mb-8">
              <Typography variant="h5" fontWeight={600}>
                Reset password
              </Typography>

              <Typography color="text.secondary">
                Enter your email and we'll send you a reset link.
              </Typography>
            </header>

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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                    borderColor: "#ef4444",
                  },
                }}
              />

              <Button
                variant="contained"
                size="large"
                disabled={!email}
                onClick={() => setSent(true)}
                sx={{
                  backgroundColor: "#ef4444",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#dc2626" },
                }}
              >
                Send reset link
              </Button>
            </div>
          </>
        ) : (
          <>
            <header className="text-center mb-6">
              <Typography variant="h5" fontWeight={600}>
                Check your email
              </Typography>

              <Typography color="text.secondary">
                If an account exists for <b>{email}</b>, you’ll receive a
                password reset link shortly.
              </Typography>
            </header>

            <Button
              fullWidth
              variant="contained"
              onClick={onClose}
              sx={{
                backgroundColor: "#ef4444",
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Close
            </Button>
          </>
        )}
      </Paper>
    </section>
  );
}
