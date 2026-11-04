import type { EventSubmission, EventSubmissionsResponse, EventSummaryResponse } from "./events-types";
import {
  applyEventFilters,
  eventsVisibleToRole,
  summarizeEventSubmissions,
  type EventListFilters,
} from "./events-aggregate";

/** Invented collectives and nights. Not operational Google Form rows. */
export const DEMO_EVENT_LABEL =
  "Datos de ejemplo. No corresponden a respuestas reales del formulario «Detalles Evento».";

export const DEMO_COLLECTIVE_ACCOUNT_ID = "demo-collective-1";

type Seed = {
  submitted: string;
  event: string;
  raw: string;
  hour: string;
  collective: string;
  account: string | null;
  mapped: boolean;
  name: string;
  flyer: boolean;
  presale: boolean;
  commission: string;
  benefit: string | null;
  commitments: string;
  payment: string;
  line: string;
};

const ACCOUNTS: Record<string, string> = {
  "Lumen Club": DEMO_COLLECTIVE_ACCOUNT_ID,
  Órbita: "demo-collective-2",
  "Casa Nébula": "demo-collective-3",
  "Taller Norte": "demo-collective-4",
  "Eco Rítmico": "demo-collective-5",
  Bruma: "demo-collective-6",
  "Sello Atlas": "demo-collective-7",
  "Marea Baja": "demo-collective-8",
  "Punto Cero": "demo-collective-9",
  Vértice: "demo-collective-10",
  "Noche Clara": "demo-collective-11",
  "Estudio Sur": "demo-collective-12",
};

const SEEDS: Seed[] = [
  { submitted: "2026-05-28", event: "2026-06-06", raw: "06/06/2026", hour: "22:00:00", collective: "Lumen Club", account: ACCOUNTS["Lumen Club"], mapped: true, name: "Alta marea", flyer: true, presale: true, commission: "15", benefit: null, commitments: "Link en biografía, Historias", payment: "Transferencia", line: "Electrónica" },
  { submitted: "2026-06-02", event: "2026-06-13", raw: "13/06/2026", hour: "21:30:00", collective: "Órbita", account: ACCOUNTS["Órbita"], mapped: true, name: "Frecuencia 13", flyer: true, presale: true, commission: "11.5", benefit: null, commitments: "Historias", payment: "Nequi", line: "House" },
  { submitted: "2026-06-08", event: "2026-06-20", raw: "20/06/2026", hour: "23:00:00", collective: "Casa Nébula", account: ACCOUNTS["Casa Nébula"], mapped: true, name: "Cuarto menguante", flyer: false, presale: false, commission: "10", benefit: "Cóctel de bienvenida", commitments: "Publicación del evento", payment: "Bold", line: "Indie" },
  { submitted: "2026-06-14", event: "2026-06-27", raw: "27/06/2026", hour: "22:00:00", collective: "Taller Norte", account: ACCOUNTS["Taller Norte"], mapped: true, name: "Sesión de patio", flyer: true, presale: true, commission: "20", benefit: null, commitments: "Pauta con redirección, Historias", payment: "Transferencia", line: "Crossover" },
  { submitted: "2026-06-22", event: "2026-07-04", raw: "04/07/2026", hour: "21:00:00", collective: "Eco Rítmico", account: ACCOUNTS["Eco Rítmico"], mapped: true, name: "Clave abierta", flyer: true, presale: false, commission: "11.9", benefit: "2x1 en segundo trago", commitments: "Link en biografía", payment: "Nequi", line: "Tropical" },
  { submitted: "2026-06-30", event: "2026-07-11", raw: "11/07/2026", hour: "22:30:00", collective: "Bruma", account: ACCOUNTS["Bruma"], mapped: true, name: "Noche opaca", flyer: false, presale: true, commission: "15", benefit: null, commitments: "Historias, Newsletter", payment: "Efectivo", line: "Electrónica" },
  { submitted: "2026-07-05", event: "2026-07-18", raw: "18/07/2026", hour: "23:00:00", collective: "Sello Atlas", account: ACCOUNTS["Sello Atlas"], mapped: true, name: "Primer corte", flyer: true, presale: true, commission: "11.5", benefit: null, commitments: "Publicación del evento, Historias", payment: "Bold", line: "Indie" },
  { submitted: "2026-07-12", event: "2026-07-25", raw: "25/07/2026", hour: "22:00:00", collective: "Lumen Club", account: ACCOUNTS["Lumen Club"], mapped: true, name: "Segundo aire", flyer: true, presale: true, commission: "15", benefit: null, commitments: "Link en biografía, Pauta con redirección", payment: "Transferencia", line: "House" },
  { submitted: "2026-07-20", event: "2026-08-01", raw: "01/08/2026", hour: "21:30:00", collective: "Marea Baja", account: ACCOUNTS["Marea Baja"], mapped: true, name: "Puerto cerrado", flyer: false, presale: false, commission: "10", benefit: "Diez cortesías", commitments: "Historias", payment: "Nequi", line: "Ritual" },
  { submitted: "2026-07-28", event: "2026-08-08", raw: "08/08/2026", hour: "22:00:00", collective: "Punto Cero", account: ACCOUNTS["Punto Cero"], mapped: true, name: "Reset", flyer: true, presale: true, commission: "20", benefit: null, commitments: "Link en biografía", payment: "Transferencia", line: "Electrónica" },
  { submitted: "2026-08-04", event: "2026-08-15", raw: "15/08/2026", hour: "23:00:00", collective: "Vértice", account: ACCOUNTS["Vértice"], mapped: true, name: "Ángulo recto", flyer: true, presale: false, commission: "11.9", benefit: "Souvenir de la noche", commitments: "Publicación del evento", payment: "Bold", line: "Crossover" },
  { submitted: "2026-08-11", event: "2026-08-22", raw: "22/08/2026", hour: "22:00:00", collective: "Noche Clara", account: ACCOUNTS["Noche Clara"], mapped: true, name: "Sin reloj", flyer: false, presale: true, commission: "15", benefit: null, commitments: "Historias, Link en biografía", payment: "Nequi", line: "House" },
  { submitted: "2026-08-18", event: "2026-08-29", raw: "29/08/2026", hour: "21:00:00", collective: "Estudio Sur", account: ACCOUNTS["Estudio Sur"], mapped: true, name: "Ensayo abierto", flyer: true, presale: true, commission: "11.5", benefit: null, commitments: "Newsletter", payment: "Transferencia", line: "Indie" },
  { submitted: "2026-08-26", event: "2026-09-05", raw: "05/09/2026", hour: "22:30:00", collective: "Lumen Club", account: ACCOUNTS["Lumen Club"], mapped: true, name: "Equinoccio", flyer: true, presale: true, commission: "15", benefit: null, commitments: "Historias, Pauta con redirección", payment: "Transferencia", line: "Electrónica" },
  { submitted: "2026-09-02", event: "2026-09-12", raw: "12/09/2026", hour: "23:00:00", collective: "Órbita", account: ACCOUNTS["Órbita"], mapped: true, name: "Órbita menor", flyer: true, presale: false, commission: "10", benefit: "Cóctel de bienvenida", commitments: "Publicación del evento, Historias", payment: "Efectivo", line: "House" },
  { submitted: "2026-09-09", event: "2026-09-19", raw: "19/09/2026", hour: "22:00:00", collective: "Casa Nébula", account: ACCOUNTS["Casa Nébula"], mapped: true, name: "Niebla rosa", flyer: false, presale: true, commission: "tarifa especial", benefit: null, commitments: "Link en biografía", payment: "Bold", line: "Indie" },
  { submitted: "2026-09-16", event: "2026-09-26", raw: "26/09/2026", hour: "21:30:00", collective: "Taller Norte", account: ACCOUNTS["Taller Norte"], mapped: true, name: "Mesa compartida", flyer: true, presale: true, commission: "11.5", benefit: null, commitments: "Historias, Newsletter", payment: "Nequi", line: "Crossover" },
  { submitted: "2026-09-24", event: "2026-10-03", raw: "03/10/2026", hour: "22:00:00", collective: "Eco Rítmico", account: ACCOUNTS["Eco Rítmico"], mapped: true, name: "Clave de son", flyer: true, presale: false, commission: "11.9", benefit: "2x1 en segundo trago", commitments: "Publicación del evento", payment: "Transferencia", line: "Tropical" },
  { submitted: "2026-10-01", event: "2026-10-10", raw: "10/10/2026", hour: "23:00:00", collective: "Bruma", account: ACCOUNTS["Bruma"], mapped: true, name: "Trasluz", flyer: false, presale: true, commission: "15", benefit: null, commitments: "Link en biografía, Historias", payment: "Bold", line: "Electrónica" },
  { submitted: "2026-10-08", event: "2026-10-17", raw: "17/10/2026", hour: "22:00:00", collective: "Sello Atlas", account: ACCOUNTS["Sello Atlas"], mapped: true, name: "Lado B", flyer: true, presale: true, commission: "20", benefit: null, commitments: "Pauta con redirección", payment: "Nequi", line: "Indie" },
  { submitted: "2026-10-14", event: "2026-10-24", raw: "24/10/2026", hour: "21:00:00", collective: "Lumen Club", account: ACCOUNTS["Lumen Club"], mapped: true, name: "Cosecha", flyer: true, presale: true, commission: "15", benefit: null, commitments: "Historias, Link en biografía", payment: "Transferencia", line: "House" },
  { submitted: "2026-10-20", event: "2026-10-31", raw: "31/10/2026", hour: "22:30:00", collective: "Punto Cero", account: ACCOUNTS["Punto Cero"], mapped: true, name: "Máscara", flyer: false, presale: false, commission: "10", benefit: "Souvenir de la noche", commitments: "Publicación del evento", payment: "Efectivo", line: "Ritual" },
  { submitted: "2026-10-22", event: "2026-11-01", raw: "01/11/2026", hour: "22:00:00", collective: "Lumen Club", account: ACCOUNTS["Lumen Club"], mapped: true, name: "Apertura de mes", flyer: true, presale: true, commission: "11.5", benefit: null, commitments: "Link en biografía, Historias, Newsletter", payment: "Transferencia", line: "Electrónica" },
  { submitted: "2026-10-28", event: "2026-11-07", raw: "07/11/2026", hour: "23:00:00", collective: "Vértice", account: ACCOUNTS["Vértice"], mapped: true, name: "Doble filo", flyer: true, presale: true, commission: "15", benefit: null, commitments: "Historias", payment: "Bold", line: "Crossover" },
  { submitted: "2026-11-01", event: "2026-11-14", raw: "14/11/2026", hour: "21:30:00", collective: "Noche Clara", account: ACCOUNTS["Noche Clara"], mapped: true, name: "Luna de trabajo", flyer: false, presale: false, commission: "11.9", benefit: "Diez cortesías", commitments: "Publicación del evento, Historias", payment: "Nequi", line: "House" },
  { submitted: "2026-11-03", event: "2026-11-21", raw: "21/11/2026", hour: "22:00:00", collective: "Estudio Sur", account: ACCOUNTS["Estudio Sur"], mapped: true, name: "Cierre de ciclo", flyer: true, presale: true, commission: "20", benefit: null, commitments: "Pauta con redirección, Link en biografía", payment: "Transferencia", line: "Indie" },
  { submitted: "2026-11-04", event: "2026-11-28", raw: "28/11/2026", hour: "22:30:00", collective: "Lumen Club", account: ACCOUNTS["Lumen Club"], mapped: true, name: "Último jueves", flyer: true, presale: true, commission: "15", benefit: null, commitments: "Historias, Newsletter", payment: "Nequi", line: "Electrónica" },
  { submitted: "2026-09-30", event: "2026-10-18", raw: "18/10/2026", hour: "23:00:00", collective: "Ruta 9", account: null, mapped: false, name: "Parada improvisada", flyer: false, presale: false, commission: "tarifa especial", benefit: "Cóctel de bienvenida", commitments: "Historias", payment: "Efectivo", line: "Crossover" },
];

function toIso(date: string, time: string): string {
  return `${date}T${time}-05:00`;
}

export const DEMO_NIGHT_LINES: Record<string, string> = Object.fromEntries(
  SEEDS.map((seed) => [seed.name, seed.line]),
);

export const DEMO_EVENT_ITEMS: EventSubmission[] = SEEDS.map((seed) => ({
  submitted_at: toIso(seed.submitted, "10:15:00"),
  event_at: toIso(seed.event, seed.hour),
  event_at_raw: `${seed.raw} ${seed.hour}`,
  collective_raw: seed.collective,
  collective_name: seed.mapped ? seed.collective : seed.collective,
  account_id: seed.mapped ? seed.account : null,
  assignment_status: seed.mapped ? "mapped" : "unmapped",
  event_name: seed.name,
  flyer_url: seed.flyer ? `https://example.com/flyers/${seed.name.toLowerCase().replaceAll(" ", "-")}` : null,
  has_presale: seed.presale,
  commission: seed.commission,
  exclusive_benefit: seed.benefit,
  promotion_commitments: seed.commitments,
  payment_method: seed.payment,
}));

export function demoEventsForRole(role: string, accountId: string | null): EventSubmission[] {
  return eventsVisibleToRole(DEMO_EVENT_ITEMS, role, accountId);
}

export function demoEventListResponse(
  role: string,
  accountId: string | null,
  filters: EventListFilters = {},
): EventSubmissionsResponse {
  const visible = demoEventsForRole(role, accountId);
  const items = applyEventFilters(visible, filters);
  const isAdmin = role === "super_admin";
  return {
    name: "event_submissions",
    title: "Respuestas de detalles de evento",
    data_source: "fixture",
    is_demo: true,
    demo_label: DEMO_EVENT_LABEL,
    as_of: "2026-11-04",
    scope: isAdmin ? "admin" : "collective",
    unmapped_visible: isAdmin,
    count: items.length,
    items,
  };
}

export function demoEventSummaryResponse(
  role: string,
  accountId: string | null,
  filters: EventListFilters = {},
): EventSummaryResponse {
  const visible = demoEventsForRole(role, accountId);
  const items = applyEventFilters(visible, filters);
  return summarizeEventSubmissions(items, {
    scope: role === "super_admin" ? "admin" : "collective",
    isDemo: true,
    demoLabel: DEMO_EVENT_LABEL,
  });
}
