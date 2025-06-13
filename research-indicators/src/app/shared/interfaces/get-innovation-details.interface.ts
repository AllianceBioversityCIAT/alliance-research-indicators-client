export class GetInnovationDetails {
  organizations: Organization[] = [];
  actors: Actor[] = [];
  short_title = '';
  innovation_nature_id = 0;
  innovation_type_id = 0;
  innovation_readiness_id = 0;
  anticipated_users_id = 0;
  no_sex_age_disaggregation = false;
}

export class Organization {
  type = '';
  other = '';
  subtype = '';
}

export class Actor {
  type = '';
  other = '';
  sex_age = '';
  women = '';
  men = '';
}
