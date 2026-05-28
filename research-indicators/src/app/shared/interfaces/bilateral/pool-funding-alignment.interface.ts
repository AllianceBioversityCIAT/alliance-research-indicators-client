export interface AlignmentLever {
  lever_code: string;
  lever_name: string;
}

export interface AlignmentScienceProgram {
  code: string;
  name: string;
  category?: string | null;
  color?: string | null;
}

export interface AlignmentResponse {
  result_code: string;
  eligible: boolean;
  has_pool_funding_alignment_eligible: boolean;
  has_contribution: boolean | null;
  selected_science_programs?: AlignmentScienceProgram[];
  selected_levers: AlignmentLever[];
  justification?: string;
  is_synced_to_prms: boolean;
  is_read_only: boolean;
}

export interface UpdatePoolFundingAlignmentDto {
  has_contribution: boolean;
  sp_codes?: string[];
  lever_codes?: string[];
  justification?: string;
}

export interface AlignmentChangedEvent {
  result_code: string;
  by_user_id: number;
  at: string;
}

/**
 * Discriminator on the per-result SP picker response.
 * `mapped` = an active bilateral_project_mapping row exists for the result's contract;
 * `unmapped` = it doesn't (and `science_programs` is empty, `clarisa_project` is null).
 * @sdd-spec docs/specs/bilateral-module/alignment-section-remediation (REQ-BIL-ASR-01)
 */
export type PoolFundingMappingStatus = 'mapped' | 'unmapped';

export interface PoolFundingClarisaProject {
  id: number;
  short_name: string;
}

/**
 * A Science Program scoped to the result's mapped CLARISA project. `code` is the
 * value sent back on PATCH `sp_codes`. `color` is upstream CLARISA data (a fill
 * value, not a design token). `icon_key` resolves an asset at
 * `/sps/{icon_key}.png` (the provisioned STAR path; `icon_key === code` in current
 * backend fixtures). See spec AC-01.6.
 */
export interface PoolFundingScienceProgram {
  code: string;
  name: string;
  category?: string | null;
  color?: string | null;
  icon_key: string;
  allocation: number;
}

/**
 * Response of `GET /v1/results/{numericResultCode}/pool-funding-alignment/science-programs`.
 * When `mapping_status === 'unmapped'`, `science_programs` is `[]` and
 * `clarisa_project` is `null` — the FE must NOT fall back to the catalog-wide list.
 */
export interface PoolFundingSciencePrograms {
  result_code: string;
  mapping_status: PoolFundingMappingStatus;
  clarisa_project: PoolFundingClarisaProject | null;
  science_programs: PoolFundingScienceProgram[];
}
