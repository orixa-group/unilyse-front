import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Surface
      variant="dashed"
      padding="lg"
      className={cn("flex flex-col items-center text-center", className)}
    >
      <h3 className="text-base font-semibold">{title}</h3>
      {description ? (
        <p className="text-muted-foreground mt-2 max-w-md text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Surface>
  );
}
