import { useMemo, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import PatientTable from "../components/PatientTable";
import { useAppStore } from "../app/store";
import type { Patient, BundleChecklist, AuditEvent } from "../app/types";

const emptyBundle = (): BundleChecklist => ({
  neuroMonitoreo: { done: false },
  tamizajeContraindicaciones: { done: false },
  pruebasConfirmatorias: { done: false },
  hemodinamiaEstable: { done: false },
  ventilacionOptimizada: { done: false },
  laboratoriosClave: { done: false },
  consentimientoProceso: { done: false },
});

export default function Pacientes() {
  const { state, dispatch } = useAppStore();

  const [form, setForm] = useState({
    hc: "",
    nombres: "",
    apellidos: "",
    edad: 40,
    sexo: "M",
    servicio: "UCI",
    gcs: 8,
    pupilas: "Reactivas",
    map: 75,
    lactato: 1.6,
    horasDesdeDeteccion: 2,
  });

  const canSave = useMemo(() => {
    return (
      form.hc.trim().length > 0 &&
      form.nombres.trim().length > 0 &&
      form.apellidos.trim().length > 0 &&
      Number(form.edad) > 0
    );
  }, [form]);

  const onSave = () => {
    const id = uuid();
    const now = new Date().toISOString();

    const ev: AuditEvent = {
      id: uuid(),
      patientId: id,
      type: "CREADO",
      at: now,
      by: "UCI-Usuario (demo)",
      title: "Registro de paciente",
      detail: `HC ${form.hc.trim()} - Servicio ${form.servicio}`,
    };

    const nowIso = new Date().toISOString();
    
    const p: Patient = {
      id,
      hc: form.hc.trim(),
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      edad: Number(form.edad),
      sexo: form.sexo as any,
      servicio: form.servicio as any,
      fechaIngreso: now,
      status: "Potencial",
      gcs: Number(form.gcs),
      pupilas: form.pupilas as any,
      map: Number(form.map),
      lactato: Number(form.lactato),
      horasDesdeDeteccion: Number(form.horasDesdeDeteccion),
      bundle: emptyBundle(),
      conversionEtapa: "Detectado",
      tiempoAValidacionHoras: 0,
      sospechaAt: nowIso,
      notificacionAt: nowIso, // o déjalo vacío si quieres simular el flujo paso a paso
      na: 148,
      pfRatio: 320,
      riskEpisodes: { mapLow: 0, naOut: 0, tempLow: 0, pfLow: 0 },
      consentido: false,
      perdidaEvitable: false,

      // ✅ obligatorio ahora por trazabilidad
      events: [ev],
    };

    dispatch({ type: "ADD_PATIENT", payload: p });

    setForm((s) => ({ ...s, hc: "", nombres: "", apellidos: "" }));
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Registrar paciente</Typography>
              <Typography variant="body2" color="text.secondary">
                Registro rápido + variables mínimas para alertas IA simuladas.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.5}>
                <TextField
                  label="Historia clínica (HC)"
                  value={form.hc}
                  onChange={(e) => setForm({ ...form, hc: e.target.value })}
                />
                <TextField
                  label="Nombres"
                  value={form.nombres}
                  onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                />
                <TextField
                  label="Apellidos"
                  value={form.apellidos}
                  onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                />

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      label="Edad"
                      value={form.edad}
                      onChange={(e) => setForm({ ...form, edad: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Sexo"
                      value={form.sexo}
                      onChange={(e) => setForm({ ...form, sexo: e.target.value })}
                    >
                      <MenuItem value="M">M</MenuItem>
                      <MenuItem value="F">F</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  select
                  label="Servicio"
                  value={form.servicio}
                  onChange={(e) => setForm({ ...form, servicio: e.target.value })}
                >
                  <MenuItem value="UCI">UCI</MenuItem>
                  <MenuItem value="Emergencia">Emergencia</MenuItem>
                  <MenuItem value="Intermedios">Intermedios</MenuItem>
                </TextField>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      label="GCS"
                      value={form.gcs}
                      onChange={(e) => setForm({ ...form, gcs: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      label="Pupilas"
                      value={form.pupilas}
                      onChange={(e) => setForm({ ...form, pupilas: e.target.value })}
                    >
                      <MenuItem value="Reactivas">Reactivas</MenuItem>
                      <MenuItem value="Mixtas">Mixtas</MenuItem>
                      <MenuItem value="No reactivas">No reactivas</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      label="MAP"
                      value={form.map}
                      onChange={(e) => setForm({ ...form, map: Number(e.target.value) })}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      type="number"
                      label="Lactato"
                      value={form.lactato}
                      onChange={(e) => setForm({ ...form, lactato: Number(e.target.value) })}
                    />
                  </Grid>
                </Grid>

                <TextField
                  type="number"
                  label="Horas desde detección"
                  value={form.horasDesdeDeteccion}
                  onChange={(e) =>
                    setForm({ ...form, horasDesdeDeteccion: Number(e.target.value) })
                  }
                />

                <Button
                  variant="contained"
                  size="large"
                  disabled={!canSave}
                  onClick={onSave}
                  sx={{ borderRadius: 3, py: 1.2 }}
                >
                  Guardar paciente
                </Button>

                <Typography variant="caption" color="text.secondary">
                  Demo: los datos no reemplazan criterio clínico real.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <PatientTable patients={state.patients} />
        </Grid>
      </Grid>
    </Box>
  );
}
