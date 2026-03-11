"use client"

import { useState } from "react"
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material"

import MoreVertIcon from "@mui/icons-material/MoreVert"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import SellIcon from "@mui/icons-material/Sell"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import DeleteIcon from "@mui/icons-material/Delete"

export default function ListingMenu() {

  const [anchorEl, setAnchorEl] =
    useState<null | HTMLElement>(null)

  const open = Boolean(anchorEl)

  const handleOpen = (
    event: React.MouseEvent<HTMLElement>
  ) => setAnchorEl(event.currentTarget)

  const handleClose = () => setAnchorEl(null)

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(6px)",
          "&:hover": {
            background: "white"
          }
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 180,
            boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            padding: "6px"
          }
        }}
      >

        <MenuItem onClick={handleClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#6b7280" }}>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="View listing" />
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#6b7280" }}>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#6b7280" }}>
            <ContentCopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Duplicate" />
        </MenuItem>

        <MenuItem onClick={handleClose} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ color: "#6b7280" }}>
            <SellIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Mark as sold" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleClose}
          sx={{ borderRadius: 2, color: "#dc2626" }}
        >
          <ListItemIcon sx={{ color: "#dc2626" }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>

      </Menu>
    </>
  )
}