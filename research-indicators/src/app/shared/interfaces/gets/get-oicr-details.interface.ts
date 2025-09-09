export interface GetOICRDetails {
  id: number;
  official_code: number;
  title: string;
  main_project_id: string;
  main_project: string;
  other_projects: OtherProject[];
  tags: Tag[];
  outcome_impact_statement: string;
  main_lever_id: any;
  main_lever_short: any;
  main_lever_full: any;
  other_levers: any[];
  geographic_scope: string;
  regions: Region[];
  countries: Country[];
  geographic_scope_comments: string;
  // auxiliars
  other_projects_text: string;
  regions_countries_text: string;
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
