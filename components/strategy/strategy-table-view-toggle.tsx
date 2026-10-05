"use client";

import { ButtonGroup } from "@/components/ui/button-group";

export type StrategyTableViewMode = "simple" | "full";

const OPTIONS: { id: StrategyTableViewMode; label: string }[] = [
  { id: "simple", label: "Vue simplifiée" },
  { id: "full", label: "Vue complète" },
];

export function StrategyTableViewToggle({
  value,
  onChange,
  disabled,
}: {
  value: StrategyTableViewMode;
  onChange: (value: StrategyTableViewMode) => void;
  disabled?: boolean;
}) {
  return (
    <ButtonGroup
      value={value}
      onChange={onChange}
      options={OPTIONS}
      ariaLabel="Mode d'affichage du tableau"
      disabled={disabled}
    />
  );
}
