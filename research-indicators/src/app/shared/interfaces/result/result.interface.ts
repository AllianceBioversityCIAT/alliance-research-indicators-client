export interface Result {
  is_active: boolean;
  result_id: number;
  result_official_code: number;
  version_id: null;
  title: string;
  description: null | string;
  indicator_id: number;
  geo_scope_id: null;
}

export interface ResultTable {
  attr: string;
  header: string;
  pipe?: boolean;
}

export interface ResultFilter {
  indicatorsCodes?: number[];
  userCodes?: string[];
}

export interface ResultConfig {
  indicators?: boolean;
  'result-status'?: boolean;
  contracts?: boolean;
  'primary-contract'?: boolean;
  levers?: boolean;
  'primary-lever'?: boolean;
  'audit-data'?: boolean;
  'audit-data-object'?: boolean;
}
