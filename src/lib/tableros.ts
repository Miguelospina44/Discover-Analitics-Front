/**
 * Tableros — saved analyses ("cada tablero = un análisis guardado").
 *
 * STUB PERSISTENCE (iteration 1): these helpers persist to localStorage only.
 * Real persistence will plug into the backend consulting/boards layer later
 * (same shape, swap the storage calls for API calls). Do NOT rely on this for
 * anything beyond the demo — it is per-browser and unauthenticated.
 */

const STORAGE_KEY = "da_tableros";

/** Scope snapshot captured from the current filter bar when a tablero is saved. */
export type TableroScope = {
  /** Human-readable venue label, or null for "todos". */
  venue: string | null;
  /** Period window captured at save time. */
  period: { start: string; end: string } | null;
  /** Free-form analysis type, e.g. "Asistencia", "Ventas", "Mix de género". */
  analysisType: string | null;
};

export type Tablero = {
  id: string;
  name: string;
  description: string;
  /** ISO timestamp of when the tablero was saved. */
  createdAt: string;
  scope: TableroScope;
};

/** Fields the user provides when saving a new tablero. */
export type NewTableroInput = {
  name: string;
  description: string;
  scope: TableroScope;
};

const SEED_TABLEROS: Tablero[] = [
  {
    id: "seed-mix-genero-agosto",
    name: "Mix de género — Agosto",
    description:
      "Quién llenó la pista en agosto. Comparativo mujer/hombre noche a noche.",
    createdAt: "2026-08-15T02:30:00.000Z",
    scope: {
      venue: "Todos los venues",
      period: { start: "2026-08-01", end: "2026-08-14" },
      analysisType: "Mix de género",
    },
  },
  {
    id: "seed-ventas-finde",
    name: "Ventas del finde",
    description:
      "El recaudo de viernes y sábado, para ver dónde se movió la plata.",
    createdAt: "2026-08-10T18:05:00.000Z",
    scope: {
      venue: "Club Central",
      period: { start: "2026-08-07", end: "2026-08-09" },
      analysisType: "Ventas por noche",
    },
  },
  {
    id: "seed-asistencia-gremio",
    name: "Asistencia vs. gremio",
    description:
      "Tu asistencia contra el promedio anónimo del gremio. ¿Vamos arriba?",
    createdAt: "2026-08-05T14:00:00.000Z",
    scope: {
      venue: "Todos los venues",
      period: { start: "2026-08-01", end: "2026-08-14" },
      analysisType: "Asistencia nocturna",
    },
  },
];

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function read(): Tablero[] | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Tablero[];
  } catch {
    return null;
  }
}

function write(tableros: Tablero[]): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tableros));
  } catch {
    /* storage full / disabled — stub, so ignore */
  }
}

function generateId(): string {
  const cryptoObj = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
    return cryptoObj.randomUUID();
  }
  return `tablero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Returns the saved tableros, seeding the store with examples the first time so
 * the section feels real in the demo. Newest first.
 */
export function listTableros(): Tablero[] {
  const existing = read();
  if (existing == null) {
    write(SEED_TABLEROS);
    return sortByNewest(SEED_TABLEROS);
  }
  return sortByNewest(existing);
}

/** Saves a new tablero and returns the full, updated list (newest first). */
export function saveTablero(input: NewTableroInput): Tablero[] {
  const current = read() ?? SEED_TABLEROS;
  const tablero: Tablero = {
    id: generateId(),
    name: input.name.trim(),
    description: input.description.trim(),
    createdAt: new Date().toISOString(),
    scope: input.scope,
  };
  const next = [tablero, ...current];
  write(next);
  return sortByNewest(next);
}

/** Removes a tablero by id and returns the updated list (newest first). */
export function deleteTablero(id: string): Tablero[] {
  const current = read() ?? SEED_TABLEROS;
  const next = current.filter((t) => t.id !== id);
  write(next);
  return sortByNewest(next);
}

function sortByNewest(tableros: Tablero[]): Tablero[] {
  return [...tableros].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Exposed for tests / demo reset. */
export const __TABLEROS_STORAGE_KEY = STORAGE_KEY;
export const __TABLEROS_SEED = SEED_TABLEROS;
