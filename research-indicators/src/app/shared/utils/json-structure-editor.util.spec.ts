import {
  applyFlatValuesToJson,
  buildJsonEditorTree,
  flattenJsonLeaves,
  formatJsonFieldLabel
} from '@shared/utils/json-structure-editor.util';

const DATE_FORMAT = {
  date: {
    order: 'DMY',
    style: 'numeric',
    monthName: {
      format: 'long',
      enabled: false,
      uppercase: true
    },
    separator: '/',
    twoDigitDay: true,
    fourDigitYear: true,
    twoDigitMonth: true
  },
  time: {
    hour12: true,
    twoDigitMinute: true
  },
  locale: 'en-US',
  display: {
    order: 'DATE_TIME',
    suffix: {
      wrap: 'PAREN',
      style: 'AUTO_TZ_ABBR',
      enabled: true,
      fallback: 'CET'
    },
    separator: ' at '
  },
  timezone: {
    iana: 'Europe/Paris',
    displayName: 'CET',
    abbreviationMode: 'AUTO'
  }
};

describe('json-structure-editor.util', () => {
  it('builds nested groups for top-level JSON sections', () => {
    const tree = buildJsonEditorTree(DATE_FORMAT);
    expect(tree.map(n => n.key)).toEqual(['date', 'time', 'locale', 'display', 'timezone']);
    expect(tree[0].type).toBe('group');
    if (tree[0].type === 'group') {
      expect(tree[0].children.some(c => c.key === 'monthName' && c.type === 'group')).toBe(true);
    }
  });

  it('flattens leaf values with dot paths', () => {
    const flat = flattenJsonLeaves(DATE_FORMAT);
    expect(flat['locale']).toBe('en-US');
    expect(flat['timezone.iana']).toBe('Europe/Paris');
    expect(flat['date.monthName.enabled']).toBe(false);
  });

  it('rebuilds JSON preserving keys while updating leaf values', () => {
    const flat = flattenJsonLeaves(DATE_FORMAT);
    flat['timezone.iana'] = 'America/New_York';
    flat['date.monthName.enabled'] = true;
    flat['locale'] = 'en-GB';

    const rebuilt = applyFlatValuesToJson(DATE_FORMAT, flat);
    expect(rebuilt).toEqual({
      ...DATE_FORMAT,
      locale: 'en-GB',
      date: {
        ...DATE_FORMAT.date,
        monthName: {
          ...DATE_FORMAT.date.monthName,
          enabled: true
        }
      },
      timezone: {
        ...DATE_FORMAT.timezone,
        iana: 'America/New_York'
      }
    });
    expect(Object.keys(rebuilt as object)).toEqual(Object.keys(DATE_FORMAT));
  });

  it('formats field labels from camelCase keys', () => {
    expect(formatJsonFieldLabel('monthName')).toBe('Month Name');
    expect(formatJsonFieldLabel('twoDigitDay')).toBe('Two Digit Day');
  });
});
