export const PROJECT_DASHBOARD_DEFAULT_LIMIT = 5;

export interface ProjectDashboardRankedListItem {
  id: string;
  label: string;
  count: number;
  iconUrl?: string;
}

export interface GeoScopeSummary {
  global: number;
  regional: number;
  countries: number;
  sub_national: number;
  yet_to_be_determined: number;
}

export interface ProjectDashboardRankedItem {
  agreement_id?: string;
  contract_id?: string;
  contract_code?: string;
  contract_description?: string;
  project_name?: string;
  institution_id?: number;
  institution_name?: string;
  partner_name?: string;
  lever_id?: number;
  short_name?: string;
  full_name?: string;
  lever_name?: string;
  primary_lever?: string;
  region_name?: string;
  country_name?: string;
  label?: string;
  name?: string;
  scope_type?: string;
  results_count?: number;
  contribution_count?: number;
  count?: number;
  value?: number;
}

export interface TopContributorsContractReport {
  contract_id: string;
  limit: number;
  top_contributors: ProjectDashboardRankedItem[];
}

export interface TopPartnersReport {
  contract_id: string;
  limit: number;
  top_partners: ProjectDashboardRankedItem[];
}

export interface TopPrimaryLeverItem {
  lever_id: number;
  short_name: string;
  full_name: string;
  count: number;
  icon?: string;
}

export interface TopPrimaryLeversReport {
  contract_id: string;
  limit: number;
  top_primary_levers: TopPrimaryLeverItem[];
}

export interface GeoScopeReport {
  contract_id: string;
  limit: number;
  geo_scope_summary: Partial<GeoScopeSummary>;
  top_regions: ProjectDashboardRankedItem[];
  top_countries: ProjectDashboardRankedItem[];
}
