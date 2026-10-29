// Тема MUI. MUI используется только для сложных элементов — поля ввода, выпадающие списки, меню, Popover,
// Drawer, Tooltip — и оформляется здесь, а не через sx в компонентах. Кнопки, окна (Dialog) и уведомления —
// общие компоненты из components/ui (Button, Dialog, useToast), они уже в стиле сайта
import { createTheme } from "@mui/material/styles";
import { colors } from "../lib/colors";

export const theme = createTheme({
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },

  palette: {
    success: {
      main: "#10B981", // modern emerald

      contrastText: "#ffffff",
    },
    primary: {
      main: colors.primary,
      dark: colors.primaryHover,
      contrastText: "#fff",
    },
  },

  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
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
