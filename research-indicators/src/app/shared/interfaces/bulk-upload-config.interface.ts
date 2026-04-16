export interface BulkUploadApiResponse {
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  key?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  field?: string;
  simple_value: string | null;
}

export function getBulkUploadEmbedUrl(data: BulkUploadApiResponse | null | undefined): string | null {
  const url = data?.simple_value;
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function appendAccessTokenToEmbedUrl(embedBaseUrl: string, accessToken: string): string {
  const u = new URL(embedBaseUrl);
  u.searchParams.set('access_token', accessToken);
  return u.toString();
}
