export interface GetOICRDetails {
  id: number;
  official_code: number;
  title: string;
  main_project_id: string;
  main_project: string;
  tags: Tag[];
  outcome_impact_statement: string;
  // main_lever_id: any;
  // main_lever_short: any;
  // main_lever_full: any;
  other_projects: OtherProject[];
  other_levers: LeverItem[];
  main_levers: LeverItem[];
  geographic_scope: string;
  regions: Region[];
  countries: Country[];
  geographic_scope_comments: string;
  tag_id: number;
  tag_name_text: string;
  // auxiliars
  other_projects_text: string;
  regions_countries_text: string;
  others_levers_text: string;
  main_levers_text: string;
}

export interface LeverItem {
  lever_id: number | string;
  lever_short: string;
  lever_full: string;
}

export interface OtherProject {
  project_id: string;
  project_title: string;
}

export interface Tag {
  tag_id: number;
  tag_name: string;
}

export interface Region {
  region_code: number;
  region_name: string;
}

export interface Country {
  country_code: string;
  country_name: string;
}
