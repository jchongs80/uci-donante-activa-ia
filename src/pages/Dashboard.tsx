import { useMemo, useState } from "react";
import { Box, Chip, Stack } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import StatCard from "../components/StatCard";
import PatientTable from "../components/PatientTable";
import { useAppStore } from "../app/store";
import type { Patient } from "../app/types";
import PatientDrawer from "../components/PatientDrawer";

export default function Dashboard() {
  const { state } = useAppStore();

  // ✅ Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);

  const kpis = useMemo(() => {
    const total = state.patients.length;
    const potencial = state.patients.filter((p) => p.status === "Potencial").length;
    const evaluacion = state.patients.filter((p) => p.status === "En evaluación").length;
    const efectivos = state.patients.filter((p) => p.status === "Donante efectivo").length;

    const validado = state.patients.filter((p) => p.conversionEtapa === "Validado").length;
    const referido = state.patients.filter((p) => p.conversionEtapa === "Referido").length;

    return { total, potencial, evaluacion, efectivos, validado, referido };
  }, [state.patients]);

  const handleInspect = (p: Patient) => {
    setSelected(p);
    setDrawerOpen(true);
  };

  // Si el paciente cambia en store (por updates) y está abierto el drawer,
  // mantenemos “selected” actualizado.
  const selectedFresh = useMemo(() => {
    if (!selected) return null;
    return state.patients.find((x) => x.id === selected.id) ?? selected;
  }, [state.patients, selected]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard title="Pacientes en trazabilidad" value={`${kpis.total}`} subtitle="Cohorte activa" />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Potenciales"
            value={`${kpis.potencial}`}
            subtitle="Detección inicial"
            right={<Chip label="Detección" color="info" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="En evaluación"
            value={`${kpis.evaluacion}`}
            subtitle="En proceso clínico-operativo"
            right={<Chip label="Proceso" color="warning" />}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard
            title="Donante efectivo"
            value={`${kpis.efectivos}`}
            subtitle="Conversión lograda"
            right={<Chip label="Impacto" color="success" />}
          />
        </Grid>

        <Grid item xs={12}>
          <PatientTable
            patients={state.patients}
            onInspect={handleInspect} // ✅ Aquí conectas “ver detalle”
            rightSlot={
              <Stack direction="row" spacing={1}>
                <Chip label={`Referido ${kpis.referido}`} variant="outlined" />
                <Chip label={`Validado ${kpis.validado}`} variant="outlined" />
              </Stack>
            }
          />
        </Grid>
      </Grid>

      {/* ✅ Drawer premium con ficha + timeline */}
      <PatientDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        patient={selectedFresh}
      />
    </Box>
  );
}