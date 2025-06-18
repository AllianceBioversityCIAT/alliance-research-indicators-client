export class GetInnovationDetails {
  short_title = '';
  innovation_nature_id: number | undefined = undefined;
  innovation_type_id: number | undefined = undefined;
  innovation_readiness_id: number | undefined = undefined;
  anticipated_users_id: number | undefined = undefined;
  expected_outcome = '';
  intended_beneficiaries_description = '';
  actors: Actor[] = [];
  institution_types: InstitutionType[] = [];
}

export class Actor {
  result_actors_id: number | undefined = undefined;
  result_id: number | undefined = undefined;
  actor_type_id: number | undefined = undefined;
  sex_age_disaggregation_not_apply = false;
  women_youth = false;
  women_not_youth = false;
  men_youth = false;
  men_not_youth = false;
  actor_role_id: number | undefined = undefined;
  actor_type_custom_name: string | undefined = undefined;
}

export class InstitutionType {
  result_institution_type_id: number | undefined = undefined;
  result_id: number | undefined = undefined;
  institution_type_id: number | undefined = undefined;
  sub_institution_type_id: number | undefined = undefined;
  institution_type_custom_name: string | undefined = undefined;
}
