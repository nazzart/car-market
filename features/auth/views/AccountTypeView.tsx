"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

type Props = {
  onSelect: (type: "individual" | "company") => void;
};

export default function AccountTypeView({ onSelect }: Props) {
  const [selected, setSelected] = useState<"individual" | "company" | null>(
    null
  );

  return (
    <>
      {/* header */}
      <header className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Create account
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Who are you registering as?
        </p>
      </header>

      {/* account type cards */}
      <div className="flex flex-col gap-4 mb-8">
        {/* individual */}
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
            <h3 className="text-sm font-semibold text-gray-900">
              Individual
            </h3>

            <p className="text-sm text-gray-500">
              Selling as a private person.
            </p>
          </div>
        </button>

        {/* company */}
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
            <DirectionsCarIcon fontSize="small" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Company
            </h3>

            <p className="text-sm text-gray-500">
              Selling on behalf of a registered business.
            </p>
          </div>
        </button>
      </div>

      {/* continue button */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
      >
        Continue
      </Button>
    </>
  );
}