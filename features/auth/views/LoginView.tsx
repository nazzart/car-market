"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";

import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type Props = {
  onForgotPassword: () => void;
  onCreateAccount: () => void;
};

export default function LoginView({
  onForgotPassword,
  onCreateAccount,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* header */}
      <header className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Sign in to your account
        </p>
      </header>

      {/* form */}
      <div className="flex flex-col gap-5">
        <TextField
          label="Email"
          value={email}
          fullWidth
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MailOutlineIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

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
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* forgot password */}
        <div className="flex justify-between items-center">
          <div />

          <button
            onClick={onForgotPassword}
            className="text-sm text-gray-500 hover:text-gray-900 hover:underline transition"
          >
            Forgot password?
          </button>
        </div>

        {/* sign in */}
        <Button
          variant="contained"
          size="large"
          disabled={!email || !password}
        >
          Sign in
        </Button>
      </div>

      <Divider sx={{ my: 4 }} />

      {/* create account */}
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm text-gray-500">
          Don’t have an account?
        </p>

        <Button
          variant="contained"
          size="large"
          color="success"
          fullWidth
          onClick={onCreateAccount}
        >
          Create account
        </Button>
      </div>
    </>
  );
}