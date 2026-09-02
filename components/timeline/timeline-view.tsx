"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
import { Autocomplete } from "@/components/ui/autocomplete";
import { Button } from "@/components/ui/button";
import { ChartLegend } from "@/components/ui/chart-legend";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { DataRefreshingOverlay } from "@/components/ui/data-refreshing-overlay";
import { StatCard } from "@/components/ui/stat-card";
import {
  useTimeline,
  useTimelineCtrBudget,
  useTimelineTraffic,
} from "@/hooks/use-timeline-api";
import { useProjectThemes } from "@/hooks/use-themes-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import {
  formatCurrencyEur,
  formatNumber,
  formatPercentValue,
} from "@/lib/utils/formatting";
import {
  CHART_CONV,
  CHART_COST,
  CHART_CTR,
  CHART_SEA,
  CHART_SEA_SESSIONS,
  CHART_SEO,
  CHART_SEO_SESSIONS,
  CHART_TICK,
} from "@/lib/ui/chart-theme";
import { cn } from "@/lib/utils/cn";
import type {
  UnilizeTimelineCtrBudgetPoint,
  UnilizeTimelineTrafficPoint,
} from "@/types/timeline";

type CanalFilter = "all" | "seo" | "sea";

function formatAxisDate(value: string): string {
  try {
    return format(parseISO(value), "dd MMM", { locale: fr });
  } catch {
    return value;
  }
}

function formatTooltipDate(value: string): string {
  try {
    return format(parseISO(value), "dd MMMM yyyy", { locale: fr });
  } catch {
    return value;
  }
}

function mapTrafficRows(points: UnilizeTimelineTrafficPoint[]) {
  return points.map((point) => ({
    date: point.date,
    seaClicks: point.sea?.clicks ?? 0,
    seoClicks: point.seo?.clicks ?? 0,
    seaSessions: point.sea?.sessions ?? 0,
    seoSessions: point.seo?.sessions ?? 0,
    seaConversions: point.sea?.conversions ?? 0,
    seoConversions: point.seo?.conversions ?? 0,
    totalConversions: point.global?.conversions ?? 0,
  }));
}

function mapCtrBudgetRows(
  points: UnilizeTimelineCtrBudgetPoint[],
  canal: CanalFilter,
) {
  return points.map((point) => {
    const seaClicks = point.sea?.clicks ?? 0;
    const seoClicks = point.seo?.clicks ?? 0;
    const clicks =
      canal === "sea"
        ? seaClicks
        : canal === "seo"
          ? seoClicks
          : seaClicks + seoClicks;
    return {
      date: point.date,
      clicks,
      seaClicks,
      seoClicks,
      ctr: point.global?.ctr ?? 0,
      cost: point.sea?.cost ?? 0,
    };
  });
}

function ChartCard({
  title,
  children,
  empty,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
}) {
  return (
    <section className="border-border bg-card rounded-xl border p-4">
      <h2 className="text-foreground mb-3 text-sm font-medium">{title}</h2>
      {empty ? (
        <p className="text-muted-foreground flex h-56 items-center justify-center text-sm">
          Aucune donnée sur cette période.
        </p>
      ) : (
        <div className="h-64 w-full">{children}</div>
      )}
    </section>
  );
}

export function TimelineView() {
  const { canFetchMetrics, selectedProjectId, period } =
    useProjectContext();

  const [canal, setCanal] = useState<CanalFilter>("all");
  const [theme, setTheme] = useState<string | null>(null);

  const ctrFilter = useMemo(
    () => ({
      from: period?.from,
      to: period?.to,
      theme: theme ? [theme] : undefined,
    }),
    [period?.from, period?.to, theme],
  );

  const {
    data: timelineResult,
    isLoading: isTimelineLoading,
    isFetching: isTimelineFetching,
    isError: isTimelineError,
    error: timelineError,
  } = useTimeline(canFetchMetrics ? selectedProjectId : null, period);

  const {
    data: trafficResult,
    isLoading: isTrafficLoading,
    isFetching: isTrafficFetching,
    isError: isTrafficError,
    error: trafficError,
  } = useTimelineTraffic(canFetchMetrics ? selectedProjectId : null, period);

  const {
    data: ctrResult,
    isLoading: isCtrLoading,
    isFetching: isCtrFetching,
    isError: isCtrError,
    error: ctrError,
  } = useTimelineCtrBudget(
    canFetchMetrics ? selectedProjectId : null,
    ctrFilter,
  );

  const timeline = timelineResult?.timeline ?? null;
  const trafficPoints = trafficResult?.points ?? [];
  const ctrPoints = ctrResult?.points ?? [];

  const trafficRows = useMemo(
    () => mapTrafficRows(trafficPoints),
    [trafficPoints],
  );
  const ctrRows = useMemo(
    () => mapCtrBudgetRows(ctrPoints, canal),
    [ctrPoints, canal],
  );

  const { data: themesResult } = useProjectThemes(
    canFetchMetrics ? selectedProjectId : null,
  );

  const themeOptions = useMemo(
    () =>
      (themesResult?.themes ?? []).map((theme) => {
        const label = formatKeywordLabel(theme);
        return { value: label, label };
      }),
    [themesResult?.themes],
  );

  const isLoading =
    (isTimelineLoading && !timelineResult) ||
    (isTrafficLoading && !trafficResult) ||
    (isCtrLoading && !ctrResult);

  const isRefreshing =
    Boolean(timelineResult || trafficResult || ctrResult) &&
    (isTimelineFetching || isTrafficFetching || isCtrFetching);

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="flex justify-end">
          <LoadingSkeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <LoadingSkeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isTimelineError) {
    return (
      <BffErrorAlert
        error={timelineError}
        fallback="Impossible de charger la timeline."
        title="Timeline indisponible"
      />
    );
  }

  const global = timeline?.global;
  const sea = timeline?.sea;
  const seo = timeline?.seo;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <PerformancePeriodPicker />
      </div>

      <DataRefreshingOverlay active={isRefreshing} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mots-clés"
          value={formatNumber(global?.keyword_count ?? 0)}
        />
        <StatCard
          label="Volume de recherche"
          value={formatNumber(global?.search_volume ?? 0)}
        />
        <StatCard
          label="Clics SEA"
          value={formatNumber(sea?.clicks ?? 0)}
          hint={
            sea
              ? `${formatPercentValue(sea.conversions_share)} des conversions`
              : undefined
          }
        />
        <StatCard
          label="Clics SEO"
          value={formatNumber(seo?.clicks ?? 0)}
          hint={
            seo
              ? `${formatPercentValue(seo.conversions_share)} des conversions`
              : undefined
          }
        />
        <StatCard
          label="CTR global"
          value={
            global?.ctr === undefined || global?.ctr === null
              ? "—"
              : formatPercentValue(global.ctr)
          }
        />
        <StatCard
          label="Conversions"
          value={formatNumber(global?.conversions ?? 0)}
          hint={
            sea && seo
              ? `SEA ${formatNumber(sea.conversions)} · SEO ${formatNumber(seo.conversions)}`
              : undefined
          }
        />
        <StatCard
          label="Recherches sans clic"
          value={formatNumber(global?.no_click_count ?? 0)}
        />
      </div>

      {(isTrafficError || isCtrError) && (
        <BffErrorAlert
          error={trafficError ?? ctrError}
          fallback="Certaines séries timeline n'ont pas pu être chargées."
          title="Données graphiques partielles"
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Trafic (clics & sessions)" empty={trafficRows.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trafficRows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={CHART_TICK}
              />
              <YAxis tick={CHART_TICK} />
              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    labelFormatter={(label) =>
                      formatTooltipDate(String(label))
                    }
                  />
                )}
              />
              <Legend content={<ChartLegend />} />
              <Bar
                dataKey="seaClicks"
                name="Clics SEA"
                fill={CHART_SEA}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="seoClicks"
                name="Clics SEO"
                fill={CHART_SEO}
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="seaSessions"
                name="Sessions SEA"
                stroke={CHART_SEA_SESSIONS}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="seoSessions"
                name="Sessions SEO"
                stroke={CHART_SEO_SESSIONS}
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Conversions" empty={trafficRows.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trafficRows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={CHART_TICK}
              />
              <YAxis tick={CHART_TICK} />
              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    labelFormatter={(label) =>
                      formatTooltipDate(String(label))
                    }
                  />
                )}
              />
              <Legend content={<ChartLegend />} />
              <Line
                type="monotone"
                dataKey="seaConversions"
                name="Conv. SEA"
                stroke={CHART_SEA}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="seoConversions"
                name="Conv. SEO"
                stroke={CHART_SEO}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="totalConversions"
                name="Conv. total"
                stroke={CHART_CONV}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <p className="text-muted-foreground mb-1 text-xs font-medium">
            Thématique
          </p>
          <Autocomplete
            options={themeOptions}
            value={theme}
            onValueChange={setTheme}
            placeholder="Toutes les thématiques"
            clearable
            clearLabel="Toutes"
            aria-label="Filtrer par thématique"
          />
        </div>
        <div className="flex gap-1">
          {(
            [
              ["all", "SEO + SEA"],
              ["seo", "SEO only"],
              ["sea", "SEA only"],
            ] as const
          ).map(([id, label]) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={canal === id ? "default" : "outline"}
              className={cn(canal === id && "pointer-events-none")}
              onClick={() => setCanal(id)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Répartition des clics"
          empty={ctrRows.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ctrRows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={CHART_TICK}
              />
              <YAxis tick={CHART_TICK} />
              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    labelFormatter={(label) =>
                      formatTooltipDate(String(label))
                    }
                  />
                )}
              />
              <Legend content={<ChartLegend />} />
              <Bar
                dataKey="clicks"
                name={
                  canal === "seo"
                    ? "Clics SEO"
                    : canal === "sea"
                      ? "Clics SEA"
                      : "Clics"
                }
                fill={canal === "seo" ? CHART_SEO : CHART_SEA}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Évolution CTR & budgets"
          empty={ctrRows.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={ctrRows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                tickFormatter={formatAxisDate}
                tick={CHART_TICK}
              />
              <YAxis
                yAxisId="left"
                tick={CHART_TICK}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={CHART_TICK}
                tickFormatter={(v) => formatCurrencyEur(Number(v))}
              />
              <Tooltip
                content={(props) => (
                  <ChartTooltip
                    {...props}
                    labelFormatter={(label) =>
                      formatTooltipDate(String(label))
                    }
                    valueFormatter={(value, name) => {
                      const n = Number(value);
                      if (name === "Coût ads") {
                        return formatCurrencyEur(n);
                      }
                      return `${formatNumber(n)} %`;
                    }}
                  />
                )}
              />
              <Legend content={<ChartLegend />} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="ctr"
                name="CTR global"
                fill={CHART_CTR}
                fillOpacity={0.15}
                stroke={CHART_CTR}
                strokeWidth={2}
              />
              <Bar
                yAxisId="right"
                dataKey="cost"
                name="Coût ads"
                fill={CHART_COST}
                radius={[2, 2, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      </DataRefreshingOverlay>
    </div>
  );
}
