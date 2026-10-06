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
  "flex h-9 w-full min-w-0 items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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
  const wasOpenRef = useRef(false);

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
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) {
      return;
    }
    wasOpenRef.current = true;
    setQuery("");
    const selectedIndex = options.findIndex((option) => option.value === value);
    const offset = clearable && value ? 1 : 0;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex + offset : 0);
    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open, clearable, options, value]);

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

  const showClearControl = clearable && Boolean(value) && !isDisabled;
  const clearRowOffset = showClearControl ? 1 : 0;
  const navigableCount = clearRowOffset + filteredOptions.length;
  const isClearHighlighted = showClearControl && highlightedIndex === 0;

  const clearSelection = () => {
    onValueChange(null);
    setOpen(false);
  };

  const handleClear = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearSelection();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (navigableCount === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => (i + 1) % navigableCount);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => (i - 1 + navigableCount) % navigableCount);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (isClearHighlighted) {
        clearSelection();
        return;
      }
      const option = filteredOptions[highlightedIndex - clearRowOffset];
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
    <div className={cn("relative min-w-0", className)}>
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
            className={cn(selectTriggerClassName, "w-full")}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left",
                !selectedOption && !listEmpty && "text-muted-foreground",
                listEmpty && "text-muted-foreground",
              )}
              title={selectedOption?.label}
            >
              {triggerLabel}
            </span>
            <span className="flex shrink-0 items-center">
              {showClearControl ? (
                <span className="inline-block w-7" aria-hidden />
              ) : null}
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
            </span>
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
            onChange={(event) => {
              setQuery(event.target.value);
              setHighlightedIndex(0);
            }}
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
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none",
                isClearHighlighted
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(0)}
              onClick={clearSelection}
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
              const isHighlighted =
                highlightedIndex === index + clearRowOffset;

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
                  onMouseEnter={() =>
                    setHighlightedIndex(index + clearRowOffset)
                  }
                  onClick={() => handleSelect(option)}
                  title={option.label}
                >
                  <span className="min-w-0 flex-1 break-words">{option.label}</span>
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
          className="text-muted-foreground hover:text-foreground hover:bg-accent absolute top-1 right-8 z-10 flex h-7 w-7 items-center justify-center rounded-sm"
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
