import { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  AppBar, Box, Chip, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Typography, Paper, Stack
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import CrisisAlertRoundedIcon from "@mui/icons-material/CrisisAlertRounded";
import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";

const drawerW = 300;

const menu = [
  { to: "/dashboard", label: "Dashboard", icon: <DashboardRoundedIcon /> },
  { to: "/pacientes", label: "Registro de pacientes", icon: <PersonAddAltRoundedIcon /> },
  { to: "/bundle", label: "Calidad clínica (Bundle)", icon: <FactCheckRoundedIcon /> },
  { to: "/impacto", label: "Resultado (Impacto)", icon: <InsightsRoundedIcon /> },
  { to: "/alertas", label: "Alertas y priorización (IA)", icon: <CrisisAlertRoundedIcon /> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const title = useMemo(() => {
    const found = menu.find((m) => m.to === location.pathname);
    return found?.label ?? "UCI Donante Activa–IA";
  }, [location.pathname]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: "rgba(246,248,251,0.75)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(15,23,42,0.06)" }}>
        <Toolbar sx={{ gap: 2 }}>
          <Paper sx={{ px: 1.5, py: 0.75, borderRadius: 999, display: "flex", alignItems: "center", gap: 1 }}>
            <LocalHospitalRoundedIcon color="primary" />
            <Typography fontWeight={900}>UCI Donante Activa–IA</Typography>
          </Paper>

          <Typography variant="h6" sx={{ flex: 1, fontWeight: 900 }}>
            {title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label="Hospital Lima Este – Ate Vitarte" variant="outlined" />
            
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerW,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerW,
            boxSizing: "border-box",
            borderRight: "1px solid rgba(15,23,42,0.06)",
            bgcolor: "#fff",
          },
        }}
      >
        <Toolbar />
        

        <List sx={{ px: 1 }}>
          {menu.map((m) => (
            <ListItemButton
              key={m.to}
              component={NavLink}
              to={m.to}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 3,
                "&.active": {
                  bgcolor: "rgba(31,111,235,0.10)",
                  "& .MuiListItemIcon-root": { color: "primary.main" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{m.icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontWeight: 800 }} primary={m.label} />
            </ListItemButton>
          ))}
        </List>

        
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 3, pt: 11 }}>
        {children}
      </Box>
    </Box>
  );
}