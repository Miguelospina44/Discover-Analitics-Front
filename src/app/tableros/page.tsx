"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/brand/EmptyState";
import { useAuth } from "@/lib/auth";
import { useFilters } from "@/lib/filters";
import {
  deleteTablero,
  listTableros,
  saveTablero,
  type Tablero,
  type TableroScope,
} from "@/lib/tableros";

const ANALYSIS_TYPES = [
  "Asistencia nocturna",
  "Ventas por noche",
  "Mix de género",
  "Asistencia vs. gremio",
  "Otro",
] as const;

function formatSavedDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function scopePeriodLabel(scope: TableroScope): string {
  if (!scope.period) return "Todo el histórico";
  return `${scope.period.start} → ${scope.period.end}`;
}

export default function TablerosPage() {
  const { token, me, ready } = useAuth();
  const { period, venueId } = useFilters();
  const router = useRouter();

  const [tableros, setTableros] = useState<Tablero[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [analysisType, setAnalysisType] =
    useState<(typeof ANALYSIS_TYPES)[number]>("Asistencia nocturna");

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  useEffect(() => {
    if (ready && token) setTableros(listTableros());
  }, [ready, token]);

  const capturedScope: TableroScope = useMemo(
    () => ({
      venue: venueId ? "Venue filtrado" : "Todos los venues",
      period: { start: period.start, end: period.end },
      analysisType,
    }),
    [venueId, period.start, period.end, analysisType],
  );

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;
      const next = saveTablero({
        name,
        description,
        scope: capturedScope,
      });
      setTableros(next);
      setName("");
      setDescription("");
      setAnalysisType("Asistencia nocturna");
      setShowForm(false);
    },
    [name, description, capturedScope],
  );

  const onDelete = useCallback((id: string) => {
    setTableros(deleteTablero(id));
  }, []);

  if (!ready || !token || !me) {
    return (
      <main style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p className="font-glora-l" style={{ color: "var(--discover-storm)" }}>
          Cargando el parche…
        </p>
      </main>
    );
  }

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: 14,
    border: "1px solid var(--discover-line-strong)",
    background: "var(--discover-paper)",
    color: "var(--discover-ink)",
    fontFamily: "var(--font-ui)",
    fontWeight: 400,
  };

  const labelStyle: CSSProperties = {
    display: "block",
    color: "var(--discover-storm)",
    marginBottom: 6,
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <section
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            className="font-blogh"
            style={{ color: "var(--discover-obsidian)", fontSize: "1.6rem", margin: 0 }}
          >
            Tableros
          </h1>
          <p
            className="font-glora-l"
            style={{
              color: "var(--discover-ink-soft)",
              maxWidth: 560,
              marginTop: "1rem",
              fontSize: "1.05rem",
              lineHeight: 1.55,
              fontStyle: "italic",
              fontWeight: 300,
            }}
          >
            Guardá tus análisis para volver a ellos sin rehacer los filtros. Cada
            tablero deja una foto del estudio.
          </p>
        </div>
        <button
          type="button"
          className="btn-discover"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cerrar" : "Nuevo tablero"}
        </button>
      </section>

      {showForm ? (
        <form
          onSubmit={onSubmit}
          className="surface-card"
          style={{
            padding: "1.5rem 1.35rem",
            marginBottom: "2rem",
            borderTop: "3px solid var(--discover-yellow)",
          }}
        >
          <h2
            className="font-blogh"
            style={{ color: "var(--discover-obsidian)", fontSize: "0.95rem", margin: "0 0 1.25rem" }}
          >
            Guardar análisis
          </h2>
          <div style={{ marginBottom: "1.1rem" }}>
            <label htmlFor="tablero-name" style={labelStyle}>
              Nombre
            </label>
            <input
              id="tablero-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mix de género — finde"
              required
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "1.1rem" }}>
            <label htmlFor="tablero-desc" style={labelStyle}>
              Descripción
            </label>
            <textarea
              id="tablero-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Una línea para acordarte de qué mira este tablero."
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div style={{ marginBottom: "1.35rem" }}>
            <label htmlFor="tablero-type" style={labelStyle}>
              Tipo de análisis
            </label>
            <select
              id="tablero-type"
              value={analysisType}
              onChange={(e) =>
                setAnalysisType(e.target.value as (typeof ANALYSIS_TYPES)[number])
              }
              style={inputStyle}
            >
              {ANALYSIS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div
            className="pattern-stamp"
            style={{
              border: "1px solid var(--color-line)",
              borderRadius: "var(--radius-card)",
              padding: "0.9rem 1rem",
              marginBottom: "1.35rem",
            }}
          >
            <span className="scope-picker__label" style={{ marginBottom: "0.5rem" }}>
              Scope capturado
            </span>
            <p
              className="font-glora"
              style={{ color: "var(--discover-ink)", margin: 0, fontSize: "0.9rem" }}
            >
              {capturedScope.venue} · {scopePeriodLabel(capturedScope)}
            </p>
          </div>

          <button type="submit" className="btn-discover">
            Guardar tablero
          </button>
        </form>
      ) : null}

      {tableros.length === 0 ? (
        <EmptyState
          title="Todavía no hay tableros"
          body="Guardá tu primer análisis y volvé a él cuando quieras, con sus filtros intactos."
          action={
            <button
              type="button"
              className="btn-discover"
              onClick={() => setShowForm(true)}
            >
              Nuevo tablero
            </button>
          }
        />
      ) : (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {tableros.map((t) => (
            <article
              key={t.id}
              className="surface-card"
              style={{
                padding: "1.35rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                }}
              >
                <span
                  className="font-glora"
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--discover-ink-soft)",
                    border: "1px solid var(--color-line-strong)",
                    borderRadius: "var(--radius-pill)",
                    padding: "0.2rem 0.65rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.scope.analysisType ?? "Análisis"}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  aria-label={`Eliminar ${t.name}`}
                  style={{
                    background: "none",
                    border: "1px solid var(--color-line-strong)",
                    borderRadius: "var(--radius-pill)",
                    color: "var(--discover-storm)",
                    cursor: "pointer",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.85rem",
                    lineHeight: 1,
                    padding: "0.3rem 0.55rem",
                  }}
                >
                  ✕
                </button>
              </div>
              <h2
                className="font-glora"
                style={{ color: "var(--discover-obsidian)", fontSize: "1.15rem", margin: 0 }}
              >
                {t.name}
              </h2>
              {t.description ? (
                <p
                  className="font-glora-l"
                  style={{
                    color: "var(--discover-ink-soft)",
                    margin: 0,
                    lineHeight: 1.5,
                    fontSize: "0.95rem",
                  }}
                >
                  {t.description}
                </p>
              ) : null}
              <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                <p
                  className="font-glora-xl"
                  style={{ color: "var(--discover-storm)", margin: 0, fontSize: "0.8rem" }}
                >
                  {t.scope.venue ?? "Todos los venues"} · {scopePeriodLabel(t.scope)}
                </p>
                <p
                  className="font-glora-xl"
                  style={{ color: "var(--discover-storm)", margin: "0.35rem 0 0", fontSize: "0.75rem" }}
                >
                  Guardado el {formatSavedDate(t.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
