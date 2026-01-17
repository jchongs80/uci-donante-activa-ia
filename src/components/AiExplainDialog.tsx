import { Dialog, DialogContent, DialogTitle, Divider, Stack, Typography, Chip } from "@mui/material";
import type { AlertItem, Patient } from "../app/types";

export default function AiExplainDialog(props: {
  open: boolean;
  onClose: () => void;
  alert?: AlertItem;
  patient?: Patient;
}) {
  const { alert, patient } = props;

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 900 }}>
        Explicación de priorización IA (simulada)
      </DialogTitle>
      <DialogContent>
        {!alert || !patient ? (
          <Typography color="text.secondary">Selecciona una alerta.</Typography>
        ) : (
          <>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={900}>
                {patient.hc} — {patient.nombres} {patient.apellidos}
              </Typography>
              <Chip label={`Score ${alert.score}`} color={alert.prioridad === "Alta" ? "error" : alert.prioridad === "Media" ? "warning" : "success"} />
              <Chip label={`Prioridad ${alert.prioridad}`} variant="outlined" />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              Esta “IA” es una simulación para demo: combina oportunidad + calidad del bundle + señales clínicas básicas.
            </Typography>

            <Stack sx={{ mt: 2 }} spacing={1}>
              {alert.razones.map((r) => (
                <Stack key={r.label} direction="row" justifyContent="space-between">
                  <Typography fontWeight={800}>{r.label}</Typography>
                  <Typography color="text.secondary">Peso {Math.round(r.weight)}</Typography>
                </Stack>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight={900}>Sugerencia operativa</Typography>
            <Typography color="text.secondary" variant="body2">
              En prioridad alta, revisa: estabilización hemodinámica, bundle incompleto y tiempos (cuellos de botella).
            </Typography>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}