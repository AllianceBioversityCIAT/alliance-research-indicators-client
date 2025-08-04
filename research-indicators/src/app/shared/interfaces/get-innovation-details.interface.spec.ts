import { GetInnovationDetails, Actor, InstitutionType } from './get-innovation-details.interface';

describe('GetInnovationDetails', () => {
  it('should create an instance with default values', () => {
    const details = new GetInnovationDetails();
    expect(details.short_title).toBe('');
    expect(details.innovation_nature_id).toBeUndefined();
    expect(details.innovation_type_id).toBeUndefined();
    expect(details.innovation_readiness_id).toBeUndefined();
    expect(details.anticipated_users_id).toBeUndefined();
    expect(details.expected_outcome).toBe('');
    expect(details.intended_beneficiaries_description).toBe('');
    expect(details.actors).toEqual([]);
    expect(details.institution_types).toEqual([]);
  });

  it('should allow assigning values to properties', () => {
    const details = new GetInnovationDetails();
    details.short_title = 'Test';
    details.innovation_nature_id = 1;
    details.innovation_type_id = 2;
    details.innovation_readiness_id = 3;
    details.anticipated_users_id = 4;
    details.expected_outcome = 'Outcome';
    details.intended_beneficiaries_description = 'Desc';
    details.actors = [new Actor()];
    details.institution_types = [new InstitutionType()];
    expect(details.short_title).toBe('Test');
    expect(details.innovation_nature_id).toBe(1);
    expect(details.innovation_type_id).toBe(2);
    expect(details.innovation_readiness_id).toBe(3);
    expect(details.anticipated_users_id).toBe(4);
    expect(details.expected_outcome).toBe('Outcome');
    expect(details.intended_beneficiaries_description).toBe('Desc');
    expect(details.actors.length).toBe(1);
    expect(details.institution_types.length).toBe(1);
  });
});

describe('Actor', () => {
  it('should create an instance with default values', () => {
    const actor = new Actor();
    expect(actor.result_actors_id).toBeUndefined();
    expect(actor.result_id).toBeUndefined();
    expect(actor.actor_type_id).toBeUndefined();
    expect(actor.sex_age_disaggregation_not_apply).toBe(false);
    expect(actor.women_youth).toBe(false);
    expect(actor.women_not_youth).toBe(false);
    expect(actor.men_youth).toBe(false);
    expect(actor.men_not_youth).toBe(false);
    expect(actor.actor_role_id).toBeUndefined();
    expect(actor.actor_type_custom_name).toBeUndefined();
  });

  it('should allow assigning values to properties', () => {
    const actor = new Actor();
    actor.result_actors_id = 1;
    actor.result_id = 2;
    actor.actor_type_id = 3;
    actor.sex_age_disaggregation_not_apply = true;
    actor.women_youth = true;
    actor.women_not_youth = true;
    actor.men_youth = true;
    actor.men_not_youth = true;
    actor.actor_role_id = 4;
    actor.actor_type_custom_name = 'Custom';
    expect(actor.result_actors_id).toBe(1);
    expect(actor.result_id).toBe(2);
    expect(actor.actor_type_id).toBe(3);
    expect(actor.sex_age_disaggregation_not_apply).toBe(true);
    expect(actor.women_youth).toBe(true);
    expect(actor.women_not_youth).toBe(true);
    expect(actor.men_youth).toBe(true);
    expect(actor.men_not_youth).toBe(true);
    expect(actor.actor_role_id).toBe(4);
    expect(actor.actor_type_custom_name).toBe('Custom');
  });
});

describe('InstitutionType', () => {
  it('should create an instance with default values', () => {
    const inst = new InstitutionType();
    expect(inst.result_institution_type_id).toBeNull();
    expect(inst.result_id).toBeNull();
    expect(inst.institution_type_id).toBeNull();
    expect(inst.sub_institution_type_id).toBeNull();
    expect(inst.institution_type_custom_name).toBeNull();
    expect(inst.is_organization_known).toBe(false);
    expect(inst.institution_id).toBeNull();
  });

  it('should allow assigning values to properties', () => {
    const inst = new InstitutionType();
    inst.result_institution_type_id = 1;
    inst.result_id = 2;
    inst.institution_type_id = 3;
    inst.sub_institution_type_id = 4;
    inst.institution_type_custom_name = 'Custom';
    inst.is_organization_known = true;
    inst.institution_id = 5;
    expect(inst.result_institution_type_id).toBe(1);
    expect(inst.result_id).toBe(2);
    expect(inst.institution_type_id).toBe(3);
    expect(inst.sub_institution_type_id).toBe(4);
    expect(inst.institution_type_custom_name).toBe('Custom');
    expect(inst.is_organization_known).toBe(true);
    expect(inst.institution_id).toBe(5);
  });
});
