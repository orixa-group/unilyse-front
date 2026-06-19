"use client";

import * as React from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/cn";

export interface AutocompleteOption {
  value: string;
  label: string;
}

export interface AutocompleteProps {
  options: AutocompleteOption[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  /** Texte affiché sur le trigger quand aucune valeur n’est sélectionnée */
  placeholder?: string;
  /** Placeholder du champ de recherche dans le panneau */
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  /** Permet de désélectionner (option dans la liste + bouton sur le trigger) */
  clearable?: boolean;
  /** Libellé de l’option de désélection dans la liste */
  clearLabel?: string;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

const selectTriggerClassName =
  "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function Autocomplete({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  emptyMessage = "Aucune option disponible",
  noResultsMessage = "Aucun résultat",
  clearable = false,
  clearLabel = "Aucune sélection",
  disabled = false,
  id: idProp,
  "aria-label": ariaLabel,
  className,
}: AutocompleteProps) {
  const generatedId = useId();
  const triggerId = idProp ?? generatedId;
  const listboxId = `${triggerId}-listbox`;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }
    return options.filter((o) => o.label.toLowerCase().includes(normalized));
  }, [options, query]);

  const listEmpty = options.length === 0;
  const isDisabled = disabled || listEmpty;
  const noResults = !listEmpty && filteredOptions.length === 0;

  const triggerLabel = listEmpty
    ? emptyMessage
    : (selectedOption?.label ?? placeholder);

  useEffect(() => {
    if (!open) {
      return;
    }
    setQuery("");
    setHighlightedIndex(0);
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  const handleOpenChange = (next: boolean) => {
    if (isDisabled) {
      return;
    }
    setOpen(next);
  };

  const handleSelect = (option: AutocompleteOption) => {
    onValueChange(option.value);
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onValueChange(null);
    setOpen(false);
  };

  const showClearControl = clearable && Boolean(value) && !isDisabled;

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (filteredOptions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => (i + 1) % filteredOptions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex(
        (i) => (i - 1 + filteredOptions.length) % filteredOptions.length,
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) {
        handleSelect(option);
      }
    }
  };

  const handleListWheel = (event: React.WheelEvent<HTMLUListElement>) => {
    event.stopPropagation();
    const element = event.currentTarget;
    if (element.scrollHeight <= element.clientHeight) {
      return;
    }
    element.scrollTop += event.deltaY;
    event.preventDefault();
  };

  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={triggerId}
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            aria-label={ariaLabel}
            disabled={isDisabled}
            className={cn(selectTriggerClassName, "min-w-0 flex-1")}
          >
            <span
              className={cn(
                "line-clamp-1 min-w-0 flex-1 text-left",
                !selectedOption && !listEmpty && "text-muted-foreground",
                listEmpty && "text-muted-foreground",
              )}
            >
              {triggerLabel}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.5}
              className={cn(
                "shrink-0 opacity-50 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>

      <PopoverContent
        className="z-[100] w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onWheelCapture={(event) => event.stopPropagation()}
        onTouchMoveCapture={(event) => event.stopPropagation()}
      >
        <div className="border-b p-2">
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={searchPlaceholder}
            disabled={isDisabled}
            autoComplete="off"
            aria-label={ariaLabel ? `${ariaLabel} — recherche` : "Rechercher"}
            className="h-8"
          />
        </div>

        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="max-h-60 touch-pan-y overflow-y-auto overscroll-contain p-1"
          onWheel={handleListWheel}
          onWheelCapture={(event) => event.stopPropagation()}
        >
          {showClearControl ? (
            <li
              role="option"
              aria-selected={false}
              className="text-muted-foreground relative flex cursor-default select-none items-center rounded-sm border-b py-1.5 pl-2 pr-2 text-sm outline-none"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onValueChange(null);
                setOpen(false);
              }}
            >
              {clearLabel}
            </li>
          ) : null}
          {noResults ? (
            <li className="text-muted-foreground px-2 py-2 text-sm">
              {noResultsMessage}
            </li>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={option.value}
                  id={`${triggerId}-option-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
                    isHighlighted && "bg-accent text-accent-foreground",
                    isSelected && !isHighlighted && "bg-accent/50",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                  {isSelected ? (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        size={16}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                    </span>
                  ) : null}
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
      </Popover>

      {showClearControl ? (
        <button
          type="button"
          aria-label={`${clearLabel} — effacer la sélection`}
          className="text-muted-foreground hover:text-foreground border-input flex h-9 shrink-0 items-center justify-center rounded-md border bg-transparent px-2 shadow-sm transition-colors hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50"
          onClick={handleClear}
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={14}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
      ) : null}
    </div>
  );
}
