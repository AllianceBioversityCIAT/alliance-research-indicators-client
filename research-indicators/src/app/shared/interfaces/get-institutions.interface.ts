export interface GetInstitution {
  description: string;
  code: number;
  acronym: string;
  name: string;
  // aux
  html_full_name: string;
  institution_id: number;
  region_id: number;
  isoAlpha2?: string;
  institution_locations: { isoAlpha2: string }[];
}
