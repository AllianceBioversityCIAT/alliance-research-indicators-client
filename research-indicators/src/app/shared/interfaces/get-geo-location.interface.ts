import { Signal } from '@angular/core';

export interface GetGeoLocation {
  geo_scope_id?: number | string;
  countries?: Country[];
  regions?: Region[];
}

interface Region {
  region_id: number;
  sub_national_id?: number;
}

export interface Country {
  isoAlpha2: string;
  result_countries_sub_nationals: Region[];
  result_countries_sub_nationals_signal: Signal<ResultcountriessubnationalRegions>;
}

interface ResultcountriessubnationalRegions {
  regions?: Region[];
}
