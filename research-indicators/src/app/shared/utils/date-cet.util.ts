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

/** Paris date/time parts from a UTC Date (for pre-filling forms in CET). */
export interface ParisDateAndTime {
  date: Date;
  time: Date;
}

/**
 * Converts a UTC Date to Europe/Paris date and time as Date objects (for calendar bindings).
 * date = date at midnight; time = time-only (hours and minutes).
 */
export function getParisDateAndTime(utcDate: Date): ParisDateAndTime | null {
  if (Number.isNaN(utcDate.getTime())) return null;
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  });
  const parts = formatter.formatToParts(utcDate);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '0';
  const y = Number.parseInt(get('year'), 10);
  const m = Number.parseInt(get('month'), 10) - 1;
  const day = Number.parseInt(get('day'), 10);
  const h = Number.parseInt(get('hour'), 10);
  const min = Number.parseInt(get('minute'), 10);
  return {
    date: new Date(y, m, day),
    time: new Date(0, 0, 0, h, min, 0)
  };
}

/**
 * Interprets the given date and time as Europe/Paris (CET/CEST) and returns the equivalent UTC Date.
 * Use when the user has selected a local CET time in a form.
 */
export function parisLocalToUtc(date: Date, time: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const h = time.getHours();
  const min = time.getMinutes();
  const noonUtc = Date.UTC(y, m, d, 12, 0, 0);
  const parisHourAtNoon = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_TZ,
    hour: 'numeric',
    hour12: false
  }).format(new Date(noonUtc));
  const offsetHours = Number.parseInt(parisHourAtNoon, 10) - 12;
  const offsetSign = offsetHours >= 0 ? '+' : '-';
  const offsetStr = `${offsetSign}${String(Math.abs(offsetHours)).padStart(2, '0')}:00`;
  const isoParis = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00${offsetStr}`;
  return new Date(isoParis);
}
