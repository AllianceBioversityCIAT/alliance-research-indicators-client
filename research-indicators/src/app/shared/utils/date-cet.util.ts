const CET_TZ = 'Europe/Paris';
const HAS_UTC_OR_OFFSET = /(?:Z|([+-]\d{2}:?\d{2}))$/;

export interface CetFormatted {
  date: string;
  time: string;
}

export type DateInput = string | Date | null | undefined;

function toUtcString(raw: DateInput): string | null {
  if (raw == null) return null;
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw.toISOString();
  return raw;
}

/**
 * Parses a UTC date string or Date (with or without Z) and formats it in Europe/Paris (CET/CEST).
 * @param raw - ISO date string or Date (e.g. "2026-02-26T21:43:03.683Z" or new Date())
 * @returns { date, time } in CET or null if invalid
 */
export function formatUtcToCet(raw: DateInput): CetFormatted | null {
  const str = toUtcString(raw);
  if (str == null) return null;
  const normalized = HAS_UTC_OR_OFFSET.test(str) ? str : `${str}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  const dateStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d);
  return { date: dateStr, time: timeStr };
}

export function formatUtcToCetDisplay(raw: DateInput): string | null {
  const formatted = formatUtcToCet(raw);
  if (!formatted) return null;
  return `${formatted.date} at ${formatted.time} (CET)`;
}
