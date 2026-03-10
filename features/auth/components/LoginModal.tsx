"use client";

import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LoginModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm cursor-default"
      />

      {/* modal */}
      <Paper
        elevation={8}
        className="relative w-full max-w-md rounded-2xl p-8 shadow-xl animate-[modalIn_.18s_ease-out]"
      >
        <header className="text-center mb-6">
          <Typography variant="h4" fontWeight={600}>
            Welcome back
          </Typography>

          <Typography color="text.secondary">Sign in to continue</Typography>
        </header>

        <form className="flex flex-col gap-5">
          {/* email */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: "#ef4444",
              },
            }}
          />

          {/* password */}
          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                borderColor: "#ef4444",
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* remember + forgot */}
          <section className="flex items-center justify-between">
            <FormControlLabel
              control={<Checkbox size="small" />}
              label="Remember me"
            />

            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </button>
          </section>

          {/* login button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!email || !password}
            className="!rounded-xl !py-3 !bg-red-500 hover:!bg-red-600 transition"
          >
            Sign in
          </Button>
        </form>

        <footer className="text-center mt-6 text-sm text-gray-500">
          Don’t have an account?{" "}
          <button className="text-blue-600 font-medium hover:underline">
            Sign up
          </button>
        </footer>
      </Paper>
    </section>
  );
}
