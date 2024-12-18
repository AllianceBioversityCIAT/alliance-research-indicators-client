export interface GetGeoLocation {
  geo_scope_id?: number | string;
  countries?: Country[];
  regions?: Region[];
}

interface Region {
  region_id: number;
}

interface Country {
  isoAlpha2: string;
  result_countries_sub_nationals: Resultcountriessubnational[];
}

interface Resultcountriessubnational {
  sub_national_id: number;
}
