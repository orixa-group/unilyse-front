"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { TableSkeleton } from "@/components/common/table-skeleton";
import { PerformancePeriodPicker } from "@/components/performances/performance-period-picker";
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
import { useRecommendations } from "@/hooks/use-recommendations-api";
import { useProjectThemes } from "@/hooks/use-themes-api";
import { useProjectContext } from "@/hooks/use-project-context";
import { useProjectsDetails } from "@/hooks/use-unilize-api";
import { buildRecommendationTimelineEvents } from "@/lib/strategy/recommendation-events";
import { useSelectionStore } from "@/stores/selection.store";
import { formatKeywordLabel } from "@/lib/projects/keywords";
import { normalizeTimelineFilterQuery } from "@/lib/unilize/period-query";
import { formatFractionPercent } from "@/lib/performances/format-metrics";
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
import { cn } from "@/lib/utils/cn";
import type { UnilizeClicksPoint, UnilizeTrafficPoint } from "@/types/timeline";

type CanalFilter = "all" | "seo" | "sea";
type TrafficMetric = "clicks" | "sessions";

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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-foreground text-sm font-medium">{title}</h2>
        {actions}
      </div>
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
  const {
    canFetchMetrics,
    selectedProjectId,
    period,
    recommendationAsOfDate,
    recommendationDate,
  } = useProjectContext();

  const selectedTheme = useSelectionStore((s) => s.selectedTheme);
  const selectedKeyword = useSelectionStore((s) => s.selectedKeyword);
  const [keywordQuery, setKeywordQuery] = useState("");

  const [canal, setCanal] = useState<CanalFilter>("all");
  const [trafficMetric, setTrafficMetric] = useState<TrafficMetric>("clicks");

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
      period,
    }),
    [recommendationAsOfDate, period],
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

  const trafficRows = useMemo(
    () => mapTrafficRows(trafficPoints),
    [trafficPoints],
  );
  const ctrRows = useMemo(
    () => mapClicksRows(ctrPoints, canal),
    [ctrPoints, canal],
  );

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
      <div className="flex flex-wrap items-center justify-end gap-2">
        <PerformancePeriodPicker />
      </div>

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

      <section className="border-border bg-muted/20 space-y-4 rounded-xl border p-4">
        <div>
          <h2 className="text-foreground text-sm font-medium">
            Vue d&apos;ensemble trafic &amp; conversions
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Agrégat projet sur la période — indépendant des filtres thématique /
            mot-clé.
          </p>
        </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={
            trafficMetric === "clicks" ? "Trafic — clics" : "Trafic — sessions"
          }
          empty={trafficRows.length === 0}
          actions={
            <div className="flex gap-1">
              {(
                [
                  ["clicks", "Clics"],
                  ["sessions", "Sessions"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={trafficMetric === id ? "default" : "outline"}
                  className={cn(trafficMetric === id && "pointer-events-none")}
                  onClick={() => setTrafficMetric(id)}
                >
                  {label}
                </Button>
              ))}
            </div>
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
      </section>

      <section className="border-border space-y-4 border-t pt-8">
        <div className="space-y-4">
          <div>
            <h2 className="text-foreground text-sm font-medium">
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
            keywordQuery={keywordQuery}
            onKeywordQueryChange={setKeywordQuery}
            disabled={isRefreshing}
          />
        </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Répartition des clics"
          empty={ctrRows.length === 0}
          actions={
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
      </section>
      </DataRefreshingOverlay>
    </div>
  );
}
