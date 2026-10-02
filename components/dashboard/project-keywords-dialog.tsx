"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEmptyThemeSection,
  keywordsToThemeEditorState,
  parseThemeEditorState,
  type KeywordThemeSection,
} from "@/lib/projects/keywords";
import type { UnilizeKeyword, UnilizeProject } from "@/types/unilize";

export function ProjectKeywordsDialog({
  open,
  onOpenChange,
  project,
  initialKeywords,
  formAction,
  isPending,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: UnilizeProject | null;
  initialKeywords: UnilizeKeyword[];
  formAction: (payload: FormData) => void;
  isPending: boolean;
  error?: string;
}) {
  const [themeSections, setThemeSections] = useState<KeywordThemeSection[]>(
    [],
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const keywordsJsonRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && project) {
      setThemeSections(keywordsToThemeEditorState(initialKeywords));
      setLocalError(null);
    }
  }, [open, project?.id, initialKeywords]);

  const updateThemeSection = (
    id: string,
    patch: Partial<Pick<KeywordThemeSection, "name" | "raw">>,
  ) => {
    setThemeSections((current) =>
      current.map((section) =>
        section.id === id ? { ...section, ...patch } : section,
      ),
    );
  };

  const removeThemeSection = (id: string) => {
    setThemeSections((current) => {
      const next = current.filter((section) => section.id !== id);
      return next.length > 0 ? next : [createEmptyThemeSection()];
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const parsed = parseThemeEditorState(themeSections);
    if ("error" in parsed) {
      event.preventDefault();
      setLocalError(parsed.error);
      return;
    }

    if (keywordsJsonRef.current) {
      keywordsJsonRef.current.value = JSON.stringify(parsed);
    }
    setLocalError(null);
  };

  const displayError = localError ?? error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mettre à jour les mots-clés</DialogTitle>
          <DialogDescription>
            {project ? (
              <>
                Un mot-clé par ligne, chaque thématique regroupe les mots-clés
                du projet{" "}
                <span className="text-foreground font-medium">
                  {project.name}
                </span>
                . Les valeurs sont normalisées par l&apos;API à
                l&apos;enregistrement.
              </>
            ) : (
              "Aucun projet sélectionné."
            )}
          </DialogDescription>
        </DialogHeader>

        {project ? (
          <form
            action={formAction}
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col gap-4"
          >
            <input type="hidden" name="projectId" value={project.id} />
            <input
              ref={keywordsJsonRef}
              type="hidden"
              name="keywordsJson"
              defaultValue="[]"
            />

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {themeSections.map((section, index) => (
                <div
                  key={section.id}
                  className="space-y-2 rounded-lg border p-3"
                >
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label htmlFor={`theme-name-${section.id}`}>
                        Thématique {index + 1}
                      </Label>
                      <Input
                        id={`theme-name-${section.id}`}
                        value={section.name}
                        onChange={(event) =>
                          updateThemeSection(section.id, {
                            name: event.target.value,
                          })
                        }
                        placeholder="Ex. Brand, Generic…"
                        disabled={isPending}
                        required={section.raw.trim().length > 0}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      disabled={isPending || themeSections.length === 1}
                      onClick={() => removeThemeSection(section.id)}
                      aria-label={`Supprimer la thématique ${section.name || index + 1}`}
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={16}
                        color="currentColor"
                        strokeWidth={1.5}
                      />
                    </Button>
                  </div>
                  <Textarea
                    value={section.raw}
                    onChange={(event) =>
                      updateThemeSection(section.id, { raw: event.target.value })
                    }
                    placeholder={"mot-clé 1\nmot-clé 2"}
                    disabled={isPending}
                    className="min-h-[100px] font-mono text-sm"
                    aria-label={`Mots-clés de la thématique ${section.name || index + 1}`}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() =>
                  setThemeSections((current) => [
                    ...current,
                    createEmptyThemeSection(),
                  ])
                }
              >
                <HugeiconsIcon
                  icon={Add01Icon}
                  size={16}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                Ajouter une thématique
              </Button>
            </div>

            {displayError ? (
              <p className="text-destructive text-sm" role="alert">
                {displayError}
              </p>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
