import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const surfaceVariants = cva("rounded-xl", {
  variants: {
    variant: {
      default: "border bg-card shadow-sm",
      muted: "bg-muted/30 border",
      dashed: "border border-dashed bg-muted/30",
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
