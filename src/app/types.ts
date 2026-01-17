export type Sexo = "F" | "M";

export type PatientStatus =
  | "Potencial"
  | "En evaluación"
  | "Donante efectivo"
  | "No apto"
  | "Seguimiento";

export type BundleItemKey =
  | "neuroMonitoreo"
  | "tamizajeContraindicaciones"
  | "pruebasConfirmatorias"
  | "hemodinamiaEstable"
  | "ventilacionOptimizada"
  | "laboratoriosClave"
  | "consentimientoProceso";

export type BundleChecklist = Record<
  BundleItemKey,
  { done: boolean; at?: string; note?: string }
>;

export type AuditEventType =
  | "CREADO"
  | "BUNDLE_CHECK"
  | "ETAPA_CAMBIO"
  | "STATUS_CAMBIO"
  | "ALERTA_IA_GENERADA";

export type AuditEvent = {
  id: string;
  patientId: string;
  type: AuditEventType;
  at: string;        // ISO
  by: string;        // "UCI-Usuario (demo)"
  title: string;     // corto
  detail?: string;   // opcional
};

export type Patient = {
  id: string;
  hc: string;
  nombres: string;
  apellidos: string;
  edad: number;
  sexo: Sexo;
  servicio: "UCI" | "Emergencia" | "Intermedios";
  fechaIngreso: string; // ISO
  status: PatientStatus;

  // Variables “demo” para IA simulada (no reemplaza criterio clínico real)
  gcs: number; // 3-15
  pupilas: "Reactivas" | "No reactivas" | "Mixtas";
  map: number; // presión arterial media (demo)
  lactato: number; // demo
  horasDesdeDeteccion: number;

  bundle: BundleChecklist;

  // Resultados/impacto (demo)
  conversionEtapa:
    | "Detectado"
    | "Mantenido"
    | "Referido"
    | "Validado"
    | "Efectivo"
    | "Descartado";
  tiempoAValidacionHoras: number;

  events: AuditEvent[];   // <--- nuevo
};

export type AlertItem = {
  patientId: string;
  score: number; // 0-100
  prioridad: "Alta" | "Media" | "Baja";
  razones: { label: string; weight: number }[];
  createdAt: string; // ISO
};