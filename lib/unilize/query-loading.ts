/** Affiche un skeleton tant que les données ne correspondent pas au projet sélectionné. */
export function shouldShowProjectSkeleton(
  selectedProjectId: string | null | undefined,
  result: { projectId?: string } | null | undefined,
  isLoading: boolean,
  isFetching: boolean,
): boolean {
  if (!selectedProjectId) {
    return false;
  }
  if (!isLoading && !isFetching) {
    return false;
  }
  return !result || result.projectId !== selectedProjectId;
}
