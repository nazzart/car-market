// lib/theme.ts
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    background: {
      default: "#f5f5f7",
    },
  },
  components: {
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
