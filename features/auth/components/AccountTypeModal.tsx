"use client";

import { Paper, Typography, Button } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import BusinessIcon from "@mui/icons-material/Business";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (type: "individual" | "company") => void;
};

export default function AccountTypeModal({ open, onClose, onSelect }: Props) {
  const [selected, setSelected] = useState<"individual" | "company" | null>(
    null
  );

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
        className="relative w-full max-w-[540px] rounded-3xl p-10 shadow-xl animate-[modalIn_.18s_ease-out]"
      >
        {/* header */}
        <header className="text-center mb-8">
          <Typography variant="h5" fontWeight={600}>
            Create account
          </Typography>

          <Typography color="text.secondary">
            Who are you registering as?
          </Typography>
        </header>

        {/* cards */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Individual */}
          <button
            onClick={() => setSelected("individual")}
            className={`group flex items-start gap-4 border rounded-xl p-5 text-left transition
            ${
              selected === "individual"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-400 hover:bg-gray-50"
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full
              ${
                selected === "individual"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-500"
              }`}
            >
              <PersonOutlineIcon fontSize="small" />
            </div>

            <div>
              <Typography fontWeight={600}>Individual</Typography>

              <Typography variant="body2" className="text-gray-500">
                Selling as a private person.
              </Typography>
            </div>
          </button>

          {/* Company */}
          <button
            onClick={() => setSelected("company")}
            className={`group flex items-start gap-4 border rounded-xl p-5 text-left transition
            ${
              selected === "company"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-red-400 hover:bg-gray-50"
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full
              ${
                selected === "company"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-500"
              }`}
            >
              <BusinessIcon fontSize="small" />
            </div>

            <div>
              <Typography fontWeight={600}>Company</Typography>

              <Typography variant="body2" className="text-gray-500">
                Selling on behalf of a registered business.
              </Typography>
            </div>
          </button>
        </div>

        {/* action */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={!selected}
          onClick={() => selected && onSelect(selected)}
          sx={{
            backgroundColor: "#ef4444",
            "&:hover": { backgroundColor: "#dc2626" },
          }}
        >
          Continue
        </Button>
      </Paper>
    </section>
  );
}
