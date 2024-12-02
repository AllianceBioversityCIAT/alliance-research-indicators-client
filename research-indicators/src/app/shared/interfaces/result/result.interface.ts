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
