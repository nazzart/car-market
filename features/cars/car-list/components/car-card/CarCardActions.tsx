"use client";

import { IconButton, Tooltip } from "@mui/material";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";

export default function CarCardActions() {
  return (
    <div
      className="flex flex-col items-end gap-2"
      onClick={(e) => e.preventDefault()}
    >
      <div className="flex gap-1">
        <Tooltip title="Add to favorites" arrow>
          <IconButton
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                color: "#111827",
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <FavoriteBorderIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Compare car" arrow>
          <IconButton
            size="small"
            sx={{
              color: "#6b7280",
              "&:hover": {
                color: "#111827",
                backgroundColor: "#f3f4f6",
              },
            }}
          >
            <CompareArrowsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}