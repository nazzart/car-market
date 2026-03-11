// lib/theme.ts
import { createTheme } from "@mui/material/styles";
import { colors } from "../lib/colors";

export const theme = createTheme({
  palette: {
    success: {
      main: "#10B981", // modern emerald

      contrastText: "#ffffff",
    },
    primary: {
      main: "#2563EB",

      contrastText: "#fff",
    },
    secondary: {
      main: "#FF5A5F",
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          textTransform: "none",
          borderRadius: 10,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#000",
          color: "#fff",
          fontSize: "0.875rem",
        },
        arrow: {
          color: "#000",
        },
      },
    },
  },
});
