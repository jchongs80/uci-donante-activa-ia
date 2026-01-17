import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Stack,
  Chip,
  Divider,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import type { Patient, BundleItemKey } from "../app/types";

const drawerW = 520;

const bundleLabel: Record<BundleItemKey, string> = {
  neuroMonitoreo: "Neuro-monitoreo activo",
  tamizajeContraindicaciones: "Tamizaje contraindicaciones",
  pruebasConfirmatorias: "Pruebas confirmatorias",
  hemodinamiaEstable: "Estabilización hemodinámica",
  ventilacionOptimizada: "Ventilación optimizada",
  laboratoriosClave: "Laboratorios clave",
  consentimientoProceso: "Proceso de consentimiento",
};

export default function PatientDrawer(props: {
  open: boolean;
  onClose: () => void;
  patient: Patient | null;
}) {
  const p = props.patient;

  const bundlePct = (() => {
    if (!p) return 0;
    const keys = Object.keys(p.bundle) as BundleItemKey[];
    const done = keys.filter((k) => p.bundle[k].done).length;
    return Math.round((done / keys.length) * 100);
  })();

  return (
    <Drawer anchor="right" open={props.open} onClose={props.onClose}>
      <Box sx={{ width: drawerW, p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={900}>
            Ficha de paciente
          </Typography>
          <IconButton onClick={props.onClose}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {!p ? (
          <Typography color="text.secondary">Selecciona un paciente.</Typography>
        ) : (
          <>
            <Stack spacing={0.75}>
              <Typography fontWeight={900}>
                {p.hc} — {p.nombres} {p.apellidos}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.edad} años · {p.sexo} · {p.servicio}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                <Chip label={`Estado: ${p.status}`} />
                <Chip label={`Etapa: ${p.conversionEtapa}`} variant="outlined" />
              </Stack>
            </Stack>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography fontWeight={900}>Bundle (calidad clínica)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Progreso y trazabilidad por paciente.
                </Typography>

                <LinearProgress
                  variant="determinate"
                  value={bundlePct}
                  sx={{ height: 10, borderRadius: 99, mt: 2 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {bundlePct}% completado
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1}>
                  {(Object.keys(p.bundle) as BundleItemKey[]).map((k) => (
                    <Stack key={k} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={800}>{bundleLabel[k]}</Typography>
                      <Chip
                        size="small"
                        label={p.bundle[k].done ? "OK" : "Pendiente"}
                        color={p.bundle[k].done ? "success" : "default"}
                        variant={p.bundle[k].done ? "filled" : "outlined"}
                      />
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography fontWeight={900}>Timeline (bitácora)</Typography>
                <Typography variant="body2" color="text.secondary">
                  Eventos recientes (demo).
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.2}>
                  {(p.events ?? []).slice(0, 12).map((ev) => (
                    <Card key={ev.id} variant="outlined" sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <div>
                            <Typography fontWeight={900}>{ev.title}</Typography>
                            {ev.detail && (
                              <Typography variant="body2" color="text.secondary">
                                {ev.detail}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {ev.by}
                            </Typography>
                          </div>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(ev.at).toLocaleString()}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}

                  {(!p.events || p.events.length === 0) && (
                    <Typography color="text.secondary">Sin eventos aún.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Box>
    </Drawer>
  );
}