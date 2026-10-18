"use client";

import type { MouseEvent } from "react";
import type { AccountOut, VenueOut } from "@/lib/types";
import { copy, genderLabel } from "@/copy";
import { useFilters, type GenderFilter } from "@/lib/filters";

const GENDER_OPTS: NonNullable<GenderFilter>[] = ["woman", "man", "other", "undisclosed"];

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

  return (
    <section className="surface-card filter-bar" style={{ padding: "1.35rem 1.4rem", marginBottom: "1.85rem" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          gap: "1rem 1.35rem",
          justifyContent: "space-between",
        }}
      >
        <div>
          <span className="scope-picker__label">{copy.filters.period}</span>
          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="date"
              value={period.start}
              onChange={(e) => setPeriod({ ...period, start: e.target.value })}
              className="input-date"
              aria-label={copy.filters.from}
            />
            <span className="font-glora-xl" style={{ color: "var(--discover-cloud)" }}>
              →
            </span>
            <input
              type="date"
              value={period.end}
              onChange={(e) => setPeriod({ ...period, end: e.target.value })}
              className="input-date"
              aria-label={copy.filters.to}
            />
          </div>
        </div>
        {hasActiveFilters ? (
          <button type="button" className="scope-chip" onMouseDown={hushMouseFocus} onClick={clear}>
            {copy.filters.clear}
          </button>
        ) : null}
      </div>

      {isSuperAdmin && accounts.length > 0 ? (
        <div className="scope-picker">
          <span className="scope-picker__label">{copy.filters.client}</span>
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
        <div className="scope-picker">
          <span className="scope-picker__label">{copy.filters.venue}</span>
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

      <div className="scope-picker">
        <span className="scope-picker__label">{copy.filters.audience}</span>
        <div className="scope-picker__chips">
          {GENDER_OPTS.map((g) => (
            <button
              key={g}
              type="button"
              className={`scope-chip${gender === g ? " scope-chip--active" : ""}`}
              onMouseDown={hushMouseFocus}
              onClick={() => toggleGender(g)}
            >
              {genderLabel(g)}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
