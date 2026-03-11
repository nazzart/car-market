"use client";

import { Button } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { useRouter } from "next/navigation";

export default function ProfileCreatedPage() {
  const router = useRouter();

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6">

      <div className="max-w-md w-full text-center">

        {/* success icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircleOutlineIcon
              sx={{ fontSize: 48, color: "#16a34a" }}
            />
          </div>
        </div>

        {/* title */}
        <h1 className="text-2xl font-semibold mb-3">
          Profile created successfully
        </h1>

        {/* message */}
        <p className="text-gray-500 mb-8">
          Your account is ready. You can now create your first listing
          or manage your profile in your account area.
        </p>

        {/* main actions */}
        <div className="flex flex-col gap-3">

          <Button
            variant="contained"
            size="large"
            startIcon={<DirectionsCarFilledIcon />}
            onClick={() => router.push("/sell")}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Create listing
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<PersonOutlineIcon />}
            onClick={() => router.push("/account")}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Go to my account
          </Button>

        </div>

        {/* secondary action */}
        <div className="mt-6 text-sm text-gray-500">
          <button
            className="hover:underline"
            onClick={() => router.push("/")}
          >
            Browse cars instead
          </button>
        </div>

      </div>

    </section>
  );
}