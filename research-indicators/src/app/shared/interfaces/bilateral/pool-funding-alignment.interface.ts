export interface AlignmentLever {
  lever_code: string;
  lever_name: string;
}

export interface AlignmentResponse {
  result_code: string;
  eligible: boolean;
  has_pool_funding_alignment_eligible: boolean;
  has_contribution: boolean | null;
  selected_levers: AlignmentLever[];
  justification?: string;
  is_synced_to_prms: boolean;
  is_read_only: boolean;
}

export interface UpdatePoolFundingAlignmentDto {
  has_contribution: boolean;
  lever_codes?: string[];
  justification?: string;
}

export interface AlignmentChangedEvent {
  result_code: string;
  by_user_id: number;
  at: string;
}
