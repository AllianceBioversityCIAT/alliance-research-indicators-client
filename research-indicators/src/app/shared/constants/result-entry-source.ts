export const RESULT_ENTRY_SOURCE_QUERY = 'from';
export const RESULT_ENTRY_SOURCE_VALUE_RESULTS_CENTER = 'results-center';

export function getResultEntrySourceFromSearch(search: string): string | null {
  if (!search) return null;
  const q = search.startsWith('?') ? search.slice(1) : search;
  return new URLSearchParams(q).get(RESULT_ENTRY_SOURCE_QUERY);
}

export function isResultsCenterEntryFromUrl(url: string): boolean {
  const i = url.indexOf('?');
  if (i < 0) return false;
  return getResultEntrySourceFromSearch(url.slice(i)) === RESULT_ENTRY_SOURCE_VALUE_RESULTS_CENTER;
}
