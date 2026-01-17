import { useMemo } from "react";
import { Box, Card, CardContent, Typography, Divider } from "@mui/material";
import Grid from "@mui/material/GridLegacy";
import { useAppStore } from "../app/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import StatCard from "../components/StatCard";

export default function Impacto() {
  const { state } = useAppStore();

  const metrics = useMemo(() => {
    const total = state.patients.length;
    const efectivos = state.patients.filter((p) => p.conversionEtapa === "Efectivo" || p.status === "Donante efectivo").length;
    const validado = state.patients.filter((p) => p.conversionEtapa === "Validado").length;
    const descartado = state.patients.filter((p) => p.conversionEtapa === "Descartado" || p.status === "No apto").length;

    const tasa = total ? Math.round((efectivos / total) * 100) : 0;

    const serie = [
      { name: "D-2", conversion: Math.max(0, tasa - 8) },
      { name: "D-1", conversion: Math.max(0, tasa - 4) },
      { name: "Hoy", conversion: tasa },
    ];

    const etapas = ["Detectado", "Mantenido", "Referido", "Validado", "Efectivo", "Descartado"] as const;
    const dist = etapas.map((e) => ({
      etapa: e,
      count: state.patients.filter((p) => p.conversionEtapa === e).length,
    }));

    return { total, efectivos, validado, descartado, tasa, serie, dist };
  }, [state.patients]);

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard title="Conversión" value={`${metrics.tasa}%`} subtitle="Donante efectivo / cohorte" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Validado" value={`${metrics.validado}`} subtitle="Listo para gestión final" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Efectivo" value={`${metrics.efectivos}`} subtitle="Conversión lograda" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Descartado/No apto" value={`${metrics.descartado}`} subtitle="Criterios no cumplidos" />
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tendencia de conversión</Typography>
              <Typography variant="body2" color="text.secondary">
                Gráfico para gerencia: muestra evolución.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.serie}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RTooltip />
                    <Line type="monotone" dataKey="conversion" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Distribución por etapa</Typography>
              <Typography variant="body2" color="text.secondary">
                Dónde se “atasca” el flujo (cuello de botella).
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.dist}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="etapa" />
                    <YAxis />
                    <RTooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}