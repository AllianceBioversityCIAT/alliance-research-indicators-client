export interface Result {
  is_active: boolean;
  result_id: number;
  result_official_code: string;
  version_id: null;
  title: string;
  description: null | string;
  indicator_id: number;
  geo_scope_id: null;
  indicators?: { name: string };
  result_status?: { name: string };
  result_contracts?: { contract_id: string };
  result_levers?: { lever: { short_name: string } };
  report_year_id?: number;
  created_by_user?: { first_name: string; last_name: string };
  created_at?: string;
  year?: string;
}

export interface ResultTable {
  attr: string;
  header: string;
  pipe?: boolean;
}

export interface ResultFilter {
  'indicator-codes'?: number[];
  'create-user-codes'?: string[];
  'lever-codes'?: number[];
  'indicator-codes-tabs'?: number[];
  'indicator-codes-filter'?: number[];
  'status-codes'?: number[];
  'contract-codes'?: string[];
  years?: number[];
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
