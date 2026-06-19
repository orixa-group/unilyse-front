import type { UnilizeStrategySummary } from "@/types/strategy";

export function StrategySummary({ summary }: { summary: UnilizeStrategySummary }) {
  const items = [
    { label: "Mots-clés SEO", value: summary.seo_keywords_count },
    { label: "Mots-clés SEA", value: summary.sea_keywords_count },
    { label: "SEO + SEA", value: summary.hybrid_keywords_count },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-muted/30 rounded-xl border px-4 py-3"
        >
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
