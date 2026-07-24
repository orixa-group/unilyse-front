import Link from "next/link";
import { Surface } from "@/components/ui/surface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type StrategyWorkPanelColumn = {
  id: string;
  label: string;
};

type StrategyWorkPanelProps = {
  title: string;
  /** Lien « Tout voir » — omis sur les pages détail. */
  seeAllHref?: string;
  columns: readonly StrategyWorkPanelColumn[];
};

export function StrategyWorkPanel({
  title,
  seeAllHref,
  columns,
}: StrategyWorkPanelProps) {
  return (
    <Surface padding="md" className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {seeAllHref ? (
          <Link
            href={seeAllHref}
            className="text-primary shrink-0 text-xs font-medium hover:underline"
          >
            Tout voir
          </Link>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted">
              {columns.map((column) => (
                <TableHead key={column.id} className="whitespace-nowrap">
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-muted-foreground py-8 text-center text-sm"
              >
                Contenu à venir
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </Surface>
  );
}

export const STRATEGY_NETLINKING_COLUMNS = [
  { id: "keyword", label: "Mot-clé" },
  { id: "priority", label: "Priorité" },
  { id: "target", label: "Cible netlinking" },
  { id: "score", label: "Score / Cible" },
  { id: "objective", label: "Objectif" },
] as const;

export const STRATEGY_CONTENT_COLUMNS = [
  { id: "keyword", label: "Mot-clé" },
  { id: "priority", label: "Priorité" },
  { id: "target", label: "Cible sémantique" },
  { id: "score", label: "Score / Cible" },
  { id: "objective", label: "Objectif" },
] as const;
