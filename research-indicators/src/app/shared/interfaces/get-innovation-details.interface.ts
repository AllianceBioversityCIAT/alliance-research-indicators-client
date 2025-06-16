export class GetInnovationDetails {
  short_title = '';
  innovation_nature_id = 0;
  innovation_type_id = 0;
  innovation_readiness_id = 0;
  anticipated_users_id = 0;
  expected_outcome = '';
  intended_beneficiaries_description = '';
  actors: Actor[] = [];
  institution_types: InstitutionType[] = [];
}

export class Actor {
  result_actors_id = 0;
  result_id = 0;
  actor_type_id = 0;
  sex_age_disaggregation_not_apply = false;
  women_youth = false;
  women_not_youth = false;
  men_youth = false;
  men_not_youth = false;
  actor_role_id = 0;
}

export class InstitutionType {
  result_institution_type_id = 0;
  result_id = 0;
  institution_type_id = 0;
}
