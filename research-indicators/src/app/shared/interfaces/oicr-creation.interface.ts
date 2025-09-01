import { Country, Region } from './get-geo-location.interface';

export interface OicrCreation {
  step_one: StepOne;
  step_two: StepTwo;
  step_three: StepThree;
  step_four: StepFour;
  base_information: BaseInformation;
}

export interface BaseInformation {
  indicator_id: number;
  contract_id: string;
  title: string;
  description: string;
  year: string;
  is_ai: boolean;
}

export interface MainContactPerson {
  result_user_id: number;
  result_id: number;
  user_id: number;
  user_role_id: number;
}

export interface Tagging {
  tag_id: number;
}

export interface LinkedResult {
  link_result_id: number;
  result_id: number;
  other_result_id: number;
  link_result_role_id: number;
}

export interface StepOne {
  main_contact_person: MainContactPerson;
  tagging: Tagging;
  linked_result: LinkedResult[];
  outcome_impact_statement: string;
}

export interface Initiative {
  clarisa_initiative_id: number;
}

export interface Lever {
  result_lever_id: number;
  result_id: number;
  lever_id: string;
  lever_role_id: number;
  is_primary: boolean;
}

export interface StepTwo {
  initiatives: Initiative[];
  primary_lever: Lever[];
  contributor_lever: Lever[];
}

export interface ResultCountrySubNational {
  result_country_sub_national_id: number;
  result_country_id: number;
  sub_national_id: number;
}

export interface StepThree {
  geo_scope_id?: number;
  countries: Country[];
  regions: Region[];
  comment_geo_scope: string;
}

export interface GeneralComment {
  comment_geo_scope: string;
}

export interface StepFour {
  general_comment: GeneralComment;
}

export interface LinkResult {
  result_id: number;
  external_oicr_id: number;
}

export interface PatchOicr {
  oicr_internal_code: string;
  tagging: Tagging[];
  outcome_impact_statement: string;
  short_outcome_impact_statement: string;
  general_comment?: string;
  maturity_level_id: number;
  link_result: LinkResult[];
}

export interface Oicr {
  created_at: string;
  updated_at: string;
  is_active: boolean;
  id: number;
  title: string;
  result_status: string;
  maturity_level: string;
  report_year: string;
}
