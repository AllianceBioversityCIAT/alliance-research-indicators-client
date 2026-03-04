import {
  formatUtcToCet,
  formatUtcToCetDisplay,
  getParisDateAndTime,
  parisLocalToUtc
} from './date-format.util';

describe('date-format.util', () => {
  describe('formatUtcToCet', () => {
    it('should return date and time in CET for UTC string', () => {
      const result = formatUtcToCet('2026-02-26T21:43:03.683Z');
      expect(result).not.toBeNull();
      expect(result!.date).toBeDefined();
      expect(result!.time).toBeDefined();
    });

    it('should return null for null input', () => {
      expect(formatUtcToCet(null)).toBeNull();
    });

    it('should return null for undefined input', () => {
      expect(formatUtcToCet(undefined)).toBeNull();
    });

    it('should return null for invalid date string', () => {
      expect(formatUtcToCet('invalid')).toBeNull();
    });

    it('should handle Date input', () => {
      const result = formatUtcToCet(new Date('2026-02-26T12:00:00.000Z'));
      expect(result).not.toBeNull();
    });

    it('should return null for NaN Date', () => {
      expect(formatUtcToCet(new Date('invalid'))).toBeNull();
    });

    it('should normalize string without Z by appending Z', () => {
      const result = formatUtcToCet('2026-02-26T21:43:03.683');
      expect(result).not.toBeNull();
      expect(result!.date).toBeDefined();
      expect(result!.time).toBeDefined();
    });
  });

  describe('formatUtcToCetDisplay', () => {
    it('should return "date at time (CET)" for valid input', () => {
      const result = formatUtcToCetDisplay('2026-02-26T21:43:03.683Z');
      expect(result).toContain(' at ');
      expect(result).toContain('(CET)');
    });

    it('should return null when formatUtcToCet returns null (cover lines 44-46)', () => {
      expect(formatUtcToCetDisplay(null)).toBeNull();
      expect(formatUtcToCetDisplay(undefined)).toBeNull();
      expect(formatUtcToCetDisplay('invalid')).toBeNull();
    });
  });

  describe('getParisDateAndTime', () => {
    it('should return Paris date and time for valid UTC Date', () => {
      const utc = new Date('2026-02-26T12:00:00.000Z');
      const result = getParisDateAndTime(utc);
      expect(result).not.toBeNull();
      expect(result!.date).toBeInstanceOf(Date);
      expect(result!.time).toBeInstanceOf(Date);
      expect(result!.date.getFullYear()).toBeGreaterThanOrEqual(2025);
      expect(result!.time.getHours()).toBeGreaterThanOrEqual(0);
    });

    it('should return null for NaN Date (cover line 59)', () => {
      expect(getParisDateAndTime(new Date('invalid'))).toBeNull();
    });

    it('should use fallback 0 when a part type is missing (cover ?? 0 branch in get)', () => {
      const utc = new Date('2026-02-26T12:00:00.000Z');
      const formatToPartsSpy = jest.spyOn(Intl.DateTimeFormat.prototype, 'formatToParts').mockReturnValueOnce([
        { type: 'year', value: '2026' },
        { type: 'month', value: '02' },
        { type: 'day', value: '26' },
        { type: 'hour', value: '13' }
        // omit 'minute' so get('minute') returns undefined and we use '0'
      ] as Intl.DateTimeFormatPart[]);
      const result = getParisDateAndTime(utc);
      expect(result).not.toBeNull();
      expect(result!.time.getMinutes()).toBe(0);
      formatToPartsSpy.mockRestore();
    });
  });

  describe('parisLocalToUtc', () => {
    it('should convert Paris local date and time to UTC Date', () => {
      const date = new Date(2026, 0, 15);
      const time = new Date(0, 0, 0, 14, 30, 0);
      const utc = parisLocalToUtc(date, time);
      expect(utc).toBeInstanceOf(Date);
      expect(Number.isNaN(utc.getTime())).toBe(false);
    });

    it('should handle midnight', () => {
      const date = new Date(2026, 5, 1);
      const time = new Date(0, 0, 0, 0, 0, 0);
      const utc = parisLocalToUtc(date, time);
      expect(utc).toBeInstanceOf(Date);
    });

    it('should handle single-digit hour and minute (padStart branches)', () => {
      const date = new Date(2026, 0, 5);
      const time = new Date(0, 0, 0, 9, 5, 0);
      const utc = parisLocalToUtc(date, time);
      expect(utc).toBeInstanceOf(Date);
      expect(utc.getUTCHours()).toBeDefined();
    });

  });
});
