import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1f6feb" },
    secondary: { main: "#6e56cf" },
    background: {
      default: "#f6f8fb",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial`,
    h5: { fontWeight: 800, letterSpacing: -0.3 },
    h6: { fontWeight: 800, letterSpacing: -0.2 },
    button: { fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 8px 28px rgba(16, 24, 40, 0.08)",
        },
      },
    },
  },
});