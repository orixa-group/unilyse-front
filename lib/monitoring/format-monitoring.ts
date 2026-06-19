import type { UnilizeMonitoringStatus } from "@/types/monitoring";

const STATUS_LABELS: Record<UnilizeMonitoringStatus, string> = {
  target: "Cibler",
  consider: "À évaluer",
  ignore: "Ignorer",
};

export function formatMonitoringStatus(
  status: UnilizeMonitoringStatus | null | undefined,
): string {
  if (!status) {
    return "—";
  }
  return STATUS_LABELS[status] ?? status;
}
