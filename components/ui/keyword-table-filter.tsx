"use client";

import { Input } from "@/components/ui/input";

export function KeywordTableFilter({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Filtrer par mot-clé…"
      className="h-8 w-44 sm:w-52"
      disabled={disabled}
      aria-label="Filtrer par mot-clé"
    />
  );
}
