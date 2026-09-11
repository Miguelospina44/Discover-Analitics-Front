"use client";

import type { CSSProperties, MouseEvent } from "react";
import type { AccountOut, VenueOut } from "@/lib/types";
import { useFilters, type GenderFilter } from "@/lib/filters";

const GENDER_OPTS: { id: NonNullable<GenderFilter>; label: string }[] = [
  { id: "woman", label: "Mujer" },
  { id: "man", label: "Hombre" },
  { id: "other", label: "Otro" },
  { id: "undisclosed", label: "Sin dato" },
];

type Props = {
  isSuperAdmin: boolean;
  accounts: AccountOut[];
  venues: VenueOut[];
};

/** Avoid focus rectangle / scroll jump on mouse click; keep keyboard focus. */
function hushMouseFocus(e: MouseEvent<HTMLButtonElement>) {
  e.preventDefault();
}

export function FilterBar({ isSuperAdmin, accounts, venues }: Props) {
  const {
    period,
    accountId,
    venueId,
    gender,
    setPeriod,
    toggleAccountId,
    toggleVenueId,
    toggleGender,
    clear,
    hasActiveFilters,
  } = useFilters();

  const dateStyle: CSSProperties = {
    padding: "0.45rem 0.75rem",
    borderRadius: 999,
    border: "1px solid var(--discover-obsidian)",
    background: "rgba(255,255,255,0.7)",
    fontFamily: "var(--font-ui)",
    fontSize: "0.85rem",
    color: "var(--discover-ink)",
  };

  return (
    <section className="surface-card filter-bar" style={{ padding: "1.15rem 1.25rem", marginBottom: "1.75rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "1rem 1.25rem",
          justifyContent: "space-between",
        }}
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
        {hasActiveFilters ? (
          <button type="button" className="scope-chip" onMouseDown={hushMouseFocus} onClick={clear}>
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {isSuperAdmin && accounts.length > 0 ? (
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

      <div className="scope-picker" style={{ marginTop: "1rem" }}>
        <span className="scope-picker__label">Género</span>
        <div className="scope-picker__chips">
          {GENDER_OPTS.map((g) => (
            <button
              key={g.id}
              type="button"
              className={`scope-chip${gender === g.id ? " scope-chip--active" : ""}`}
              onMouseDown={hushMouseFocus}
              onClick={() => toggleGender(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
