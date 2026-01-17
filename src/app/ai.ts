import type { Patient, AlertItem } from "./types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function computeAiAlert(p: Patient): AlertItem {
  // Score “simulado” orientado a priorización operativa, NO diagnóstico.
  // Idea: combinar criticidad + oportunidad + calidad (bundle).

  const bundleKeys = Object.keys(p.bundle) as (keyof typeof p.bundle)[];
  const doneCount = bundleKeys.filter((k) => p.bundle[k].done).length;
  const bundlePct = doneCount / bundleKeys.length;

  // Señales (demo)
  const gcsSignal = clamp((10 - p.gcs) * 6, 0, 42); // menor GCS => más score
  const pupilasSignal =
    p.pupilas === "No reactivas" ? 18 : p.pupilas === "Mixtas" ? 10 : 4;

  const mapSignal = clamp((75 - p.map) * 0.9, 0, 18); // MAP baja => sube score
  const lactatoSignal = clamp((p.lactato - 1.5) * 6, 0, 18); // alto => sube
  const oportunidadSignal = clamp(p.horasDesdeDeteccion * 1.2, 0, 20); // demora => sube

  const calidadPenalty = clamp((1 - bundlePct) * 22, 0, 22); // bundle incompleto => sube score

  // Bonus por etapa (operativo)
  const etapaBonus =
    p.conversionEtapa === "Validado" ? 8 :
    p.conversionEtapa === "Referido" ? 6 :
    p.conversionEtapa === "Mantenido" ? 4 :
    2;

  const raw =
    gcsSignal + pupilasSignal + mapSignal + lactatoSignal + oportunidadSignal + calidadPenalty + etapaBonus;

  const score = clamp(Math.round(raw), 0, 100);

  const razones = [
    { label: `Oportunidad (${p.horasDesdeDeteccion}h)`, weight: oportunidadSignal },
    { label: `Bundle ${(bundlePct * 100).toFixed(0)}%`, weight: calidadPenalty },
    { label: `GCS ${p.gcs}`, weight: gcsSignal },
    { label: `Pupilas: ${p.pupilas}`, weight: pupilasSignal },
    { label: `MAP ${p.map}`, weight: mapSignal },
    { label: `Lactato ${p.lactato}`, weight: lactatoSignal },
  ]
    .filter((r) => r.weight > 1)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const prioridad =
    score >= 70 ? "Alta" : score >= 40 ? "Media" : "Baja";

  return {
    patientId: p.id,
    score,
    prioridad,
    razones,
    createdAt: new Date().toISOString(),
  };
}