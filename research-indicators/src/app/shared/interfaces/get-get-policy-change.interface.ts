export interface GetPolicyChange {
  loaded?: boolean;
  evidence_stage?: null;
  policy_stage_id?: null;
  policy_type_id?: null;
  implementing_organization?: [];
  innovation_dev_output?: [];
  innovation_development?: {
    link_result_id: number;
    result_id: number;
    other_result_id: number;
    link_result_role_id: number;
  };
  innovation_use?: {
    link_result_id: number;
    result_id: number;
    other_result_id: number;
    link_result_role_id: number;
  };
}
