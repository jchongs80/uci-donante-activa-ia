import { useMemo, useState } from "react";
import {
  Card, CardContent, Chip, Stack, TextField, Typography,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import type { Patient } from "../app/types";

export default function PatientTable(props: {
  patients: Patient[];
  rightSlot?: React.ReactNode;
  onInspect?: (p: Patient) => void;
}) {
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const filtered = !qq
      ? props.patients
      : props.patients.filter((p) =>
          `${p.hc} ${p.nombres} ${p.apellidos}`.toLowerCase().includes(qq)
        );

    return filtered;
  }, [q, props.patients]);

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
          <div>
            <Typography variant="h6">Pacientes (trazabilidad)</Typography>
            <Typography variant="body2" color="text.secondary">
              Búsqueda rápida + estado + etapa de conversión.
            </Typography>
          </div>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              size="small"
              placeholder="Buscar por HC / nombre…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {props.rightSlot}
          </Stack>
        </Stack>

        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell><b>HC</b></TableCell>
              <TableCell><b>Paciente</b></TableCell>
              <TableCell><b>Servicio</b></TableCell>
              <TableCell><b>Estado</b></TableCell>
              <TableCell><b>Etapa</b></TableCell>
              <TableCell align="right"><b>Acción</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.hc}</TableCell>
                <TableCell>
                  <b>{p.nombres}</b> {p.apellidos}
                  <Typography variant="caption" display="block" color="text.secondary">
                    {p.edad} años · {p.sexo}
                  </Typography>
                </TableCell>
                <TableCell>{p.servicio}</TableCell>
                <TableCell>
                  <Chip
                    label={p.status}
                    size="small"
                    color={
                      p.status === "Donante efectivo" ? "success" :
                      p.status === "No apto" ? "default" :
                      p.status === "En evaluación" ? "warning" : "info"
                    }
                  />
                </TableCell>
                <TableCell>
                  <Chip label={p.conversionEtapa} size="small" variant="outlined" />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver detalle">
                    <IconButton onClick={() => props.onInspect?.(p)}>
                      <VisibilityRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary">Sin resultados.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}