import { cn } from "@/lib/utils/cn";

export function DataTableShell({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {title || description || actions ? (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            {title ? (
              <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            ) : null}
            {description ? (
              <p className="text-muted-foreground text-xs">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="w-full overflow-x-auto rounded-xl border">{children}</div>
    </div>
  );
}
