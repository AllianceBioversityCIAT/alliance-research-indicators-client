export interface GetOICRDetails {
  id: number;
  official_code: number;
  title: string;
  main_project_id: string;
  main_project: string;
  other_projects: OicrOtherProject[];
  tags: Tag[];
  outcome_impact_statement: string;
  main_lever_id: any;
  main_lever_short: any;
  main_lever_full: any;
  other_levers: any[];
  geographic_scope: string;
  regions: Region[];
  countries: any[];
  geographic_scope_comments: string;
  other_projects_text: string;
}

export interface OicrOtherProject {
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
