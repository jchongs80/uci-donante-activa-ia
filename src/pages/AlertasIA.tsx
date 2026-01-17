import { useMemo, useState } from "react";
import { Box, Card, CardContent, Typography, Chip, Stack, Button, Divider, IconButton, Tooltip } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useAppStore } from "../app/store";
import { computeAiAlert } from "../app/ai";
import AiExplainDialog from "../components/AiExplainDialog";

export default function AlertasIA() {
  const { state } = useAppStore();
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");

  const alerts = useMemo(() => {
    // tick fuerza “refresh” en demo
    void tick;
    return state.patients
      .filter((p) => p.status !== "No apto")
      .map((p) => computeAiAlert(p))
      .sort((a, b) => b.score - a.score);
  }, [state.patients, tick]);

  const selected = useMemo(() => alerts.find((a) => a.patientId === selectedId), [alerts, selectedId]);
  const patient = useMemo(() => state.patients.find((p) => p.id === selectedId), [state.patients, selectedId]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={2}>
                <div>
                  <Typography variant="h6">Alertas y priorización (IA simulada)</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cola operativa: quién atender primero y por qué (explicable).
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip icon={<AutoAwesomeRoundedIcon />} label="IA: simulación" color="secondary" variant="outlined" />
                  <Tooltip title="Recalcular scores (demo)">
                    <IconButton onClick={() => setTick((t) => t + 1)}>
                      <RefreshRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card>
            <CardContent>
              <Typography variant="h6">Cola de trabajo</Typography>
              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.2}>
                {alerts.map((a) => {
                  const p = state.patients.find((x) => x.id === a.patientId)!;
                  const color =
                    a.prioridad === "Alta" ? "error" : a.prioridad === "Media" ? "warning" : "success";
                  const active = selectedId === a.patientId;

                  return (
                    <Card
                      key={a.patientId}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderColor: active ? "primary.main" : "rgba(15,23,42,0.12)",
                        bgcolor: active ? "rgba(31,111,235,0.06)" : "#fff",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedId(a.patientId)}
                    >
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <div>
                            <Typography fontWeight={900}>
                              {p.hc} — {p.nombres} {p.apellidos}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Etapa: {p.conversionEtapa} · Bundle:{" "}
                              {Math.round(
                                (Object.values(p.bundle).filter((b) => b.done).length /
                                  Object.keys(p.bundle).length) *
                                  100
                              )}
                              %
                            </Typography>
                          </div>
                          <Stack alignItems="flex-end" spacing={0.5}>
                            <Chip label={`Score ${a.score}`} color={color as any} />
                            <Chip label={a.prioridad} size="small" variant="outlined" />
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}

                {!alerts.length && (
                  <Typography color="text.secondary">No hay alertas.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Card>
            <CardContent>
              <Typography variant="h6">Detalle de priorización</Typography>
              <Typography variant="body2" color="text.secondary">
                “Explicabilidad” (razones top).
              </Typography>

              <Divider sx={{ my: 2 }} />

              {!selected || !patient ? (
                <Typography color="text.secondary">Selecciona un paciente en la cola.</Typography>
              ) : (
                <>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={900}>
                      {patient.hc} — {patient.nombres} {patient.apellidos}
                    </Typography>
                    <Chip label={`Prioridad ${selected.prioridad}`} />
                    <Chip label={`Score ${selected.score}`} color={selected.prioridad === "Alta" ? "error" : selected.prioridad === "Media" ? "warning" : "success"} />
                  </Stack>

                  <Stack sx={{ mt: 2 }} spacing={1}>
                    {selected.razones.map((r) => (
                      <Card key={r.label} variant="outlined" sx={{ borderRadius: 3 }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between">
                            <Typography fontWeight={900}>{r.label}</Typography>
                            <Typography color="text.secondary">Peso {Math.round(r.weight)}</Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>

                  <Button sx={{ mt: 2, borderRadius: 3 }} variant="contained" onClick={() => setOpen(true)}>
                    Ver explicación completa
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <AiExplainDialog open={open} onClose={() => setOpen(false)} alert={selected} patient={patient} />
    </Box>
  );
}