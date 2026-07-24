import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const surfaceVariants = cva("rounded-xl", {
  variants: {
    variant: {
      default: "border border-border bg-card",
      muted: "bg-muted/60 border border-border",
      dashed: "border border-dashed border-border bg-muted/60",
    },
    padding: {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "none",
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export function Surface({
  className,
  variant,
  padding,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(surfaceVariants({ variant, padding }), className)}
      {...props}
    />
  );
}
