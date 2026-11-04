export type EventSubmission = {
  submitted_at: string;
  event_at: string;
  event_at_raw: string;
  collective_raw: string;
  collective_name: string;
  account_id: string | null;
  assignment_status: "mapped" | "unmapped";
  event_name: string;
  flyer_url: string | null;
  has_presale: boolean;
  commission: string;
  exclusive_benefit: string | null;
  promotion_commitments: string | null;
  payment_method: string | null;
};

export type EventSubmissionsResponse = {
  name: string;
  title: string;
  data_source: string;
  is_demo: boolean;
  demo_label: string | null;
  as_of: string;
  scope: string;
  unmapped_visible: boolean;
  count: number;
  items: EventSubmission[];
};

export type EventSummaryResponse = {
  name: string;
  scope: string;
  data_source: string;
  is_demo: boolean;
  demo_label: string | null;
  as_of: string;
  kpis: {
    event_count: number;
    collective_count: number;
    presale_pct: number;
    events_this_month: number;
    top_collective: {
      name: string;
      event_count: number;
    } | null;
  };
  unmapped_count: number;
  distributions: {
    by_commission: Array<{ key: string; count: number }>;
    by_presale: Array<{ key: string; count: number }>;
  };
};
