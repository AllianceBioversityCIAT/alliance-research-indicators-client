export interface GetProjectDetail {
  agreement_id?: string;
  projectDescription?: string;
  project_lead_description?: string;
  start_date?: string;
  end_date?: string;
  indicators?: Indicator[];
}

interface Indicator {
  indicator: IndicatorMetadata;
  count_results: number;
}

interface IndicatorMetadata {
  name: string;
  icon_src: string;
  is_active: number;
  description: string;
  other_names: null;
  indicator_id: number;
  long_description: string;
  indicator_type_id: number;
}
