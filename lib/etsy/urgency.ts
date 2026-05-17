import type { UrgencyLevel } from "./types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export interface UrgencyInfo {
  level: UrgencyLevel;
  label: string;
  badgeClass: string;
  rowClass: string;
}

export function getUrgencyInfo(
  expectedShipDate: string | null,
  isShipped: boolean
): UrgencyInfo {
  if (isShipped) {
    return {
      level: "shipped",
      label: "Shipped",
      badgeClass: "bg-slate-100 text-slate-500",
      rowClass: "opacity-60",
    };
  }

  if (!expectedShipDate) {
    return {
      level: "ok",
      label: "No deadline",
      badgeClass: "bg-slate-100 text-slate-500",
      rowClass: "",
    };
  }

  const msUntil = new Date(expectedShipDate).getTime() - Date.now();

  if (msUntil < 0) {
    return {
      level: "overdue",
      label: `Overdue ${formatDuration(Math.abs(msUntil))} ago`,
      badgeClass: "bg-red-100 text-red-700 font-semibold ring-1 ring-red-300",
      rowClass: "bg-red-50/60",
    };
  }
  if (msUntil < 4 * HOUR) {
    return {
      level: "critical",
      label: `In ${formatDuration(msUntil)}`,
      badgeClass: "bg-red-100 text-red-700 font-semibold ring-1 ring-red-300",
      rowClass: "bg-red-50/30",
    };
  }
  if (msUntil < DAY) {
    return {
      level: "warning",
      label: `In ${formatDuration(msUntil)}`,
      badgeClass: "bg-amber-100 text-amber-700 font-medium ring-1 ring-amber-200",
      rowClass: "bg-amber-50/20",
    };
  }

  return {
    level: "ok",
    label: `In ${formatDuration(msUntil)}`,
    badgeClass: "bg-emerald-100 text-emerald-700",
    rowClass: "",
  };
}

function formatDuration(ms: number): string {
  const hours = ms / HOUR;
  if (hours < 1) return `${Math.round(ms / 60000)}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

export function formatPrice(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function formatDeadlineDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
