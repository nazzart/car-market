"use client";

import Container from "@/components/layout/Container";
import ListingsGrid from "@/features/listings/components/ListingsGrid";
import { Button, TextField, Select, MenuItem } from "@mui/material";

export default function Page() {
  return (
    <Container>
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8 mt-10">
        <div>
          <h1 className="text-3xl font-semibold">My Listings</h1>

          <p className="text-gray-500">Manage and edit your vehicle listings</p>
        </div>

        <Button variant="contained">+ Create Listing</Button>
      </div>

      {/* SEARCH + FILTER */}

      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 max-w-xl">
          <TextField placeholder="Search listings..." size="small" fullWidth />
        </div>

        <Select size="small" defaultValue="all">
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="sold">Sold</MenuItem>
        </Select>

        <Select size="small" defaultValue="newest">
          <MenuItem value="newest">Newest</MenuItem>
          <MenuItem value="price">Price</MenuItem>
        </Select>
      </div>

      <ListingsGrid />
    </Container>
  );
}
