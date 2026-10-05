"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  StrategyFunnelFilters,
  themeOptionsFromKeywords,
} from "@/components/strategy/strategy-funnel-filters";
import { TimelineRecommendationEvents } from "@/components/timeline/timeline-recommendation-events";
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
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { ButtonGroup } from "@/components/ui/button-group";
import { ChartLegend } from "@/components/ui/chart-legend";
import { ChartTooltip } from "@/components/ui/chart-tooltip";
import { DataRefreshingOverlay } from "@/components/ui/data-refreshing-overlay";
import { StatCard } from "@/components/ui/stat-card";
import {
  useTimeline,
  useTimelineCtrBudget,
  useTimelineTraffic,
} from "@/hooks/use-timeline-api";
import { useRecommendations } from "@/hooks/use-recommendations-api";
import { useProjectThemes } from "@/hooks/use-themes-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { useProjectsDetails } from "@/hooks/use-unilize-api";
import { buildRecommendationTimelineEvents } from "@/lib/strategy/recommendation-events";
import { useSelectionStore } from "@/stores/selection.store";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import { normalizeTimelineFilterQuery } from "@/lib/unilize/period-query";
import { formatFractionPercent } from "@/lib/performances/format-metrics";
import {
  aggregateClicksRows,
  aggregateTrafficRows,
  bucketCpc,
} from "@/lib/timeline/aggregate-timeline-series";
import {
  countPeriodDays,
  formatTimelineAxisDate,
  formatTimelineTooltipDate,
  resolveSuggestedGranularity,
  type TimelineGranularity,
} from "@/lib/timeline/timeline-granularity";
import { formatCurrencyEur, formatNumber } from "@/lib/utils/formatting";
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
import type { UnilizeClicksPoint, UnilizeTrafficPoint } from "@/types/timeline";

type CanalFilter = "all" | "seo" | "sea";
type TrafficMetric = "clicks" | "sessions";

const GRANULARITY_CONTROLS: readonly {
  id: TimelineGranularity;
  label: string;
}[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
];

function mapTrafficRows(points: UnilizeTrafficPoint[]) {
  return points.map((point) => ({
    date: point.date,
    seaClicks: point.paid?.clicks ?? 0,
    seoClicks: point.organic?.clicks ?? 0,
    seaSessions: point.paid?.sessions ?? 0,
    seoSessions: point.organic?.sessions ?? 0,
    seaConversions: point.paid?.conversions ?? 0,
    seoConversions: point.organic?.conversions ?? 0,
    totalConversions: point.global?.conversions ?? 0,
    totalSessions: point.global?.sessions ?? 0,
  }));
}

function mapClicksRows(points: UnilizeClicksPoint[], canal: CanalFilter) {
  return points.map((point) => {
    const seaClicks = point.paid?.clicks ?? 0;
    const seoClicks = point.organic?.clicks ?? 0;
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
      cost: point.paid?.cost ?? 0,
    };
  });
}

function ChartCard({
  title,
  children,
  empty,
  actions,
}: {
  title: string;
  children: ReactNode;
  empty?: boolean;
  actions?: ReactNode;
}) {
  return (
    <section className="border-border bg-card rounded-xl border p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 h-9">
        <h2 className="text-foreground text-sm font-medium">{title}</h2>
        {actions}
      </div>
      {empty ? (
        <p className="text-muted-foreground flex h-56 items-center justify-center text-sm">
          Aucune donnée sur cette période.
        </p>
      ) : (
        <div className="h-64 w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper_*]:outline-none [&_.recharts-wrapper_*:focus]:outline-none [&_.recharts-wrapper_*:focus-visible]:outline-none">
          {children}
        </div>
      )}
    </section>
  );
}

export function TimelineView() {
  const {
    canFetchMetrics,
    selectedProjectId,
    period,
    recommendationAsOfDate,
    recommendationDate,
  } = useProjectContext();

  const selectedTheme = useSelectionStore((s) => s.selectedTheme);
  const selectedKeyword = useSelectionStore((s) => s.selectedKeyword);

  const [canal, setCanal] = useState<CanalFilter>("all");
  const [trafficMetric, setTrafficMetric] = useState<TrafficMetric>("clicks");
  const [granularity, setGranularity] = useState<TimelineGranularity>(() =>
    resolveSuggestedGranularity(
      countPeriodDays(period?.from, period?.until),
    ),
  );

  useEffect(() => {
    setGranularity(
      resolveSuggestedGranularity(
        countPeriodDays(period?.from, period?.until),
      ),
    );
  }, [period?.from, period?.until]);

  const formatAxisDate = useCallback(
    (value: string) =>
      formatTimelineAxisDate(String(value), granularity),
    [granularity],
  );

  const formatTooltipDate = useCallback(
    (value: string) =>
      formatTimelineTooltipDate(String(value), granularity),
    [granularity],
  );

  const ctrFilter = useMemo(
    () =>
      normalizeTimelineFilterQuery({
        from: period?.from,
        until: period?.until,
        theme: selectedTheme ? [selectedTheme] : undefined,
        keyword: selectedKeyword ? [selectedKeyword] : undefined,
      }),
    [period, selectedTheme, selectedKeyword],
  );

  const dateContext = useMemo(
    () => ({
      recommendationAsOfDate,
    }),
    [recommendationAsOfDate],
  );

  const { data: recommendationsResult } = useRecommendations(
    canFetchMetrics ? selectedProjectId : null,
    dateContext,
  );

  const projectDetailsQuery = useProjectsDetails(
    selectedProjectId ? [selectedProjectId] : [],
    { enabled: canFetchMetrics },
  );
  const projectKeywords =
    projectDetailsQuery[0]?.data?.project?.keywords ?? [];
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

  const summary = timelineResult?.summary ?? null;
  const trafficPoints = trafficResult?.points ?? [];
  const ctrPoints = ctrResult?.points ?? [];

  const trafficRows = useMemo(() => {
    const mapped = mapTrafficRows(trafficPoints);
    return aggregateTrafficRows(mapped, granularity);
  }, [trafficPoints, granularity]);

  const ctrRows = useMemo(() => {
    const mapped = mapClicksRows(ctrPoints, canal);
    return aggregateClicksRows(mapped, granularity);
  }, [ctrPoints, canal, granularity]);

  const { data: themesResult } = useProjectThemes(
    canFetchMetrics ? selectedProjectId : null,
  );

  const themeOptions = useMemo(() => {
    const fromApi = (themesResult?.themes ?? []).map((theme) => ({
      value: theme,
      label: formatKeywordLabel(theme),
    }));
    if (fromApi.length > 0) {
      return fromApi;
    }
    return themeOptionsFromKeywords(projectKeywords);
  }, [themesResult?.themes, projectKeywords]);

  const recommendationEvents = useMemo(() => {
    const keywords =
      recommendationsResult?.projectRecommendations?.keywords ?? [];
    return buildRecommendationTimelineEvents(keywords);
  }, [recommendationsResult?.projectRecommendations?.keywords]);

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
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingSkeleton className="h-64 w-full rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-xl" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <LoadingSkeleton className="h-64 w-full rounded-xl" />
          <LoadingSkeleton className="h-64 w-full rounded-xl" />
        </div>
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

  const global = summary?.global;
  const paid = summary?.paid;
  const organic = summary?.organic;

  return (
    <div className="space-y-6">
      <DataRefreshingOverlay active={isRefreshing} className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Mots-clés"
          value={formatNumber(global?.keyword_count ?? 0)}
        />
        <StatCard
          label="Volume de recherche"
          value={formatNumber(global?.search_volume ?? 0)}
          hint="Estimation mensuelle agrégée (non proratisée sur la période)"
        />
        <StatCard
          label="Clics SEA"
          value={formatNumber(paid?.clicks ?? 0)}
          hint={
            paid
              ? `${formatFractionPercent(paid.conversion_share)} des conversions`
              : undefined
          }
        />
        <StatCard
          label="Clics SEO"
          value={formatNumber(organic?.clicks ?? 0)}
          hint={
            organic
              ? `${formatFractionPercent(organic.conversion_share)} des conversions`
              : undefined
          }
        />
        <StatCard
          label="CTR global"
          value={formatFractionPercent(global?.ctr)}
        />
        <StatCard
          label="Conversions"
          value={formatNumber(global?.conversions ?? 0)}
          hint={
            paid && organic
              ? `SEA ${formatNumber(paid.conversions)} · SEO ${formatNumber(organic.conversions)}`
              : undefined
          }
        />
        <StatCard
          label="Recherches sans clic"
          value={formatNumber(global?.no_clicks ?? 0)}
        />
      </div>

      {(isTrafficError || isCtrError) && (
        <BffErrorAlert
          error={trafficError ?? ctrError}
          fallback="Certaines séries timeline n'ont pas pu être chargées."
          title="Données graphiques partielles"
        />
      )}

      <TimelineRecommendationEvents
        events={recommendationEvents}
        readAsOf={recommendationDate}
      />

      <section className="border rounded-xl">
        <div className="space-y-4 p-4 pb-8">
          <div className="flex items-baseline">
            <div className="me-auto">
              <h2 className="text-foreground text-xl font-medium">
                Vue d&apos;ensemble trafic &amp; conversions
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Agrégat projet sur la période — indépendant des filtres thématique /
                mot-clé.
              </p>
            </div>          
            <ButtonGroup
              value={granularity}
              onChange={setGranularity}
              options={GRANULARITY_CONTROLS}
              ariaLabel="Granularité des graphiques"
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title={
                trafficMetric === "clicks" ? "Trafic — clics" : "Trafic — sessions"
              }
              empty={trafficRows.length === 0}
              actions={
                <ButtonGroup
                  value={trafficMetric}
                  onChange={setTrafficMetric}
                  options={[
                    { id: "clicks", label: "Clics" },
                    { id: "sessions", label: "Sessions" },
                  ]}
                  ariaLabel="Métrique du trafic"
                />
              }
            >
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
                  {trafficMetric === "clicks" ? (
                    <>
                      <Bar
                        dataKey="seaClicks"
                        name="Clics SEA"
                        stackId="traffic"
                        fill={CHART_SEA}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="seoClicks"
                        name="Clics SEO"
                        stackId="traffic"
                        fill={CHART_SEO}
                        radius={[2, 2, 0, 0]}
                      />
                    </>
                  ) : (
                    <>
                      <Bar
                        dataKey="seaSessions"
                        name="Sessions SEA"
                        stackId="traffic"
                        fill={CHART_SEA_SESSIONS}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="seoSessions"
                        name="Sessions SEO"
                        stackId="traffic"
                        fill={CHART_SEO_SESSIONS}
                        radius={[2, 2, 0, 0]}
                      />
                    </>
                  )}
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
        </div>

        <div className="border-t p-4 pt-6 space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2">
              <h2 className="text-foreground text-xl font-medium">
                Répartition &amp; efficacité
              </h2>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Thématique et mot-clé appliqués aux deux graphiques (API clics /
                CTR).
              </p>
            </div>
            <StrategyFunnelFilters
              keywords={projectKeywords}
              themeOptions={themeOptions}
              disabled={isRefreshing}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Répartition des clics"
              empty={ctrRows.length === 0}
              actions={
                <ButtonGroup
                  value={canal}
                  onChange={setCanal}
                  options={[
                    { id: "all", label: "SEO + SEA" },
                    { id: "seo", label: "SEO only" },
                    { id: "sea", label: "SEA only" },
                  ]}
                  ariaLabel="Répartition des clics"
                />
              }
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
                  {canal === "all" ? (
                    <>
                      <Bar
                        dataKey="seaClicks"
                        name="Clics SEA"
                        stackId="clicks"
                        fill={CHART_SEA}
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="seoClicks"
                        name="Clics SEO"
                        stackId="clicks"
                        fill={CHART_SEO}
                        radius={[2, 2, 0, 0]}
                      />
                    </>
                  ) : (
                    <Bar
                      dataKey={canal === "seo" ? "seoClicks" : "seaClicks"}
                      name={canal === "seo" ? "Clics SEO" : "Clics SEA"}
                      fill={canal === "seo" ? CHART_SEO : CHART_SEA}
                      radius={[2, 2, 0, 0]}
                    />
                  )}
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
                    tickFormatter={(v) => formatFractionPercent(Number(v))}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={CHART_TICK}
                    tickFormatter={(v) => formatCurrencyEur(Number(v))}
                  />
                  <Tooltip
                    content={(props) => {
                      const row = props.payload?.[0]?.payload as
                        | ReturnType<typeof mapClicksRows>[number]
                        | undefined;
                      const cpc = row ? bucketCpc(row) : null;
                      return (
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
                            return formatFractionPercent(n);
                          }}
                          footer={
                            cpc != null
                              ? `CPC bucket : ${formatCurrencyEur(cpc)}`
                              : undefined
                          }
                        />
                      );
                    }}
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
        </div>
      </section>
      </DataRefreshingOverlay>
    </div>
  );
}
