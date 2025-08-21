export interface GetProjectIndicators {
  result_id?: number;
  result_official_code?: number;
  result_title?: string;
  contracts?: ProjectIndicatorContract[] | null;
}

export interface ProjectIndicatorContract {
  agreement_id: string;
  description: string;
  indicators: Indicator[];
}

interface Indicator {
  id: number;
  name: string;
  code: string;
  description: string;
  number_type: string;
  number_format: string;
  target_unit: string;
  target_value: string;
  base_line: string;
  year: number[];
  type: null | null | string;
}
