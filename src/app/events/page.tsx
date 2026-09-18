"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/brand/EmptyState";
import { fetchAccounts, fetchEvent, fetchEvents, fetchVenues } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFilters } from "@/lib/filters";
import { formatMoney } from "@/lib/metrics";
import {
  ApiError,
  type AccountOut,
  type EventOut,
  type EventPerformanceResponse,
  type GenderPoint,
  type VenueOut,
} from "@/lib/types";

const GenderMixChart = dynamic(
  () => import("@/brand/charts/GenderMixChart").then((m) => m.GenderMixChart),
  { ssr: false },
);

const EVENT_TYPE_LABELS: Record<string, string> = {
  festival: "Festival",
  club: "Club",
  concert: "Concierto",
  concierto: "Concierto",
  party: "Fiesta",
  fiesta: "Fiesta",
  show: "Show",
};

function eventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type] ?? `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
}

function formatEventDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const QUALITY_COPY: Record<string, { label: string; tone: string }> = {
  ok: { label: "Data completa", tone: "var(--color-up)" },
  partial: { label: "Data parcial", tone: "var(--discover-tomato)" },
  missing: { label: "Sin data aún", tone: "var(--discover-storm)" },
};

function hushMouseFocus(e: MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
}

export default function EventsPage() {
  const { token, me, ready, isSuperAdmin, logout } = useAuth();
  const { period, accountId, venueId, setPeriod, toggleAccountId, toggleVenueId } = useFilters();
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountOut[]>([]);
  const [venues, setVenues] = useState<VenueOut[]>([]);
  const [events, setEvents] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<EventPerformanceResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const showClientPicker = me?.role === "super_admin" && isSuperAdmin;

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  const load = useCallback(async () => {
    if (!token || !me) return;
    setLoading(true);
    setError(null);
    try {
      const query = {
        accountId: showClientPicker ? accountId : undefined,
        venueId,
        periodStart: period.start,
        periodEnd: period.end,
      };
      const tasks: Promise<unknown>[] = [
        fetchEvents(token, query),
        fetchVenues(token, showClientPicker ? accountId : undefined),
      ];
      if (showClientPicker) tasks.push(fetchAccounts(token));
      const results = await Promise.all(tasks);
      setEvents(results[0] as EventOut[]);
      setVenues(results[1] as VenueOut[]);
      if (showClientPicker) setAccounts(results[2] as AccountOut[]);
      else setAccounts([]);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      setError(
        err instanceof ApiError
          ? err.message
          : "No pudimos traer los eventos. Reintentá en un toque.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, me, period, accountId, venueId, showClientPicker, logout, router]);

  useEffect(() => {
    if (ready && token && me) void load();
  }, [ready, token, me, load]);

  const venueNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of venues) map[v.venue_id] = v.name;
    return map;
  }, [venues]);

  const openEvent = useCallback(
    async (eventId: string) => {
      if (!token) return;
      setSelectedId(eventId);
      setSelected(null);
      setDetailError(null);
      setDetailLoading(true);
      try {
        const detail = await fetchEvent(
          token,
          eventId,
          showClientPicker ? accountId : undefined,
        );
        setSelected(detail);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        setDetailError(
          err instanceof ApiError
            ? err.message
            : "No pudimos abrir el desempeño de este evento.",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [token, showClientPicker, accountId, logout, router],
  );

  const closeDetail = useCallback(() => {
    setSelectedId(null);
    setSelected(null);
    setDetailError(null);
  }, []);

  const dateStyle: CSSProperties = {
    padding: "0.45rem 0.75rem",
    borderRadius: 999,
    border: "1px solid var(--discover-obsidian)",
    background: "rgba(255,255,255,0.7)",
    fontFamily: "var(--font-ui)",
    fontSize: "0.85rem",
    color: "var(--discover-ink)",
  };

  if (!ready || !token || !me) {
    return (
      <main style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
        <p className="font-glora-l" style={{ color: "var(--discover-storm)" }}>
          Cargando el parche…
        </p>
      </main>
    );
  }

  const scopeLabel = showClientPicker
    ? accountId
      ? accounts.find((a) => a.id === accountId)?.name ?? "cliente"
      : "global"
    : me.account_name ?? "tu club";

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <section style={{ marginBottom: "1.5rem" }}>
        <h1
          className="font-blogh"
          style={{ color: "var(--discover-obsidian)", fontSize: "1.6rem", margin: 0 }}
        >
          Histórico de eventos
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
          {isSuperAdmin
            ? "Cada noche que pasó, con su desempeño. Tocá un evento para ver cómo se movió."
            : `Las noches de ${me.account_name ?? "tu club"}. Tocá un evento para ver cómo se movió.`}
        </p>
        <p
          className="font-glora-xl"
          style={{ color: "var(--discover-storm)", marginTop: "0.75rem" }}
        >
          {period.start} → {period.end}
          {" · "}
          <span style={{ color: "var(--discover-obsidian)", fontWeight: 400 }}>{scopeLabel}</span>
          {" · "}
          {events.length} evento{events.length === 1 ? "" : "s"}
          {loading ? " · actualizando…" : ""}
        </p>
      </section>

      <section
        className="surface-card filter-bar"
        style={{ padding: "1.15rem 1.25rem", marginBottom: "1.75rem" }}
      >
        <div>
          <span className="scope-picker__label">Fechas</span>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="date"
              value={period.start}
              onChange={(e) => setPeriod({ ...period, start: e.target.value })}
              style={dateStyle}
              aria-label="Desde"
            />
            <span className="font-glora-xl" style={{ color: "var(--discover-storm)" }}>
              →
            </span>
            <input
              type="date"
              value={period.end}
              onChange={(e) => setPeriod({ ...period, end: e.target.value })}
              style={dateStyle}
              aria-label="Hasta"
            />
          </div>
        </div>

        {showClientPicker && accounts.length > 0 ? (
          <div className="scope-picker" style={{ marginTop: "1rem" }}>
            <span className="scope-picker__label">Cliente</span>
            <div className="scope-picker__chips">
              {accounts.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`scope-chip${accountId === a.id ? " scope-chip--active" : ""}`}
                  onMouseDown={hushMouseFocus}
                  onClick={() => toggleAccountId(a.id)}
                >
                  {a.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {venues.length > 0 ? (
          <div className="scope-picker" style={{ marginTop: "1rem" }}>
            <span className="scope-picker__label">Venue</span>
            <div className="scope-picker__chips">
              {venues.map((v) => (
                <button
                  key={v.venue_id}
                  type="button"
                  className={`scope-chip${venueId === v.venue_id ? " scope-chip--active" : ""}`}
                  onMouseDown={hushMouseFocus}
                  onClick={() => toggleVenueId(v.venue_id)}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {error ? (
        <div className="surface-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <p
            className="font-glora"
            style={{ color: "var(--discover-tomato)", marginBottom: "1rem" }}
          >
            {error}
          </p>
          <button type="button" className="btn-discover" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      ) : null}

      {loading && events.length === 0 ? (
        <p
          className="font-glora-l"
          style={{ color: "var(--discover-storm)", marginBottom: "2rem" }}
        >
          Cargando el parche…
        </p>
      ) : null}

      {!error && !loading && events.length === 0 ? (
        <EmptyState
          title="Todavía no hay eventos"
          body="Cuando haya noches en este período, van a salir acá con su desempeño."
          action={
            <button type="button" className="btn-discover" onClick={() => void load()}>
              Reintentar
            </button>
          }
        />
      ) : null}

      {events.length > 0 ? (
        <section className="surface-card" style={{ padding: "0.5rem", marginBottom: "2rem" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {events.map((ev, i) => (
              <li key={ev.event_id}>
                <button
                  type="button"
                  onClick={() => void openEvent(ev.event_id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: "0.75rem 1rem",
                    width: "100%",
                    textAlign: "left",
                    background:
                      selectedId === ev.event_id ? "rgba(243, 241, 136, 0.35)" : "transparent",
                    border: "none",
                    borderTop: i === 0 ? "none" : "1px solid var(--color-line)",
                    padding: "1rem 1.1rem",
                    cursor: "pointer",
                    fontFamily: "var(--font-ui)",
                    borderRadius: selectedId === ev.event_id ? "0.75rem" : 0,
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <span
                      className="font-glora"
                      style={{
                        display: "block",
                        color: "var(--discover-obsidian)",
                        fontSize: "1rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ev.name}
                    </span>
                    <span
                      className="font-glora-xl"
                      style={{ color: "var(--discover-storm)", fontSize: "0.8rem" }}
                    >
                      {venueNameById[ev.venue_id] ?? "Venue"} · {formatEventDate(ev.event_date)}
                    </span>
                  </span>
                  <span
                    className="font-glora"
                    style={{
                      justifySelf: "end",
                      fontSize: "0.72rem",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--discover-ink-soft)",
                      border: "1px solid var(--color-line-strong)",
                      borderRadius: "var(--radius-pill)",
                      padding: "0.25rem 0.7rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {eventTypeLabel(ev.event_type)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {selectedId ? (
        <EventDetailDrawer
          loading={detailLoading}
          error={detailError}
          detail={selected}
          venueName={
            selected ? venueNameById[selected.event.venue_id] ?? "Venue" : undefined
          }
          onClose={closeDetail}
          onRetry={() => void openEvent(selectedId)}
        />
      ) : null}
    </main>
  );
}

function pct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(0)}%`;
}

function num(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString("es-CO");
}

function genderPoints(perf: EventPerformanceResponse["performance"]): GenderPoint[] {
  const total = perf.headcount_total ?? 0;
  const raw: { gender: GenderPoint["gender"]; headcount: number | null }[] = [
    { gender: "woman", headcount: perf.headcount_woman },
    { gender: "man", headcount: perf.headcount_man },
    { gender: "other", headcount: perf.headcount_other },
    { gender: "undisclosed", headcount: perf.headcount_undisclosed },
  ];
  return raw
    .filter((p) => p.headcount != null && p.headcount > 0)
    .map((p) => ({
      gender: p.gender,
      headcount: p.headcount as number,
      share: total > 0 ? (p.headcount as number) / total : 0,
    }));
}

function EventDetailDrawer({
  loading,
  error,
  detail,
  venueName,
  onClose,
  onRetry,
}: {
  loading: boolean;
  error: string | null;
  detail: EventPerformanceResponse | null;
  venueName?: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  const perf = detail?.performance;
  const points = perf ? genderPoints(perf) : [];
  const quality = detail ? QUALITY_COPY[detail.data_quality] ?? QUALITY_COPY.missing : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Desempeño del evento"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "rgba(18, 18, 18, 0.28)",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        className="surface-card"
        style={{
          width: "min(480px, 100%)",
          height: "100%",
          borderRadius: 0,
          overflowY: "auto",
          padding: "1.75rem 1.5rem 3rem",
          background: "var(--discover-paper)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.25rem",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span className="scope-picker__label">Desempeño del evento</span>
            <h2
              className="font-blogh"
              style={{
                color: "var(--discover-obsidian)",
                fontSize: "1.2rem",
                margin: "0.35rem 0 0",
              }}
            >
              {detail ? detail.event.name : "Cargando…"}
            </h2>
            {detail ? (
              <p
                className="font-glora-xl"
                style={{ color: "var(--discover-storm)", margin: "0.4rem 0 0", fontSize: "0.85rem" }}
              >
                {venueName} · {formatEventDate(detail.event.event_date)} ·{" "}
                {eventTypeLabel(detail.event.event_type)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: "none",
              border: "1px solid var(--color-line-strong)",
              borderRadius: "var(--radius-pill)",
              color: "var(--discover-ink)",
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontSize: "1rem",
              lineHeight: 1,
              padding: "0.4rem 0.65rem",
            }}
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="font-glora-l" style={{ color: "var(--discover-storm)" }}>
            Trayendo el desempeño…
          </p>
        ) : null}

        {error ? (
          <div>
            <p
              className="font-glora"
              style={{ color: "var(--discover-tomato)", marginBottom: "1rem" }}
            >
              {error}
            </p>
            <button type="button" className="btn-discover" onClick={onRetry}>
              Reintentar
            </button>
          </div>
        ) : null}

        {detail && perf && !loading ? (
          <>
            {quality ? (
              <p
                className="font-glora"
                style={{
                  display: "inline-block",
                  color: quality.tone,
                  border: `1px solid ${quality.tone}`,
                  borderRadius: "var(--radius-pill)",
                  padding: "0.2rem 0.7rem",
                  fontSize: "0.72rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: "1.25rem",
                }}
              >
                {quality.label} · {detail.data_source}
              </p>
            ) : null}

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))",
                gap: "0.75rem",
                marginBottom: "1.75rem",
              }}
            >
              <DetailKpi label="Asistencia" value={num(perf.redeemed_tickets)} hint="tickets redimidos" />
              <DetailKpi label="Órdenes" value={num(perf.order_count)} hint="ventas de la noche" />
              <DetailKpi
                label="Revenue"
                value={perf.revenue_cents != null ? formatMoney(perf.revenue_cents) : "—"}
                hint="recaudo"
              />
              <DetailKpi label="Personas" value={num(perf.headcount_total)} hint="mix de género" />
            </section>

            {points.length > 0 ? (
              <section>
                <h3
                  className="font-blogh"
                  style={{
                    color: "var(--discover-obsidian)",
                    fontSize: "0.95rem",
                    margin: "0 0 0.5rem",
                  }}
                >
                  Mix de género
                </h3>
                <p
                  className="font-glora-xl"
                  style={{
                    color: "var(--discover-storm)",
                    margin: "0 0 0.75rem",
                    fontSize: "0.8rem",
                  }}
                >
                  Mujer {pct(points.find((p) => p.gender === "woman")?.share)} · Hombre{" "}
                  {pct(points.find((p) => p.gender === "man")?.share)}
                </p>
                <GenderMixChart points={points} />
              </section>
            ) : (
              <p
                className="font-glora-l"
                style={{ color: "var(--discover-storm)", fontSize: "0.9rem" }}
              >
                Esta noche todavía no tiene mix de género para mostrar.
              </p>
            )}

            <p
              className="font-glora-xl"
              style={{
                color: "var(--discover-storm)",
                margin: "1.75rem 0 0",
                fontSize: "0.78rem",
                lineHeight: 1.5,
              }}
            >
              {detail.definition}
            </p>
          </>
        ) : null}
      </aside>
    </div>
  );
}

function DetailKpi({ label, value, hint }: { label: string; value: string; hint: string }): ReactNode {
  return (
    <article
      style={{
        border: "1px solid var(--color-line)",
        borderRadius: "var(--radius-card)",
        padding: "1rem 0.9rem",
        background: "var(--discover-mist)",
        minWidth: 0,
      }}
    >
      <div className="kpi-label" style={{ marginBottom: "0.5rem", fontSize: "0.72rem" }}>
        {label}
      </div>
      <div
        className="kpi-number"
        title={value}
        style={{ fontSize: value.length > 8 ? "1.05rem" : "1.35rem" }}
      >
        {value}
      </div>
      <div
        className="font-glora-xl"
        style={{
          marginTop: "0.4rem",
          fontSize: "0.72rem",
          color: "var(--discover-storm)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {hint}
      </div>
    </article>
  );
}
