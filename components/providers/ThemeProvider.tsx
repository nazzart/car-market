"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/lib/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

type AppThemeProviderProps = {
  children: React.ReactNode;
};

export default function AppThemeProvider({
  children,
}: AppThemeProviderProps) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
