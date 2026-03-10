"use client";

import { TextField } from "@mui/material";

type Props = {
  labelFrom: string;
  labelTo: string;
};

export default function RangeFilter({ labelFrom, labelTo }: Props) {
  return (
    <div className="flex gap-3">
      <TextField
        label={labelFrom}
        size="small"
        className="!bg-white"
        fullWidth
      />
      <TextField label={labelTo} size="small" className="!bg-white" fullWidth />
    </div>
  );
}
