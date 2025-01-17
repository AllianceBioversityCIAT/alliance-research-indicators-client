import { Signal } from '@angular/core';

export interface GetGeoLocation {
  geo_scope_id?: number | string;
  countries?: Country[];
  regions?: Region[];
}

interface Region {
  region_id: number;
}

export interface Country {
  isoAlpha2: string;
  result_countries_sub_nationals: Resultcountriessubnational[];
  result_countries_sub_nationals_signal: Signal<Resultcountriessubnational[]>;
}

interface Resultcountriessubnational {
  sub_national_id: number;
}
