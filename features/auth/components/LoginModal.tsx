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
  Divider,
} from "@mui/material";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ForgotPasswordModal from "./ForgotPasswordModal";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateAccount: () => void;
};

export default function LoginModal({ open, onClose, onCreateAccount }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  if (!open) return null;

  return (
    <>
      <section className="fixed inset-0 z-50 flex items-center justify-center">
        {/* overlay */}
        <button
          aria-label="Close modal"
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* modal */}
        <Paper
          elevation={10}
          className="relative w-full max-w-[440px] rounded-3xl p-10 shadow-xl animate-[modalIn_.18s_ease-out]"
        >
          {/* header */}
          <header className="text-center mb-8">
            <Typography variant="h5" fontWeight={600}>
              Welcome back
            </Typography>

            <Typography color="text.secondary">
              Sign in to your account
            </Typography>
          </header>

          {/* form */}
          <form className="flex flex-col gap-5">
            {/* email */}
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

            {/* password */}
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
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
            <div className="flex items-center justify-between">
              <FormControlLabel
                control={<Checkbox size="small" />}
                label="Remember me"
              />

              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-sm text-gray-500 hover:text-black hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* login */}
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={!email || !password}
            >
              Sign in
            </Button>
          </form>

          {/* divider */}
          <Divider sx={{ my: 4 }} />

          {/* register */}
          <footer className="flex flex-col gap-3 text-center">
            <Typography variant="body2" color="text.secondary">
              Don’t have an account?
            </Typography>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={onCreateAccount}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Create account
            </Button>
          </footer>
        </Paper>
      </section>
      <ForgotPasswordModal
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </>
  );
}
