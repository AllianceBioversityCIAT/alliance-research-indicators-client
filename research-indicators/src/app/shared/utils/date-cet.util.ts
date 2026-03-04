import type { DateFormatJsonValue } from '@shared/interfaces/date-format-config.interface';

const CET_TZ = 'Europe/Paris';
const HAS_UTC_OR_OFFSET = /(?:Z|([+-]\d{2}:?\d{2}))$/;
const SUPPORTED_TZ_IANA = ['Europe/Paris'];
const CET_CEST_DISPLAY_NAMES = ['CET', 'CEST'];

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

function toDate(raw: DateInput): Date | null {
  const str = toUtcString(raw);
  if (str == null) return null;
  const normalized = HAS_UTC_OR_OFFSET.test(str) ? str : `${str}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
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

/** Formats UTC date in UTC (no conversion). Use as default when config is missing or doesn't match. */
function formatUtcToUtcDisplay(raw: DateInput): string | null {
  const d = toDate(raw);
  if (d == null) return null;
  const dateStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(d);
  return `${dateStr} at ${timeStr} (UTC)`;
}

/** Resolves actual timezone abbreviation for a date in Europe/Paris (CET or CEST). */
function getParisTimezoneAbbr(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CET_TZ,
    timeZoneName: 'short'
  }).formatToParts(date);
  const tzPart = parts.find(p => p.type === 'timeZoneName');
  return (tzPart?.value ?? 'CET').toUpperCase();
}

/**
 * Formats a UTC date using the date-format configuration (timezone, order, separator, suffix).
 * - CET/CEST: converts to Europe/Paris (real hour conversion; label CET or CEST from the date).
 * - UTC or unknown: shows UTC (no conversion). Default when config is missing or doesn't match.
 */
export function formatUtcWithConfig(raw: DateInput, config: DateFormatJsonValue | null): string | null {
  const d = toDate(raw);
  if (d == null) return null;
  if (config == null || config.timezone == null) return formatUtcToUtcDisplay(raw);

  const iana = config.timezone.iana;
  const suffixCfg = config.display?.suffix;
  const displayName = config.timezone.displayName ?? suffixCfg?.fallback ?? '';
  const useEuropeParis =
    (typeof iana === 'string' && SUPPORTED_TZ_IANA.includes(iana)) ||
    (typeof displayName === 'string' && CET_CEST_DISPLAY_NAMES.includes(displayName.toUpperCase()));
  const tz = useEuropeParis ? CET_TZ : 'UTC';
  const locale = config.locale ?? 'en-GB';
  const sep = config.display?.separator ?? ' at ';
  const tzLabel =
    tz === 'UTC' ? 'UTC' : getParisTimezoneAbbr(d);

  const dateCfg = config.date;
  const monthName = dateCfg?.monthName;
  const useMonthName = monthName?.enabled === true;
  const monthFormat = monthName?.format === 'long' ? 'long' : 'short';
  const monthOpt = useMonthName ? monthFormat : '2-digit';
  const dayOpt = dateCfg?.twoDigitDay === false ? 'numeric' : '2-digit';
  const yearOpt = dateCfg?.fourDigitYear === false ? '2-digit' : 'numeric';
  const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    day: dayOpt,
    month: monthOpt,
    year: yearOpt
  };
  const dateParts = new Intl.DateTimeFormat(locale, dateOpts).formatToParts(d);
  const getPart = (type: string) => dateParts.find(p => p.type === type)?.value ?? '';
  const day = getPart('day');
  const month = getPart('month');
  const year = getPart('year');
  const dateOrder = dateCfg?.order ?? 'DMY';
  const dateSep = dateCfg?.separator ?? '/';
  let ordered: string[];
  if (dateOrder === 'DMY') ordered = [day, month, year];
  else if (dateOrder === 'MDY') ordered = [month, day, year];
  else ordered = [year, month, day];
  const dateStr = ordered.join(dateSep);

  const timeCfg = config.time;
  const minuteOpt = timeCfg?.twoDigitMinute === false ? 'numeric' : '2-digit';
  const hour12 = timeCfg?.hour12 ?? true;
  const timeStr = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: 'numeric',
    minute: minuteOpt,
    hour12
  }).format(d);

  let out = `${dateStr}${sep}${timeStr}`;
  if (suffixCfg?.enabled && tzLabel) {
    const wrap = suffixCfg.wrap === 'PAREN' ? `(${tzLabel})` : tzLabel;
    out = `${out} ${wrap}`;
  }
  return out;
}

/**
 * Returns { date, time, timezoneLabel } using the given config.
 * Default when config is missing or invalid: UTC (no conversion).
 */
export function formatUtcWithConfigParts(raw: DateInput, config: DateFormatJsonValue | null): (CetFormatted & { timezoneLabel: string }) | null {
  const d = toDate(raw);
  if (d == null) return null;
  if (config == null || config.timezone == null) {
    const dateStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
    const timeStr = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
    return { date: dateStr, time: timeStr, timezoneLabel: 'UTC' };
  }

  const iana = config.timezone.iana;
  const displayNamePart = config.timezone.displayName ?? config.display?.suffix?.fallback ?? '';
  const useEuropeParis =
    (typeof iana === 'string' && SUPPORTED_TZ_IANA.includes(iana)) ||
    (typeof displayNamePart === 'string' && CET_CEST_DISPLAY_NAMES.includes(displayNamePart.toUpperCase()));
  const tz = useEuropeParis ? CET_TZ : 'UTC';
  const locale = config.locale ?? 'en-GB';
  const dateCfg = config.date;
  const monthName = dateCfg?.monthName;
  const useMonthName = monthName?.enabled === true;
  const monthFormat = monthName?.format === 'long' ? 'long' : 'short';
  const monthOpt = useMonthName ? monthFormat : '2-digit';
  const dayOpt = dateCfg?.twoDigitDay === false ? 'numeric' : '2-digit';
  const yearOpt = dateCfg?.fourDigitYear === false ? '2-digit' : 'numeric';
  const dateOpts: Intl.DateTimeFormatOptions = {
    timeZone: tz,
    day: dayOpt,
    month: monthOpt,
    year: yearOpt
  };
  const dateParts = new Intl.DateTimeFormat(locale, dateOpts).formatToParts(d);
  const getPart = (type: string) => dateParts.find(p => p.type === type)?.value ?? '';
  const day = getPart('day');
  const month = getPart('month');
  const year = getPart('year');
  const dateOrder = dateCfg?.order ?? 'DMY';
  const dateSep = dateCfg?.separator ?? '/';
  let ordered: string[];
  if (dateOrder === 'DMY') ordered = [day, month, year];
  else if (dateOrder === 'MDY') ordered = [month, day, year];
  else ordered = [year, month, day];
  const dateStr = ordered.join(dateSep);

  const minuteOpt = config.time?.twoDigitMinute === false ? 'numeric' : '2-digit';
  const hour12 = config.time?.hour12 ?? true;
  const timeStr = new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    hour: 'numeric',
    minute: minuteOpt,
    hour12
  }).format(d);

  const timezoneLabel = tz === 'UTC' ? 'UTC' : getParisTimezoneAbbr(d);

  return { date: dateStr, time: timeStr, timezoneLabel };
}

/** Paris date/time parts from a UTC Date (for pre-filling forms in CET). */
export interface ParisDateAndTime {
  date: Date;
  time: Date;
}

/** UTC date/time parts from a UTC Date (for pre-filling forms when timezone is UTC). */
export interface UtcDateAndTime {
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
 * Returns UTC date and time as Date objects for form bindings when timezone is UTC.
 */
export function getUtcDateAndTime(utcDate: Date): UtcDateAndTime | null {
  if (Number.isNaN(utcDate.getTime())) return null;
  const y = utcDate.getUTCFullYear();
  const m = utcDate.getUTCMonth();
  const day = utcDate.getUTCDate();
  const h = utcDate.getUTCHours();
  const min = utcDate.getUTCMinutes();
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

/** True if config uses Europe/Paris (CET/CEST) for conversion. */
export function isConfigCetCest(config: DateFormatJsonValue | null): boolean {
  if (config == null || config.timezone == null) return false;
  const iana = config.timezone.iana;
  const suffixCfg = config.display?.suffix;
  const displayName = (config.timezone.displayName ?? suffixCfg?.fallback ?? '').toUpperCase();
  return (
    (typeof iana === 'string' && SUPPORTED_TZ_IANA.includes(iana)) ||
    CET_CEST_DISPLAY_NAMES.includes(displayName)
  );
}

/** Label for edit UI: CET, CEST, or UTC depending on config (and date for CET vs CEST). */
export function getTimezoneLabelForEdit(config: DateFormatJsonValue | null, when?: Date): string {
  if (!isConfigCetCest(config)) return 'UTC';
  return getParisTimezoneAbbr(when ?? new Date());
}

/**
 * Converts local date + time to UTC Date for API.
 * If config is CET/CEST: interprets input as Europe/Paris and converts to UTC.
 * Otherwise (UTC or unknown): interprets input as UTC (no conversion).
 */
export function localDateAndTimeToUtc(
  date: Date,
  time: Date,
  config: DateFormatJsonValue | null
): Date {
  if (isConfigCetCest(config)) return parisLocalToUtc(date, time);
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0,
      0
    )
  );
}

/**
 * Builds PrimeNG Calendar format strings from date-format config (for edit modals).
 * - dateFormat: order (DMY/MDY/YMD), separator, month numeric or name (long/short), 2/4 digit year.
 * - hourFormat: '12' or '24' from time.hour12.
 * - timeFormat: 'h:mm a' (12h) or 'HH:mm' (24h) for the time picker display.
 */
export function getCalendarFormatsFromConfig(config: DateFormatJsonValue | null): {
  dateFormat: string;
  hourFormat: '12' | '24';
  timeFormat: string;
} {
  if (config == null || config.date == null) {
    return { dateFormat: 'dd/mm/yy', hourFormat: '12', timeFormat: 'h:mm a' };
  }
  const date = config.date;
  const sep = date.separator ?? '/';
  const dayPart = date.twoDigitDay === false ? 'd' : 'dd';
  const monthPart =
    date.monthName?.enabled === true
      ? date.monthName.format === 'long'
        ? 'MM'
        : 'M'
      : date.twoDigitMonth === false
        ? 'm'
        : 'mm';
  const yearPart = date.fourDigitYear === false ? 'y' : 'yy';
  const order = date.order ?? 'DMY';
  let dateFormat: string;
  if (order === 'DMY') dateFormat = `${dayPart}${sep}${monthPart}${sep}${yearPart}`;
  else if (order === 'MDY') dateFormat = `${monthPart}${sep}${dayPart}${sep}${yearPart}`;
  else dateFormat = `${yearPart}${sep}${monthPart}${sep}${dayPart}`;

  const hour12 = config.time?.hour12 !== false;
  const hourFormat = hour12 ? '12' : '24';
  const timeFormat = hour12 ? 'h:mm a' : 'HH:mm';

  return { dateFormat, hourFormat, timeFormat };
}
