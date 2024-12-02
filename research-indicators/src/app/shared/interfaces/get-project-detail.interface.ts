export interface GetProjectDetail {
  agreement_id?: string;
  projectDescription?: string;
  description?: string;
  project_lead_description?: string;
  start_date?: string;
  end_date?: string;
  full_name?: string;
  indicators?: GetProjectDetailIndicator[];
}

export interface GetProjectDetailIndicator {
  indicator: IndicatorMetadata;
  count_results: number;
  full_name?: string;
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
