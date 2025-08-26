export interface GetIndicatorsProgress {
  indicator_id: number;
  code: string;
  name: string;
  description: string;
  target_unit: string;
  number_type: string;
  number_format: string;
  target_value: number;
  base_line: number;
  year: number[];
  type: string;
  contributions: Contribution[];
  //auxiliary fields
  total_contributions: number;
  percentageProgress: number;
}

export interface Contribution {
  result_id: number;
  result_official_code: number;
  title: string;
  description: string;
  contribution_value: number;
}
