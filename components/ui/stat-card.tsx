import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  href,
  actionLabel = "Voir le détail →",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warning" | "success";
  href?: string;
  actionLabel?: string;
  className?: string;
}) {
  const content = (
    <div
      className={cn(
        "rounded-xl border px-4 py-3",
        tone === "warning"
          ? "border-warning/50 bg-warning/10"
          : tone === "success"
            ? "border-success/50 bg-success/10"
            : "bg-muted/30",
        href && "transition-colors hover:bg-muted/40",
        className,
      )}
    >
      <p
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          tone === "warning"
            ? "text-warning"
            : tone === "success"
              ? "text-success"
              : "text-muted-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl tabular-nums",
          tone === "warning"
            ? "text-warning font-semibold"
            : tone === "success"
              ? "text-success font-semibold"
              : "font-semibold",
        )}
      >
        {value}
      </p>
      {hint ? (
        <p
          className={cn(
            "mt-1 text-xs",
            tone === "warning"
              ? "text-warning/80"
              : tone === "success"
                ? "text-success/80"
                : "text-muted-foreground",
          )}
        >
          {hint}
        </p>
      ) : null}
      {href ? (
        <p className="text-primary mt-2 text-xs font-medium">{actionLabel}</p>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
