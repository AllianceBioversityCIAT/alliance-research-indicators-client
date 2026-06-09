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
  toc_alignments?: SavedTocAlignment[];
}

export interface UpdatePoolFundingAlignmentDto {
  has_contribution: boolean;
  sp_codes?: string[];
  lever_codes?: string[];
  justification?: string;
  toc_alignments?: TocAlignmentWriteDto[];
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

// --- Result-scoped HLOs + indicators read shape (T-15.12 / T-BIL-IM-01) ------
// The PRMS + HLOs shapes below mirror the live backend DTO at
// `src/domain/entities/bilateral/dto/bilateral-hlos-indicators.response.dto.ts`
// (commit 907993e7) and its `src/domain/tools/prms-toc/dto/prms-toc.types.ts`
// import — copied field-for-field (including the upstream misspelling
// `unit_messurament`) so the FE compiler enforces parity with the contract.
// Endpoint: GET /v1/results/:resultCode/pool-funding-alignment/hlos-indicators
// @sdd-spec docs/specs/bilateral-module/indicator-mapping

export interface PrmsTocCenter {
  center_id: string;
  center_acronym: string;
  center_name: string;
}

export interface PrmsTocIndicatorTarget {
  toc_indicator_target_id: string;
  year: string;
  target_value: string;
  number_target: string;
}

export interface PrmsTocTargetsByCenter {
  targets?: PrmsTocIndicatorTarget[];
  centers?: PrmsTocCenter[];
}

export interface PrmsTocIndicator {
  indicator_id: string;
  indicator_description: string;
  toc_result_indicator_id?: string;
  related_node_id?: string;
  unit_messurament?: string | null;
  type_value?: string | null;
  type_name?: string | null;
  location?: string | null;
  target_value_sum?: string | number | null;
  actual_achieved_value_sum?: string | number | null;
  number_target?: string | null;
  target_date?: string | null;
  target_value?: string | null;
  progress_percentage?: string | null;
  result_level_id?: number | null;
  result_type_id?: number | null;
  result_type_name?: string | null;
  targets_by_center?: PrmsTocTargetsByCenter | Record<string, never>;
}

export type PrmsTocResultCategory = 'OUTCOME' | 'OUTPUT' | string;

export interface PrmsTocResult {
  toc_result_id: number;
  category: PrmsTocResultCategory;
  result_title: string;
  related_node_id?: string | null;
  result_level_id?: number | null;
  indicators?: PrmsTocIndicator[];
}

export type BilateralHlosAowStatus = 'unmapped' | 'no_aow_mappings' | 'has_aow';

export interface BilateralHlosPair {
  program: string; // SP code, e.g. "SP01"
  area_of_work: string; // AOW code, e.g. "AOW06"
  composite_code: string; // `${program}-${area_of_work}`
  outcomes: PrmsTocResult[];
  outputs: PrmsTocResult[];
  metadata: { total: number; outcomes: number; outputs: number };
}

export interface BilateralHlosIndicatorsResponse {
  result_code: string;
  mapping_status: 'mapped' | 'unmapped';
  aow_status: BilateralHlosAowStatus;
  clarisa_project: { id: number; short_name: string } | null;
  pairs: BilateralHlosPair[];
}

// Derived FE view-model (NOT a wire type). Computed by materializeRows in T-BIL-IM-04.
export type IndicatorType = 'output' | 'outcome' | '2030-outcome';

export interface IndicatorRow {
  indicator_id: string | number;
  composite_code: string;
  program: string;
  area_of_work: string;
  toc_result_id: string | number;
  indicator_type: IndicatorType;
  indicator_name: string;
  target_description: string | null;
  is_quantitative: boolean;
  is_mapped: boolean;
  is_stale: boolean;
  disabled_reason: string | null;
}

// Persisted mapping (the user's selected HLO + contribution body). The contribution-value
// fields are intentionally loose optionals here — the POST/PATCH body shape (ContributionBody)
// is gated on OQ-IM-1 and is NOT defined in this task.
export interface HloMapping {
  result_code: string;
  lever_code: string; // === BilateralHlosPair.program
  lever_name: string;
  aow_code: string; // === BilateralHlosPair.area_of_work
  aow_name: string;
  indicator_code: string; // String(PrmsTocIndicator.indicator_id)
  indicator_name: string;
  indicator_type: IndicatorType;
  is_stale: boolean;
  is_quantitative: boolean;
  target_description: string | null;
  quantitative_contribution?: number | string | null; // value shape gated by OQ-IM-1/-5
  reason_code: string | null; // gated by OQ-IM-1/-4
}

export interface MappingResponse {
  result_code: string;
  lever_code: string;
  aow_code: string;
  indicator_code: string;
  is_stale: boolean;
}

export interface HloModalSelectionKey {
  lever_code: string;
  aow_code: string;
  indicator_code: string;
}

export type HloKeyString = string; // `lever_code|aow_code|indicator_code`

// --- ToC mapping v2 wire types (reshaped `hlos-indicators` catalog) ----------
// Mirrors `docs/specs/bilateral-module/toc-mapping-v2/backend-handoff.md` §4
// field-for-field (frozen FE wire contract): catalog read, PATCH write
// extension, and the `toc_alignments` read-back on the alignment envelope.
// The modal-era PRMS/HLOs types above remain until T-BIL-TM2-05 deletes them.
// @sdd-spec docs/specs/bilateral-module/toc-mapping-v2

export type TocLevel = 'OUTPUT' | 'OUTCOME' | 'EOI';

export interface TocCatalogIndicator {
  indicator_id: number;
  indicator_description: string;
  unit_of_measurement: string | null; // backend renames upstream `unit_messurament`
  type_value: string | null; // retained for the future type filter (A-4/OQ-1)
  target_value: string | null; // backend-resolved for target_year
  target_year: number; // 2026 this cycle
}

export interface TocCatalogResult {
  toc_result_id: number;
  title: string;
  description: string | null;
  aow_code: string | null; // null for EOI (REQ-BIL-TM2-05)
  indicators: TocCatalogIndicator[];
}

export interface TocCatalogLevelGroup {
  level: TocLevel;
  toc_results: TocCatalogResult[];
}

export interface TocCatalogSp {
  sp_code: string;
  levels: TocCatalogLevelGroup[];
}

export interface BilateralTocCatalogResponse {
  result_code: string;
  mapping_status: PoolFundingMappingStatus;
  clarisa_project: PoolFundingClarisaProject | null;
  result_type: string; // backend-owned enum key
  allowed_levels: TocLevel[]; // [] ⇒ hide cascade (REQ-BIL-TM2-04 AC-04.3)
  version_locked: boolean; // REQ-BIL-TM2-09
  catalogs: TocCatalogSp[];
}

export interface TocAlignmentSnapshot {
  // survives upstream catalog drift (AC-08.4)
  toc_result_title: string;
  aow_code: string | null;
  indicator_description: string;
  unit_of_measurement: string | null;
  target_value: string | null;
  target_year: number;
}

export interface SavedTocAlignment {
  sp_code: string;
  aligns_with_toc: boolean;
  level?: TocLevel;
  toc_result_id?: number;
  indicator_id?: number;
  quantitative_contribution?: number | null;
  snapshot?: TocAlignmentSnapshot;
  is_stale?: boolean; // catalog item no longer resolvable
}

export interface TocAlignmentWriteDto {
  sp_code: string;
  aligns_with_toc: boolean;
  level?: TocLevel;
  toc_result_id?: number;
  indicator_id?: number;
  quantitative_contribution?: number;
}

// Derived FE view-model (NOT a wire type) — per-SP draft for the inline cascade.
export interface SpAlignmentDraft {
  sp_code: string;
  aligns_with_toc: boolean | null; // per-SP Yes/No (null until answered)
  level: TocLevel | null;
  toc_result_id: number | null;
  indicator_id: number | null;
  quantitative_contribution: number | null;
}
