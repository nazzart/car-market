"use client";

import { useState } from "react";
import Link from "next/link";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";

type Props = {
  isLoggedIn: boolean;
  onLoginClick: () => void;
};

export default function UserMenu({ isLoggedIn , onLoginClick}: Props) {

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  if (!isLoggedIn) {
    return (
      <button
        onClick={onLoginClick}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-black"
      >
        <PersonOutlineIcon fontSize="small" />
        Войти
      </button>
    );
  }

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        className="border border-gray-200"
      >
        <PersonOutlineIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 220,
            boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
            padding: "6px"
          }
        }}
      >
        <MenuItem
          component={Link}
          href="/account/listings"
          onClick={() => setAnchorEl(null)}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <DirectionsCarIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Listings</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          href="/favorites"
          onClick={() => setAnchorEl(null)}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <FavoriteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Favorites</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          href="/account/profile"
          onClick={() => setAnchorEl(null)}
          sx={{ borderRadius: 2 }}
        >
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Account</ListItemText>
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          sx={{ borderRadius: 2, color: "#dc2626" }}
        >
          <ListItemIcon sx={{ color: "#dc2626" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>

      </Menu>
    </>
  );
}