"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { copy, genderLabel } from "@/copy";
import { useFilters, type GenderFilter } from "@/lib/filters";
import type { AccountOut, VenueOut } from "@/lib/types";

const GENDER_OPTS: NonNullable<GenderFilter>[] = ["woman", "man", "other", "undisclosed"];

type Props = {
  isSuperAdmin: boolean;
  accounts: AccountOut[];
  venues: VenueOut[];
};

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
    <section className="mb-8" aria-label={copy.filters.legend}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <span className="scope-picker__label">{copy.filters.period}</span>
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="filter-from">
              {copy.filters.from}
            </label>
            <Input
              id="filter-from"
              type="date"
              value={period.start}
              onChange={(e) => setPeriod({ ...period, start: e.target.value })}
              className="input-date w-auto min-w-[10.5rem]"
            />
            <span className="text-muted-foreground" aria-hidden>
              →
            </span>
            <label className="sr-only" htmlFor="filter-to">
              {copy.filters.to}
            </label>
            <Input
              id="filter-to"
              type="date"
              value={period.end}
              onChange={(e) => setPeriod({ ...period, end: e.target.value })}
              className="input-date w-auto min-w-[10.5rem]"
            />
          </div>
        </div>
        {hasActiveFilters ? (
          <Button type="button" variant="ghost" size="sm" onClick={clear}>
            {copy.filters.clear}
          </Button>
        ) : null}
      </div>

      {isSuperAdmin && accounts.length > 0 ? (
        <div className="scope-picker">
          <span className="scope-picker__label" id="filter-client-label">
            {copy.filters.client}
          </span>
          <ToggleGroup
            type="single"
            value={accountId ?? ""}
            onValueChange={(value) => {
              if (value) toggleAccountId(value);
              else if (accountId) toggleAccountId(accountId);
            }}
            size="default"
            aria-labelledby="filter-client-label"
          >
            {accounts.map((a) => (
              <ToggleGroupItem key={a.id} value={a.id}>
                {a.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : null}

      {venues.length > 0 ? (
        <div className="scope-picker">
          <span className="scope-picker__label" id="filter-venue-label">
            {copy.filters.venue}
          </span>
          <ToggleGroup
            type="single"
            value={venueId ?? ""}
            onValueChange={(value) => {
              if (value) toggleVenueId(value);
              else if (venueId) toggleVenueId(venueId);
            }}
            size="default"
            aria-labelledby="filter-venue-label"
          >
            {venues.map((v) => (
              <ToggleGroupItem key={v.venue_id} value={v.venue_id}>
                {v.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      ) : null}

      <div className="scope-picker filter-audience">
        <span className="scope-picker__label" id="filter-audience-label">
          {copy.filters.audience}
        </span>
        <ToggleGroup
          type="single"
          value={gender ?? ""}
          onValueChange={(value) => {
            if (value) toggleGender(value as NonNullable<GenderFilter>);
            else if (gender) toggleGender(gender);
          }}
          size="default"
          aria-labelledby="filter-audience-label"
        >
          {GENDER_OPTS.map((g) => (
            <ToggleGroupItem key={g} value={g}>
              {genderLabel(g)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </section>
  );
}
