"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/brand/EmptyState";
import { LoadingScreen } from "@/brand/LoadingScreen";
import { chartSeries } from "@/brand/chart-tokens";
import { fetchAccounts, fetchAudienceProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useFilters } from "@/lib/filters";
import {
  ApiError,
  type AccountOut,
  type AudienceProfileResponse,
  type AudienceSegment,
} from "@/lib/types";

const AudienceSegmentChart = dynamic(
  () => import("@/brand/charts/AudienceSegmentChart").then((m) => m.AudienceSegmentChart),
  { ssr: false },
);

// Orden y copy (español) de las cuatro dimensiones anónimas.
const DIMENSIONS: {
  key: string;
  title: string;
  hint: string;
  color: string;
  labels: Record<string, string>;
}[] = [
  {
    key: "gender",
    title: "Género",
    hint: "Cómo se reparte el parche",
    color: chartSeries[0],
    labels: { woman: "Mujer", man: "Hombre", other: "Otro", undisclosed: "No especificado" },
  },
  {
    key: "age_band",
    title: "Edad",
    hint: "Qué generación manda",
    color: chartSeries[1],
    labels: { undisclosed: "No especificado" },
  },
  {
    key: "zone",
    title: "Zona",
    hint: "De dónde llega tu gente",
    color: chartSeries[2],
    labels: {},
  },
  {
    key: "recurrence",
    title: "Recurrencia",
    hint: "Caras nuevas vs de la casa",
    color: chartSeries[3],
    labels: { nuevo: "Nuevo", recurrente: "Recurrente", undisclosed: "No especificado" },
  },
];

const QUALITY_COPY: Record<string, { label: string; tone: string }> = {
  ok: { label: "Data completa", tone: "var(--color-up)" },
  partial: { label: "Data parcial", tone: "var(--discover-tomato)" },
  missing: { label: "Sin data aún", tone: "var(--discover-storm)" },
};

function hushMouseFocus(e: { preventDefault: () => void }) {
  e.preventDefault();
}

function topSegment(segments: AudienceSegment[], dimension: string): AudienceSegment | null {
  const inDim = segments.filter((s) => s.dimension === dimension);
  if (inDim.length === 0) return null;
  return inDim.reduce((best, s) => (s.headcount > best.headcount ? s : best), inDim[0]);
}

export default function AudienciaPage() {
  const { token, me, ready, isSuperAdmin, logout } = useAuth();
  const { period, accountId, setPeriod, toggleAccountId } = useFilters();
  const router = useRouter();

  const [accounts, setAccounts] = useState<AccountOut[]>([]);
  const [profile, setProfile] = useState<AudienceProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showClientPicker = me?.role === "super_admin" && isSuperAdmin;

  useEffect(() => {
    if (ready && !token) router.replace("/login");
  }, [ready, token, router]);

  const load = useCallback(async () => {
    if (!token || !me) return;
    setLoading(true);
    setError(null);
    try {
      const tasks: Promise<unknown>[] = [
        fetchAudienceProfile(token, {
          periodStart: period.start,
          periodEnd: period.end,
          accountId: showClientPicker ? accountId : undefined,
        }),
      ];
      if (showClientPicker) tasks.push(fetchAccounts(token));
      const results = await Promise.all(tasks);
      setProfile(results[0] as AudienceProfileResponse);
      if (showClientPicker) setAccounts(results[1] as AccountOut[]);
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
          : "No pudimos traer tu público. Reintentá en un toque.",
      );
    } finally {
      setLoading(false);
    }
  }, [token, me, period, accountId, showClientPicker, logout, router]);

  useEffect(() => {
    if (ready && token && me) void load();
  }, [ready, token, me, load]);

  const segments = useMemo(() => profile?.segments ?? [], [profile]);
  const hasData = segments.length > 0;

  const decision = useMemo(() => {
    if (!hasData) return null;
    const gender = topSegment(segments, "gender");
    const age = topSegment(segments, "age_band");
    const zone = topSegment(segments, "zone");
    const recurrence = topSegment(segments, "recurrence");
    if (!gender || !age || !zone || !recurrence) return null;
    const genderLabel =
      DIMENSIONS[0].labels[gender.key]?.toLowerCase() ?? gender.key.toLowerCase();
    const recLabel =
      recurrence.key === "recurrente"
        ? "gente de la casa"
        : recurrence.key === "nuevo"
          ? "caras nuevas"
          : "público variado";
    return { gender, age, zone, recurrence, genderLabel, recLabel };
  }, [segments, hasData]);

  const quality = profile ? QUALITY_COPY[profile.data_quality] ?? QUALITY_COPY.missing : null;

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
    return <LoadingScreen fullscreen subtitle="Preparando tu parche…" />;
  }

  const scopeLabel = showClientPicker
    ? accountId
      ? accounts.find((a) => a.id === accountId)?.name ?? "cliente"
      : "global"
    : me.account_name ?? "tu club";

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
      <section style={{ marginBottom: "1.5rem" }}>
        <span className="scope-picker__label">Audiencia · anónima</span>
        <h1
          className="font-blogh"
          style={{ color: "var(--discover-obsidian)", fontSize: "1.6rem", margin: "0.35rem 0 0" }}
        >
          ¿Quién es mi público?
        </h1>
        <p
          className="font-glora-l"
          style={{
            color: "var(--discover-ink-soft)",
            maxWidth: 620,
            marginTop: "1rem",
            fontSize: "1.05rem",
            lineHeight: 1.55,
            fontStyle: "italic",
            fontWeight: 300,
          }}
        >
          {isSuperAdmin
            ? "El parche en agregado, sin nombres ni datos personales. Solo conteos por segmento para decidir a quién dirigir la próxima noche."
            : `Tu gente en ${me.account_name ?? "tu club"}, en agregado y sin datos personales. Para decidir a quién dirigir la próxima noche.`}
        </p>
        <p
          className="font-glora-xl"
          style={{ color: "var(--discover-storm)", marginTop: "0.75rem" }}
        >
          {period.start} → {period.end}
          {" · "}
          <span style={{ color: "var(--discover-obsidian)", fontWeight: 400 }}>{scopeLabel}</span>
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
      </section>

      {error ? (
        <div className="surface-card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
          <p className="font-glora" style={{ color: "var(--discover-tomato)", marginBottom: "1rem" }}>
            {error}
          </p>
          <button type="button" className="btn-discover" onClick={() => void load()}>
            Reintentar
          </button>
        </div>
      ) : null}

      {loading && !hasData ? (
        <LoadingScreen subtitle="Armando tu público…" />
      ) : null}

      {!error && !loading && !hasData ? (
        <EmptyState
          title="Todavía no hay audiencia"
          body="Cuando haya noches en este período, tu público sale acá segmentado y anónimo."
          action={
            <button type="button" className="btn-discover" onClick={() => void load()}>
              Reintentar
            </button>
          }
        />
      ) : null}

      {hasData ? (
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
              {quality.label} · {profile?.data_source}
            </p>
          ) : null}

          {decision ? (
            <section
              className="surface-card"
              style={{
                padding: "1.4rem 1.5rem",
                marginBottom: "1.75rem",
                background: "rgba(243, 241, 136, 0.22)",
                border: "1px solid var(--color-line-strong)",
              }}
            >
              <span className="scope-picker__label">A quién dirigir</span>
              <p
                className="font-glora-l"
                style={{
                  color: "var(--discover-obsidian)",
                  margin: "0.4rem 0 0",
                  fontSize: "1.05rem",
                  lineHeight: 1.55,
                }}
              >
                Tu público es sobre todo{" "}
                <strong>{decision.genderLabel}</strong> de{" "}
                <strong>{decision.age.key}</strong> años, llega principalmente de{" "}
                <strong>{decision.zone.key}</strong> y es{" "}
                <strong>{decision.recLabel}</strong>. Apuntá la próxima promo por ahí.
              </p>
            </section>
          ) : null}

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
              gap: "1.25rem",
            }}
          >
            {DIMENSIONS.map((dim) => {
              const dimSegments = segments.filter((s) => s.dimension === dim.key);
              return (
                <article
                  key={dim.key}
                  className="surface-card"
                  style={{ padding: "1.25rem 1.35rem" }}
                >
                  <div style={{ marginBottom: "0.75rem" }}>
                    <h2
                      className="font-blogh"
                      style={{
                        color: "var(--discover-obsidian)",
                        fontSize: "1.05rem",
                        margin: 0,
                      }}
                    >
                      {dim.title}
                    </h2>
                    <span
                      className="font-glora-xl"
                      style={{ color: "var(--discover-storm)", fontSize: "0.8rem" }}
                    >
                      {dim.hint}
                    </span>
                  </div>
                  {dimSegments.length > 0 ? (
                    <AudienceSegmentChart
                      segments={dimSegments}
                      labels={dim.labels}
                      color={dim.color}
                    />
                  ) : (
                    <p
                      className="font-glora-l"
                      style={{ color: "var(--discover-storm)", fontSize: "0.9rem" }}
                    >
                      Sin data de {dim.title.toLowerCase()} en este período.
                    </p>
                  )}
                </article>
              );
            })}
          </section>

          {profile ? (
            <p
              className="font-glora-xl"
              style={{
                color: "var(--discover-storm)",
                margin: "1.75rem 0 0",
                fontSize: "0.78rem",
                lineHeight: 1.5,
              }}
            >
              {profile.definition}
            </p>
          ) : null}
        </>
      ) : null}
    </main>
  );
}
