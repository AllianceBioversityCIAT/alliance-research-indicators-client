import { FormatCetPipe } from './format-cet.pipe';

describe('FormatCetPipe', () => {
  const pipe = new FormatCetPipe();

  it('should return formatted CET string for valid UTC date string', () => {
    const result = pipe.transform('2026-02-26T21:43:03.683Z');
    expect(result).toContain(' at ');
    expect(result).toContain('(CET)');
    expect(result).not.toBe('');
  });

  it('should return formatted CET string for valid Date', () => {
    const result = pipe.transform(new Date('2026-02-26T21:43:03.683Z'));
    expect(result).toContain('(CET)');
    expect(result).not.toBe('');
  });

  it('should return empty string when value is null (cover line 10 ?? branch)', () => {
    const result = pipe.transform(null);
    expect(result).toBe('');
  });

  it('should return empty string when value is undefined', () => {
    const result = pipe.transform(undefined);
    expect(result).toBe('');
  });

  it('should return empty string when value is invalid date string', () => {
    const result = pipe.transform('not-a-date');
    expect(result).toBe('');
  });
});
