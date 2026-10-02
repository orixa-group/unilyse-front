"use client";

import { useEffect, useMemo, useState } from "react";
import { useActionState } from "react";
import { createProjectAction } from "@/app/(auth)/actions/unilize-actions";
import {
  initialCreateProjectState,
  type CreateProjectActionState,
} from "@/app/(auth)/actions/unilize-action-state";
import { Autocomplete } from "@/components/ui/autocomplete";
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
import { BffErrorAlert } from "@/components/common/bff-error-alert";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { useGoogleAdsAccounts } from "@/hooks/use-google-ads-accounts-api";
import { useSearchConsoleSites } from "@/hooks/use-sites-api";
import { formatGscSiteOptionLabel } from "@/lib/sites/format-gsc-site";
import { toUserFacingApiError } from "@/lib/api/error-messages";

export function CreateProjectDialog({
  open,
  onOpenChange,
  clientId,
  clientName,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onCreated: (result: CreateProjectActionState) => void;
}) {
  const [selectedSiteUrl, setSelectedSiteUrl] = useState<string | null>(null);
  const [selectedAdsAccountId, setSelectedAdsAccountId] = useState<
    string | null
  >(null);
  const [createState, createFormAction, isCreatePending] = useActionState(
    createProjectAction,
    initialCreateProjectState,
  );

  const {
    data: sitesResult,
    isLoading: isSitesLoading,
    isError: isSitesError,
    error: sitesError,
  } = useSearchConsoleSites({ enabled: open });

  const {
    data: adsResult,
    isLoading: isAdsLoading,
    isError: isAdsError,
    error: adsError,
  } = useGoogleAdsAccounts({ enabled: open });

  const siteOptions = useMemo(
    () =>
      (sitesResult?.sites ?? []).map((site) => ({
        value: site.url,
        label: formatGscSiteOptionLabel(site),
      })),
    [sitesResult?.sites],
  );

  const adsOptions = useMemo(
    () =>
      (adsResult?.accounts ?? [])
        .filter((account) => account.status === "ENABLED")
        .map((account) => ({
          value: account.id,
          label: account.name || account.id,
        })),
    [adsResult?.accounts],
  );

  useEffect(() => {
    if (!open) {
      setSelectedSiteUrl(null);
      setSelectedAdsAccountId(null);
    }
  }, [open]);

  useEffect(() => {
    if (createState.success) {
      onCreated(createState);
    }
  }, [createState, onCreated]);

  const sitesLoadError = isSitesError
    ? toUserFacingApiError(sitesError?.message, {
        fallback: "Impossible de charger les propriétés Search Console.",
      })
    : sitesResult?.error;

  const adsLoadError = isAdsError
    ? toUserFacingApiError(adsError?.message, {
        fallback: "Impossible de charger les comptes Google Ads.",
      })
    : adsResult?.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un projet</DialogTitle>
          <DialogDescription>
            Le projet sera rattaché au client{" "}
            <span className="text-foreground font-medium">{clientName}</span>.
            Choisissez une propriété Search Console et un compte Google Ads pour
            lancer la collecte.
          </DialogDescription>
        </DialogHeader>
        <form action={createFormAction} className="min-w-0 space-y-4">
          <input type="hidden" name="clientId" value={clientId} />
          <input
            type="hidden"
            name="search_console_url"
            value={selectedSiteUrl ?? ""}
          />
          <input
            type="hidden"
            name="gads_customer_id"
            value={selectedAdsAccountId ?? ""}
          />
          <div className="space-y-2">
            <Label htmlFor="project-name">Nom du projet</Label>
            <Input
              id="project-name"
              name="name"
              placeholder="Ex. Site e-commerce"
              required
              disabled={isCreatePending}
              autoFocus
            />
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="project-site-url">Propriété Search Console</Label>
            {isSitesLoading ? (
              <LoadingSkeleton className="h-9 w-full" />
            ) : (
              <Autocomplete
                id="project-site-url"
                className="w-full min-w-0"
                options={siteOptions}
                value={selectedSiteUrl}
                onValueChange={setSelectedSiteUrl}
                placeholder="Sélectionner une propriété…"
                searchPlaceholder="Rechercher par URL ou domaine…"
                emptyMessage="Aucune propriété Search Console disponible."
                noResultsMessage="Aucune propriété ne correspond à votre recherche."
                disabled={isCreatePending || siteOptions.length === 0}
                aria-label="Propriété Google Search Console"
              />
            )}
            {isSitesError ? (
              <BffErrorAlert
                error={sitesError}
                fallback="Impossible de charger les propriétés Search Console."
                title="Search Console indisponible"
              />
            ) : sitesLoadError ? (
              <p className="text-destructive text-sm" role="alert">
                {sitesLoadError}
              </p>
            ) : null}
          </div>
          <div className="min-w-0 space-y-2">
            <Label htmlFor="project-gads-account">Compte Google Ads</Label>
            {isAdsLoading ? (
              <LoadingSkeleton className="h-9 w-full" />
            ) : (
              <Autocomplete
                id="project-gads-account"
                className="w-full min-w-0"
                options={adsOptions}
                value={selectedAdsAccountId}
                onValueChange={setSelectedAdsAccountId}
                placeholder="Sélectionner un compte…"
                searchPlaceholder="Rechercher un compte…"
                emptyMessage="Aucun compte Google Ads disponible."
                noResultsMessage="Aucun compte ne correspond à votre recherche."
                disabled={isCreatePending || adsOptions.length === 0}
                aria-label="Compte Google Ads"
              />
            )}
            {isAdsError ? (
              <BffErrorAlert
                error={adsError}
                fallback="Impossible de charger les comptes Google Ads."
                title="Google Ads indisponible"
              />
            ) : adsLoadError ? (
              <p className="text-destructive text-sm" role="alert">
                {adsLoadError}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-ga4-property-id">
              ID propriété GA4 (facultatif)
            </Label>
            <Input
              id="project-ga4-property-id"
              name="ga4_property_id"
              placeholder="312345678"
              disabled={isCreatePending}
              inputMode="numeric"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-ctr-benchmark">
              CTR benchmark (%) (facultatif)
            </Label>
            <Input
              id="project-ctr-benchmark"
              name="ctr_benchmark"
              placeholder="2,5"
              disabled={isCreatePending}
              type="number"
              min={0}
              max={100}
              step="0.01"
              inputMode="decimal"
              autoComplete="off"
            />
          </div>
          {createState.error ? (
            <p className="text-destructive text-sm" role="alert">
              {createState.error}
            </p>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatePending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={
                isCreatePending ||
                isSitesLoading ||
                isAdsLoading ||
                !selectedSiteUrl ||
                !selectedAdsAccountId ||
                Boolean(sitesLoadError) ||
                Boolean(adsLoadError)
              }
            >
              {isCreatePending ? "Création…" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
