import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  MenuItem,
  TextField,
  Stack,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Divider,
  Button,
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useAppStore } from "../app/store";
import type { BundleItemKey, AuditEvent, Patient } from "../app/types";
import { v4 as uuid } from "uuid";

const bundleDefs: { key: BundleItemKey; title: string; hint: string }[] = [
  { key: "neuroMonitoreo", title: "Neuro-monitoreo activo", hint: "Vigilancia y registro sistemático." },
  { key: "tamizajeContraindicaciones", title: "Tamizaje contraindicaciones", hint: "Checklist y evidencia." },
  { key: "pruebasConfirmatorias", title: "Pruebas confirmatorias", hint: "Registro del hito y trazabilidad." },
  { key: "hemodinamiaEstable", title: "Estabilización hemodinámica", hint: "Meta operativa por turno." },
  { key: "ventilacionOptimizada", title: "Ventilación optimizada", hint: "Parámetros objetivo." },
  { key: "laboratoriosClave", title: "Laboratorios clave", hint: "Marcación y control." },
  { key: "consentimientoProceso", title: "Proceso de consentimiento", hint: "Avance del flujo." },
];

const labelMap: Record<BundleItemKey, string> = {
  neuroMonitoreo: "Neuro-monitoreo activo",
  tamizajeContraindicaciones: "Tamizaje contraindicaciones",
  pruebasConfirmatorias: "Pruebas confirmatorias",
  hemodinamiaEstable: "Estabilización hemodinámica",
  ventilacionOptimizada: "Ventilación optimizada",
  laboratoriosClave: "Laboratorios clave",
  consentimientoProceso: "Proceso de consentimiento",
};

export default function Bundle() {
  const { state, dispatch } = useAppStore();
  const [patientId, setPatientId] = useState(state.patients[0]?.id ?? "");

  const patient = useMemo(
    () => state.patients.find((p) => p.id === patientId),
    [state.patients, patientId]
  );

  const progress = useMemo(() => {
    if (!patient) return 0;
    const keys = Object.keys(patient.bundle) as BundleItemKey[];
    const done = keys.filter((k) => patient.bundle[k].done).length;
    return Math.round((done / keys.length) * 100);
  }, [patient]);

  const toggle = (k: BundleItemKey) => {
    if (!patient) return;

    const current = patient.bundle[k].done;
    const done = !current;
    const now = new Date().toISOString();

    // ✅ Evento tipado (evita que `type` sea inferido como string)
    const ev: AuditEvent = {
      id: uuid(),
      patientId: patient.id,
      type: "BUNDLE_CHECK",
      at: now,
      by: "UCI-Usuario (demo)",
      title: `${done ? "Marcado" : "Desmarcado"}: ${labelMap[k]}`,
      detail: `Item: ${k}`,
    };

    const next: Patient = {
      ...patient,
      bundle: {
        ...patient.bundle,
        [k]: { done, at: done ? now : undefined },
      },
      // Reglas operativas demo
      status: patient.status === "Potencial" ? "En evaluación" : patient.status,
      conversionEtapa: patient.conversionEtapa === "Detectado" ? "Mantenido" : patient.conversionEtapa,

      // ✅ Bitácora (prepend: último evento arriba)
      events: [ev, ...(patient.events ?? [])],
    };

    dispatch({ type: "UPDATE_PATIENT", payload: next });
  };

  const markValidado = () => {
    if (!patient) return;

    const now = new Date().toISOString();

    const ev: AuditEvent = {
      id: uuid(),
      patientId: patient.id,
      type: "ETAPA_CAMBIO",
      at: now,
      by: "UCI-Usuario (demo)",
      title: "Cambio de etapa: Validado",
      detail: "Acción realizada desde Bundle (demo)",
    };

    const next: Patient = {
      ...patient,
      conversionEtapa: "Validado",
      tiempoAValidacionHoras: Math.max(1, patient.horasDesdeDeteccion + 2),
      status: "En evaluación",
      events: [ev, ...(patient.events ?? [])],
    };

    dispatch({ type: "UPDATE_PATIENT", payload: next });
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Bundle de calidad clínica</Typography>
              <Typography variant="body2" color="text.secondary">
                Checklist trazable por paciente (ideal para auditoría + mejora continua).
              </Typography>

              <Divider sx={{ my: 2 }} />

              <TextField
                select
                fullWidth
                label="Seleccionar paciente"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {state.patients.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.hc} — {p.nombres} {p.apellidos}
                  </MenuItem>
                ))}
              </TextField>

              <Stack sx={{ mt: 2 }}>
                <Typography fontWeight={900}>Progreso</Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{ height: 10, borderRadius: 99, mt: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {progress}% completado
                </Typography>
              </Stack>

              <Button
                onClick={markValidado}
                variant="contained"
                sx={{ mt: 2, borderRadius: 3 }}
                disabled={!patient}
                fullWidth
              >
                Marcar etapa: Validado
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">Checklist</Typography>
              <Typography variant="body2" color="text.secondary">
                Marca/Desmarca para generar trazabilidad del bundle.
              </Typography>

              <Divider sx={{ my: 2 }} />

              {!patient ? (
                <Typography color="text.secondary">No hay pacientes.</Typography>
              ) : (
                <Stack spacing={1}>
                  {bundleDefs.map((b) => (
                    <Card key={b.key} variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={patient.bundle[b.key].done}
                              onChange={() => toggle(b.key)}
                            />
                          }
                          label={
                            <Box>
                              <Typography fontWeight={900}>{b.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {b.hint}
                              </Typography>
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}