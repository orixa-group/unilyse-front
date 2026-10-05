import {
  bucketStartIso,
  type TimelineGranularity,
} from "@/lib/timeline/timeline-granularity";

export type TimelineTrafficRow = {
  date: string;
  seaClicks: number;
  seoClicks: number;
  seaSessions: number;
  seoSessions: number;
  seaConversions: number;
  seoConversions: number;
  totalConversions: number;
  totalSessions: number;
};

export type TimelineClicksRow = {
  date: string;
  clicks: number;
  seaClicks: number;
  seoClicks: number;
  ctr: number;
  cost: number;
};

function sortByDate<T extends { date: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.date.localeCompare(b.date));
}

export function aggregateTrafficRows(
  rows: readonly TimelineTrafficRow[],
  granularity: TimelineGranularity,
): TimelineTrafficRow[] {
  if (granularity === "day" || rows.length === 0) {
    return sortByDate([...rows]);
  }

  const buckets = new Map<string, TimelineTrafficRow>();

  for (const row of rows) {
    const bucket = bucketStartIso(row.date, granularity);
    if (!bucket) {
      continue;
    }
    const existing = buckets.get(bucket);
    if (!existing) {
      buckets.set(bucket, {
        date: bucket,
        seaClicks: row.seaClicks,
        seoClicks: row.seoClicks,
        seaSessions: row.seaSessions,
        seoSessions: row.seoSessions,
        seaConversions: row.seaConversions,
        seoConversions: row.seoConversions,
        totalConversions: row.totalConversions,
        totalSessions: row.totalSessions,
      });
      continue;
    }
    existing.seaClicks += row.seaClicks;
    existing.seoClicks += row.seoClicks;
    existing.seaSessions += row.seaSessions;
    existing.seoSessions += row.seoSessions;
    existing.seaConversions += row.seaConversions;
    existing.seoConversions += row.seoConversions;
    existing.totalConversions += row.totalConversions;
    existing.totalSessions += row.totalSessions;
  }

  return sortByDate([...buckets.values()]);
}

export function aggregateClicksRows(
  rows: readonly TimelineClicksRow[],
  granularity: TimelineGranularity,
): TimelineClicksRow[] {
  if (granularity === "day" || rows.length === 0) {
    return sortByDate([...rows]);
  }

  type Acc = {
    date: string;
    seaClicks: number;
    seoClicks: number;
    cost: number;
    ctrWeightedSum: number;
    clickWeight: number;
    clicks: number;
  };

  const buckets = new Map<string, Acc>();

  for (const row of rows) {
    const bucket = bucketStartIso(row.date, granularity);
    if (!bucket) {
      continue;
    }
    const dayClicks = row.seaClicks + row.seoClicks;
    const existing = buckets.get(bucket);
    if (!existing) {
      buckets.set(bucket, {
        date: bucket,
        seaClicks: row.seaClicks,
        seoClicks: row.seoClicks,
        cost: row.cost,
        ctrWeightedSum: row.ctr * dayClicks,
        clickWeight: dayClicks,
        clicks: row.clicks,
      });
      continue;
    }
    existing.seaClicks += row.seaClicks;
    existing.seoClicks += row.seoClicks;
    existing.cost += row.cost;
    existing.ctrWeightedSum += row.ctr * dayClicks;
    existing.clickWeight += dayClicks;
    existing.clicks += row.clicks;
  }

  return sortByDate(
    [...buckets.values()].map((acc) => ({
      date: acc.date,
      seaClicks: acc.seaClicks,
      seoClicks: acc.seoClicks,
      cost: acc.cost,
      clicks: acc.clicks,
      ctr:
        acc.clickWeight > 0 ? acc.ctrWeightedSum / acc.clickWeight : 0,
    })),
  );
}

/** CPC bucket pour tooltip : Σ coût / Σ clics (SEA+SEO). */
export function bucketCpc(row: TimelineClicksRow): number | null {
  const clicks = row.seaClicks + row.seoClicks;
  if (clicks <= 0 || !Number.isFinite(row.cost)) {
    return null;
  }
  return row.cost / clicks;
}
