import { useMemo, useState } from "react";
import {
  Box,
  Chip,
  Stack,
  Typography,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/GridLegacy";
import StatCard from "../components/StatCard";
import PatientTable from "../components/PatientTable";
import PatientDrawer from "../components/PatientDrawer";
import { useAppStore } from "../app/store";
import type { Patient } from "../app/types";

// Helpers
const hoursDiff = (later?: string, earlier?: string) => {
  if (!later || !earlier) return null;
  const ms = new Date(later).getTime() - new Date(earlier).getTime();
  if (Number.isNaN(ms)) return null;
  return ms / (1000 * 60 * 60);
};

const avg = (arr: (number | null)[]) => {
  const xs = arr.filter((x): x is number => typeof x === "number" && !Number.isNaN(x));
  if (xs.length === 0) return null;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
};

const pct = (num: number, den: number) => (den <= 0 ? 0 : Math.round((num / den) * 100));
const fmtNum = (x: number | null, digits = 1) => (x === null ? "—" : x.toFixed(digits));
const fmtPct = (x: number | null) => (x === null ? "—" : `${Math.round(x)}%`);

export default function Dashboard() {
  const { state } = useAppStore();

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);

  const handleInspect = (p: Patient) => {
    setSelected(p);
    setDrawerOpen(true);
  };

  const selectedFresh = useMemo(() => {
    if (!selected) return null;
    return state.patients.find((x) => x.id === selected.id) ?? selected;
  }, [state.patients, selected]);

  // Accordions
  const [expanded, setExpanded] = useState<"proc" | "cal" | "imp" | false>(false);

  const kpis = useMemo(() => {
    const pts = state.patients;

    const total = pts.length;
    const potencial = pts.filter((p) => p.status === "Potencial").length;
    const evaluacion = pts.filter((p) => p.status === "En evaluación").length;
    const efectivos = pts.filter((p) => p.status === "Donante efectivo").length;

    const validado = pts.filter((p) => p.conversionEtapa === "Validado").length;
    const referido = pts.filter((p) => p.conversionEtapa === "Referido").length;

    // Proceso
    const T1_STD_H = 1;
    const T2_STD_H = 1;
    const T3_STD_H = 6;

    const t1Arr = pts.map((p) => hoursDiff((p as any).notificacionAt, (p as any).sospechaAt));
    const t2Arr = pts.map((p) => hoursDiff((p as any).inicioProtocoloAt, (p as any).notificacionAt));
    const t3Arr = pts.map((p) => hoursDiff((p as any).confirmacionMEAt, (p as any).inicioProtocoloAt));

    const t1Avg = avg(t1Arr);
    const t2Avg = avg(t2Arr);
    const t3Avg = avg(t3Arr);

    const casosConT = pts.filter((p) => (p as any).sospechaAt && (p as any).notificacionAt && (p as any).inicioProtocoloAt && (p as any).confirmacionMEAt);
    const slaOk = casosConT.filter((p) => {
      const T1 = hoursDiff((p as any).notificacionAt, (p as any).sospechaAt) ?? 999;
      const T2 = hoursDiff((p as any).inicioProtocoloAt, (p as any).notificacionAt) ?? 999;
      const T3 = hoursDiff((p as any).confirmacionMEAt, (p as any).inicioProtocoloAt) ?? 999;
      return T1 <= T1_STD_H && T2 <= T2_STD_H && T3 <= T3_STD_H;
    }).length;

    const slaPct = casosConT.length > 0 ? pct(slaOk, casosConT.length) : null;

    // Calidad
    const bundleAvg = (() => {
      if (pts.length === 0) return 0;
      const percents = pts.map((p) => {
        const keys = Object.keys(p.bundle) as (keyof typeof p.bundle)[];
        const done = keys.filter((k) => p.bundle[k].done).length;
        return keys.length ? (done / keys.length) * 100 : 0;
      });
      return avg(percents) ?? 0;
    })();

    const riesgoPorCaso = avg(
      pts.map((p) => {
        const r = (p as any).riskEpisodes as { mapLow?: number; naOut?: number; tempLow?: number; pfLow?: number } | undefined;
        if (!r) return 0;
        return (r.mapLow ?? 0) + (r.naOut ?? 0) + (r.tempLow ?? 0) + (r.pfLow ?? 0);
      })
    ) ?? 0;

    const NA_OBJ = 150;
    const PF_OBJ = 300;

    const casosConNa = pts.filter((p) => typeof (p as any).na === "number");
    const hiperna = casosConNa.filter((p) => ((p as any).na as number) > NA_OBJ).length;
    const hipernaPct = casosConNa.length > 0 ? pct(hiperna, casosConNa.length) : null;

    const casosConPF = pts.filter((p) => typeof (p as any).pfRatio === "number");
    const hipox = casosConPF.filter((p) => ((p as any).pfRatio as number) < PF_OBJ).length;
    const hipoxPct = casosConPF.length > 0 ? pct(hipox, casosConPF.length) : null;

    // Impacto
    const convPotEf = potencial > 0 ? pct(efectivos, potencial) : 0;

    const consentidos = pts.filter((p) => Boolean((p as any).consentido)).length;
    const convConsEf = consentidos > 0 ? pct(efectivos, consentidos) : null;

    const perdidasEv = pts.filter((p) => Boolean((p as any).perdidaEvitable)).length;
    const perdidasEvPct = potencial > 0 ? pct(perdidasEv, potencial) : null;

    const trazCompleta = pts.filter((p) => (p.events?.length ?? 0) > 0).length;
    const trazPct = total > 0 ? pct(trazCompleta, total) : 0;

    return {
      total, potencial, evaluacion, efectivos, validado, referido,
      t1Avg, t2Avg, t3Avg, slaPct,
      bundleAvg, riesgoPorCaso, hipernaPct, hipoxPct,
      convPotEf, convConsEf, perdidasEvPct, trazPct
    };
  }, [state.patients]);

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: 2, pb: 3 }}>
      <Grid container spacing={2}>
        {/* Header */}
        <Grid item xs={12}>
          <Typography variant="h6" fontWeight={900}>
            Dashboard UCI Donante Activa–IA
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vigilancia, trazabilidad y analítica predictiva simulada.
          </Typography>
          <Divider sx={{ mt: 1.5 }} />
        </Grid>

        {/* KPIs TOP: solo 4 (compacto) */}
        <Grid item xs={12} md={3}>
          <StatCard title="Pacientes" value={`${kpis.total}`} subtitle="Cohorte activa" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Potenciales" value={`${kpis.potencial}`} subtitle="Detección" right={<Chip label="Proceso" color="warning" />} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Bundle prom." value={`${Math.round(kpis.bundleAvg)}%`} subtitle="Calidad" right={<Chip label="Calidad" color="info" />} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Conv. Pot→Ef" value={`${kpis.convPotEf}%`} subtitle="Impacto" right={<Chip label="Impacto" color="success" />} />
        </Grid>

        {/* Secciones plegables */}
        <Grid item xs={12}>
          <Accordion
            expanded={expanded === "proc"}
            onChange={(_, isExp) => setExpanded(isExp ? "proc" : false)}
            sx={{ borderRadius: 3, overflow: "hidden" }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Proceso" color="warning" />
                <Typography fontWeight={900}>KPIs de tiempo</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <StatCard title="T1 Prom (h)" value={fmtNum(kpis.t1Avg)} subtitle="Sospecha → Notificación" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="T2 Prom (h)" value={fmtNum(kpis.t2Avg)} subtitle="Notificación → Inicio protocolo" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="T3 Prom (h)" value={fmtNum(kpis.t3Avg)} subtitle="Inicio → Confirmación ME" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="SLA Cumplido" value={fmtPct(kpis.slaPct)} subtitle="Dentro del estándar" />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "cal"}
            onChange={(_, isExp) => setExpanded(isExp ? "cal" : false)}
            sx={{ borderRadius: 3, overflow: "hidden", mt: 1.5 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Calidad" color="info" />
                <Typography fontWeight={900}>KPIs clínicos</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <StatCard title="Bundle prom." value={`${Math.round(kpis.bundleAvg)}%`} subtitle="Cumplimiento bundle" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="Riesgo / caso" value={kpis.riesgoPorCaso.toFixed(1)} subtitle="Episodios" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="Hipernatremia" value={fmtPct(kpis.hipernaPct)} subtitle="Na > 150" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="Hipoxemia" value={fmtPct(kpis.hipoxPct)} subtitle="P/F < 300" />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={expanded === "imp"}
            onChange={(_, isExp) => setExpanded(isExp ? "imp" : false)}
            sx={{ borderRadius: 3, overflow: "hidden", mt: 1.5 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Impacto" color="success" />
                <Typography fontWeight={900}>KPIs de resultados</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <StatCard title="Conv. Pot→Ef" value={`${kpis.convPotEf}%`} subtitle="Efectivos / Potenciales" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="Conv. Cons→Ef" value={fmtPct(kpis.convConsEf)} subtitle="Efectivos / Consentidos" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="Pérdidas evitables" value={fmtPct(kpis.perdidasEvPct)} subtitle="prevenibles" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <StatCard title="Trazabilidad" value={`${kpis.trazPct}%`} subtitle="Completa" />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Tabla siempre visible (en Card) */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <PatientTable
                patients={state.patients}
                onInspect={handleInspect}
                rightSlot={
                  <Stack direction="row" spacing={1}>
                    <Chip label={`Referido ${kpis.referido}`} variant="outlined" />
                    <Chip label={`Validado ${kpis.validado}`} variant="outlined" />
                  </Stack>
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <PatientDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} patient={selectedFresh} />
    </Box>
  );
}