import { v4 as uuid } from "uuid";
import type { Patient, AuditEvent } from "./types";

const byUser = "UCI-Usuario (demo)";

const baseBundle = () => ({
  neuroMonitoreo: { done: true, at: new Date().toISOString() },
  tamizajeContraindicaciones: { done: false },
  pruebasConfirmatorias: { done: false },
  hemodinamiaEstable: { done: true, at: new Date().toISOString() },
  ventilacionOptimizada: { done: true, at: new Date().toISOString() },
  laboratoriosClave: { done: false },
  consentimientoProceso: { done: false },
});

const now = Date.now();
const iso = (hAgo: number) => new Date(now - hAgo * 3600_000).toISOString();

function createdEvent(patientId: string, title = "Paciente incorporado a trazabilidad"): AuditEvent {
  return {
    id: uuid(),
    patientId,
    type: "CREADO",
    at: new Date().toISOString(),
    by: byUser,
    title,
  };
}

export function seedPatients(): Patient[] {
  // ✅ Paciente 1
  const id1 = uuid();
  const p1: Patient = {
    id: id1,
    hc: "HL-000231",
    nombres: "María",
    apellidos: "Quispe R.",
    edad: 38,
    sexo: "F",
    servicio: "UCI",
    fechaIngreso: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    status: "En evaluación",
    gcs: 5,
    pupilas: "Mixtas",
    map: 68,
    lactato: 2.8,
    horasDesdeDeteccion: 9,
    bundle: baseBundle(),
    conversionEtapa: "Referido",
    tiempoAValidacionHoras: 10,
    events: [createdEvent(id1, "Registro inicial (seed)")],
    // dentro del Patient:
    sospechaAt: iso(10),
    notificacionAt: iso(9.5),
    inicioProtocoloAt: iso(8.5),
    confirmacionMEAt: iso(3),

    na: 152,          // hipernatremia demo
    pfRatio: 280,     // hipoxemia demo
    consentido: true,
    perdidaEvitable: false,
    riskEpisodes: { mapLow: 1, naOut: 1, tempLow: 0, pfLow: 1 },
  };

  // ✅ Paciente 2
  const id2 = uuid();
  const p2: Patient = {
    id: id2,
    hc: "HL-000245",
    nombres: "José",
    apellidos: "Ramos C.",
    edad: 52,
    sexo: "M",
    servicio: "UCI",
    fechaIngreso: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    status: "Potencial",
    gcs: 6,
    pupilas: "Reactivas",
    map: 74,
    lactato: 1.9,
    horasDesdeDeteccion: 6,
    bundle: {
      ...baseBundle(),
      tamizajeContraindicaciones: { done: true, at: new Date().toISOString() },
    },
    conversionEtapa: "Mantenido",
    tiempoAValidacionHoras: 14,
    events: [createdEvent(id2, "Registro inicial (seed)")],
    // dentro del Patient:
    sospechaAt: iso(10),
    notificacionAt: iso(9.5),
    inicioProtocoloAt: iso(8.5),
    confirmacionMEAt: iso(3),

    na: 152,          // hipernatremia demo
    pfRatio: 280,     // hipoxemia demo
    consentido: true,
    perdidaEvitable: false,
    riskEpisodes: { mapLow: 1, naOut: 1, tempLow: 0, pfLow: 1 },
  };

  // ✅ Paciente 3
  const id3 = uuid();
  const p3: Patient = {
    id: id3,
    hc: "HL-000199",
    nombres: "Luisa",
    apellidos: "Torres V.",
    edad: 44,
    sexo: "F",
    servicio: "Emergencia",
    fechaIngreso: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    status: "Seguimiento",
    gcs: 9,
    pupilas: "Reactivas",
    map: 78,
    lactato: 1.4,
    horasDesdeDeteccion: 3,
    bundle: {
      neuroMonitoreo: { done: true, at: new Date().toISOString() },
      tamizajeContraindicaciones: { done: true, at: new Date().toISOString() },
      pruebasConfirmatorias: { done: true, at: new Date().toISOString() },
      hemodinamiaEstable: { done: true, at: new Date().toISOString() },
      ventilacionOptimizada: { done: true, at: new Date().toISOString() },
      laboratoriosClave: { done: true, at: new Date().toISOString() },
      consentimientoProceso: { done: false },
    },
    conversionEtapa: "Validado",
    tiempoAValidacionHoras: 6,
    events: [createdEvent(id3, "Registro inicial (seed)")],
    // dentro del Patient:
    sospechaAt: iso(10),
    notificacionAt: iso(9.5),
    inicioProtocoloAt: iso(8.5),
    confirmacionMEAt: iso(3),

    na: 152,          // hipernatremia demo
    pfRatio: 280,     // hipoxemia demo
    consentido: true,
    perdidaEvitable: false,
    riskEpisodes: { mapLow: 1, naOut: 1, tempLow: 0, pfLow: 1 },
  };

  return [p1, p2, p3];
}