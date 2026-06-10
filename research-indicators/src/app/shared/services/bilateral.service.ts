import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AgressoContractRow, PoolFundingTagPatchResponse } from '@interfaces/bilateral/agresso-contract.interface';
import {
  AlignmentResponse,
  BilateralHlosIndicatorsResponse,
  BilateralTocCatalogResponse,
  HloKeyString,
  HloMapping,
  HloModalSelectionKey,
  IndicatorRow,
  IndicatorType,
  PoolFundingMappingStatus,
  PoolFundingScienceProgram,
  PrmsTocIndicator,
  PrmsTocResult,
  SavedTocAlignment,
  SpAlignmentDraft,
  TocAlignmentWriteDto,
  TocCatalogSp,
  UpdatePoolFundingAlignmentDto
} from '@interfaces/bilateral/pool-funding-alignment.interface';
import { RolesService } from './cache/roles.service';
import { CurrentResultService } from './cache/current-result.service';
import { ErrorResponse } from '@shared/interfaces/responses.interface';

export type PatchTagResult =
  | { ok: true; data: PoolFundingTagPatchResponse }
  | { ok: false; status: number; description: string };

// Per-alignment 400 validation entry (400 `errors.toc_alignments: [{ sp_code,
// field?, message }]`) — routed by the page to the owning SP block (AC-08.2).
// @sdd-spec docs/specs/bilateral-module/toc-mapping-v2 (T-BIL-TM2-02)
export interface TocAlignmentError {
  sp_code: string;
  field?: string;
  message: string;
}

export type PatchAlignmentResult =
  | { ok: true; data: AlignmentResponse }
  | {
      ok: false;
      status: number;
      description: string;
      fieldErrors?: Record<string, string>;
      // REQ-BIL-ASR-03 — SP codes the backend rejected because they aren't in the
      // result's per-result list (400 `errors.unknown_sp_codes: string[]`). Carried
      // separately from the string-valued `fieldErrors` so the component can both
      // surface an inline message and highlight the offending chips.
      unknownSpCodes?: string[];
      // AC-08.2 — per-SP ToC alignment validation errors, carried separately so the
      // page can render them inline on the matching block instead of a global toast.
      tocAlignmentErrors?: TocAlignmentError[];
    };

@Injectable({ providedIn: 'root' })
export class BilateralService {
  private readonly api = inject(ApiService);
  private readonly rolesService = inject(RolesService);
  private readonly currentResultService = inject(CurrentResultService);

  readonly currentContract = signal<AgressoContractRow | null>(null);
  readonly loadingContract = signal(false);
  readonly savingTag = signal(false);

  readonly currentAlignment = signal<AlignmentResponse | null>(null);
  readonly loadingAlignment = signal(false);
  readonly savingAlignment = signal(false);

  // Per-result SP picker source (REQ-BIL-ASR-01). `mappingStatus` discriminates the
  // empty states: `unmapped` → contact-ops message; `mapped` + empty list → no-SPs
  // message. Defaults to null so the picker shows neither message until loaded.
  readonly sciencePrograms = signal<PoolFundingScienceProgram[]>([]);
  readonly mappingStatus = signal<PoolFundingMappingStatus | null>(null);
  readonly loadingSciencePrograms = signal(false);

  readonly editable = computed(() => {
    const alignment = this.currentAlignment();
    if (!alignment) return false;
    if (alignment.is_read_only) return false;
    if (this.rolesService.canAccessCenterAdmin()) return true;
    return this.currentResultService.isCurrentUserOwner();
  });

  // --- Indicator-mapping state (T-BIL-IM-04 — read + modal-selection surface) -
  // @sdd-spec docs/specs/bilateral-module/indicator-mapping
  // Result-scoped HLOs + indicators tree (T-15.12 endpoint). Null until first fetch.
  readonly hlosIndicators = signal<BilateralHlosIndicatorsResponse | null>(null);
  // What the server currently has for this result (seed source for is_mapped joins).
  readonly persistedMappings = signal<HloMapping[]>([]);
  // Working copy — mutated by modal Confirm and per-card edits; diffed on Save.
  readonly pendingMappings = signal<HloMapping[]>([]);
  // Modal-session draft set of selection keys (Confirm writes back to pendingMappings).
  readonly hloModalSelection = signal<Set<HloKeyString>>(new Set());
  readonly loadingHlos = signal(false);
  // Save-in-flight UX gate. Stays false until the gated saveMappings write surface lands (OQ-IM-1).
  readonly savingMappings = signal(false);
  // Modal client-side search input. The endpoint returns the full live tree (no search param).
  readonly indicatorSearch = signal('');

  // Derived flat view: IndicatorRow[] joined against persistedMappings for is_mapped.
  // Components consume this instead of walking pairs[].outcomes[].indicators[] themselves.
  readonly indicatorRows = computed<IndicatorRow[]>(() => this.materializeRows(this.hlosIndicators(), this.persistedMappings()));

  // --- ToC mapping v2 catalog state (T-BIL-TM2-02) -----------------------------
  // @sdd-spec docs/specs/bilateral-module/toc-mapping-v2
  // Reshaped per-result ToC catalog (SP → level → ToC result → indicator). Null
  // until first successful fetch; on a non-2xx the prior value is KEPT and only
  // `tocCatalogError` flips, so already-rendered blocks stay usable while the
  // block-level retry affordance is shown (design §4.4, AC-11.1/AC-11.2).
  readonly tocCatalog = signal<BilateralTocCatalogResponse | null>(null);
  readonly loadingTocCatalog = signal(false);
  readonly tocCatalogError = signal(false);

  async getContract(code: string): Promise<AgressoContractRow | null> {
    this.loadingContract.set(true);
    try {
      const res = await this.api.GET_FindContracts({ 'contract-code': code, limit: 1 });
      if (!res?.successfulRequest) {
        this.currentContract.set(null);
        return null;
      }
      const row = res.data?.data?.[0] ?? null;
      this.currentContract.set(row);
      return row;
    } finally {
      this.loadingContract.set(false);
    }
  }

  async patchTag(code: string, value: boolean): Promise<PatchTagResult> {
    this.savingTag.set(true);
    try {
      const res = await this.api.PATCH_PoolFundingTag(code, { is_pool_funding_contributor: value });
      if (res?.successfulRequest) {
        this.currentContract.update(c => (c ? { ...c, is_pool_funding_contributor: value } : c));
        return { ok: true, data: res.data };
      }
      return {
        ok: false,
        status: res?.status ?? 0,
        description: res?.errorDetail?.description ?? ''
      };
    } finally {
      this.savingTag.set(false);
    }
  }

  isBilateral(contract: AgressoContractRow | null | undefined): boolean {
    const fundingType = contract?.funding_type;
    if (!fundingType) return false;
    return fundingType.toLowerCase().includes('bilateral');
  }

  async getAlignment(resultCode: string): Promise<AlignmentResponse | null> {
    this.loadingAlignment.set(true);
    try {
      const res = await this.api.GET_PoolFundingAlignment(resultCode);
      if (!res?.successfulRequest) {
        this.currentAlignment.set(null);
        return null;
      }
      this.currentAlignment.set(res.data);
      return res.data;
    } finally {
      this.loadingAlignment.set(false);
    }
  }

  async getSciencePrograms(resultCode: string): Promise<PoolFundingScienceProgram[]> {
    this.loadingSciencePrograms.set(true);
    try {
      const res = await this.api.GET_PoolFundingSciencePrograms(resultCode);
      if (!res?.successfulRequest) {
        // No fallback to the 13-SP catalog (REQ-BIL-ASR-01 pitfall 1): on failure
        // leave the list empty and the status null so the picker stays empty.
        this.sciencePrograms.set([]);
        this.mappingStatus.set(null);
        return [];
      }
      const data = res.data;
      const programs = Array.isArray(data?.science_programs) ? data.science_programs : [];
      this.sciencePrograms.set(programs);
      this.mappingStatus.set(data?.mapping_status ?? null);
      return programs;
    } finally {
      this.loadingSciencePrograms.set(false);
    }
  }

  async patchAlignment(resultCode: string, body: UpdatePoolFundingAlignmentDto): Promise<PatchAlignmentResult> {
    this.savingAlignment.set(true);
    try {
      const res = await this.api.PATCH_PoolFundingAlignment(resultCode, body);
      if (res?.successfulRequest) {
        this.currentAlignment.set(res.data);
        return { ok: true, data: res.data };
      }
      const fieldErrors = this.extractFieldErrors(res?.errorDetail);
      const unknownSpCodes = this.extractUnknownSpCodes(res?.errorDetail);
      const tocAlignmentErrors = this.extractTocAlignmentErrors(res?.errorDetail);
      return {
        ok: false,
        status: res?.status ?? 0,
        description: res?.errorDetail?.description ?? '',
        ...(fieldErrors ? { fieldErrors } : {}),
        ...(unknownSpCodes ? { unknownSpCodes } : {}),
        ...(tocAlignmentErrors ? { tocAlignmentErrors } : {})
      };
    } finally {
      this.savingAlignment.set(false);
    }
  }

  // REQ-BIL-ASR-03 — pull `unknown_sp_codes: string[]` out of the 400 envelope.
  // The shipped `extractFieldErrors` can't (it parses only stringified-JSON and keeps
  // only string-valued entries, dropping arrays), so this is a separate, tolerant
  // extractor. It accepts `errorDetail.errors` as EITHER a stringified-JSON string
  // OR an already-parsed object (the typed shape is `string`, but the live envelope
  // shape is being confirmed — see spec LIVE-VERIFY), and keeps only string entries
  // of the `unknown_sp_codes` array.
  private extractUnknownSpCodes(errorDetail: ErrorResponse | undefined): string[] | undefined {
    const raw: unknown = errorDetail?.errors;
    let parsed: unknown = raw;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed.startsWith('{')) return undefined;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return undefined;
      }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
    const value = (parsed as Record<string, unknown>)['unknown_sp_codes'];
    if (!Array.isArray(value)) return undefined;
    const codes = value.filter((c): c is string => typeof c === 'string' && c.trim().length > 0);
    return codes.length > 0 ? codes : undefined;
  }

  // AC-08.2 — pull `toc_alignments: [{ sp_code, field?, message }]` out of the 400
  // envelope. Tolerant like `extractUnknownSpCodes` above: accepts `errorDetail.errors`
  // as EITHER a stringified-JSON string OR an already-parsed object, and keeps only
  // well-formed entries (non-empty string `sp_code` + string `message`; `field` only
  // when it's a string). Malformed payloads → undefined, never a throw.
  // @sdd-spec docs/specs/bilateral-module/toc-mapping-v2 (T-BIL-TM2-02)
  private extractTocAlignmentErrors(errorDetail: ErrorResponse | undefined): TocAlignmentError[] | undefined {
    const raw: unknown = errorDetail?.errors;
    let parsed: unknown = raw;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed.startsWith('{')) return undefined;
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        return undefined;
      }
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
    const value = (parsed as Record<string, unknown>)['toc_alignments'];
    if (!Array.isArray(value)) return undefined;
    const entries: TocAlignmentError[] = [];
    for (const item of value) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
      const record = item as Record<string, unknown>;
      const spCode = record['sp_code'];
      const message = record['message'];
      if (typeof spCode !== 'string' || spCode.trim().length === 0) continue;
      if (typeof message !== 'string') continue;
      const field = record['field'];
      entries.push({ sp_code: spCode, message, ...(typeof field === 'string' ? { field } : {}) });
    }
    return entries.length > 0 ? entries : undefined;
  }

  private extractFieldErrors(errorDetail: ErrorResponse | undefined): Record<string, string> | undefined {
    const raw = errorDetail?.errors;
    if (typeof raw !== 'string' || !raw.trim().startsWith('{')) return undefined;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
      const result: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === 'string') result[k] = v;
      }
      return Object.keys(result).length > 0 ? result : undefined;
    } catch {
      return undefined;
    }
  }

  // --- Indicator-mapping reads + modal-selection surface (T-BIL-IM-04) --------

  // Result-scoped HLOs + indicators tree. NO catalog fallback on failure — on a
  // non-2xx the prior `hlosIndicators` value is left untouched (the modal then
  // surfaces its empty/blocking states from the existing tree, not from a refetch).
  async getHlosIndicators(resultCode: string): Promise<BilateralHlosIndicatorsResponse | null> {
    this.loadingHlos.set(true);
    try {
      const res = await this.api.GET_PoolFundingHlosIndicators(resultCode);
      if (res?.successfulRequest) {
        // Transition cast: the endpoint envelope was re-typed to the reshaped
        // `BilateralTocCatalogResponse` (T-BIL-TM2-02), so this modal-era read is
        // dead-but-compiling until T-BIL-TM2-05 deletes the whole modal surface.
        const data = res.data as unknown as BilateralHlosIndicatorsResponse;
        this.hlosIndicators.set(data);
        return data;
      }
      return null;
    } finally {
      this.loadingHlos.set(false);
    }
  }

  // --- ToC mapping v2 catalog read + draft seams (T-BIL-TM2-02) ----------------
  // @sdd-spec docs/specs/bilateral-module/toc-mapping-v2

  // Reshaped per-result ToC catalog read (mirrors getAlignment's loading/error
  // discipline). Keep-prior-value-on-error (design §4.4): a non-2xx flips only
  // `tocCatalogError`; a later success clears it. `loadingTocCatalog` is managed
  // in try/finally so the AC-11.1/AC-11.2 state machine never sticks on loading.
  async getTocCatalog(resultCode: string): Promise<BilateralTocCatalogResponse | null> {
    this.loadingTocCatalog.set(true);
    try {
      const res = await this.api.GET_PoolFundingHlosIndicators(resultCode);
      if (!res?.successfulRequest) {
        this.tocCatalogError.set(true);
        return null;
      }
      this.tocCatalog.set(res.data);
      this.tocCatalogError.set(false);
      return res.data;
    } finally {
      this.loadingTocCatalog.set(false);
    }
  }

  // Pure lookup of one SP's catalog branch — no signal side effects.
  catalogForSp(spCode: string): TocCatalogSp | null {
    return this.tocCatalog()?.catalogs?.find(c => c.sp_code === spCode) ?? null;
  }

  // Pre-fill seam (REQ-BIL-TM2-08): map saved alignments to per-SP drafts.
  // Missing optional cascade fields become explicit nulls (the draft's "unset").
  draftsFromSaved(saved: SavedTocAlignment[] | undefined | null): SpAlignmentDraft[] {
    return (saved ?? []).map(s => ({
      sp_code: s.sp_code,
      aligns_with_toc: s.aligns_with_toc,
      level: s.level ?? null,
      toc_result_id: s.toc_result_id ?? null,
      indicator_id: s.indicator_id ?? null,
      quantitative_contribution: s.quantitative_contribution ?? null
    }));
  }

  // Save seam (design §4.4 + D-9): `aligns_with_toc === false` → bare No DTO (no
  // cascade fields); complete Yes → full DTO; unanswered (`null`) or incomplete
  // Yes drafts are omitted entirely — defensive only, `canSave` gates completeness
  // upstream (T-BIL-TM2-04).
  writeDtoFromDrafts(drafts: SpAlignmentDraft[]): TocAlignmentWriteDto[] {
    const dtos: TocAlignmentWriteDto[] = [];
    for (const draft of drafts) {
      if (draft.aligns_with_toc === false) {
        dtos.push({ sp_code: draft.sp_code, aligns_with_toc: false });
        continue;
      }
      if (draft.aligns_with_toc !== true) continue; // unanswered → omitted
      if (
        draft.level === null ||
        draft.toc_result_id === null ||
        draft.indicator_id === null ||
        draft.quantitative_contribution === null ||
        draft.quantitative_contribution < 0
      ) {
        continue; // incomplete Yes → omitted (D-9)
      }
      dtos.push({
        sp_code: draft.sp_code,
        aligns_with_toc: true,
        level: draft.level,
        toc_result_id: draft.toc_result_id,
        indicator_id: draft.indicator_id,
        quantitative_contribution: draft.quantitative_contribution
      });
    }
    return dtos;
  }

  // Stable Set/diff key for a selection. `area_of_work` may be '' under no_aow_mappings.
  private keyOf(k: { lever_code: string; aow_code: string; indicator_code: string }): HloKeyString {
    return `${k.lever_code}|${k.aow_code}|${k.indicator_code}`;
  }

  // Modal open: seed the in-session draft from the current pending set.
  loadModalSelection(): void {
    this.hloModalSelection.set(new Set(this.pendingMappings().map(m => this.keyOf(m))));
  }

  // Modal Confirm: materialize the draft set back into HloMapping rows.
  commitModalSelection(): void {
    this.pendingMappings.set(this.materializeMappings(this.hloModalSelection()));
  }

  // Modal Cancel / ×: discard the draft. pendingMappings is intentionally untouched;
  // the stale hloModalSelection is re-seeded on the next loadModalSelection().
  cancelModalSelection(): void {
    // no-op on pendingMappings (discard semantics)
  }

  // Per-card edit: patch a single pending mapping selected by its composite key.
  updateMappingField(key: HloModalSelectionKey, patch: Partial<HloMapping>): void {
    const k = this.keyOf(key);
    this.pendingMappings.update(list => list.map(m => (this.keyOf(m) === k ? { ...m, ...patch } : m)));
  }

  // Per-card removal: drop the matching pending mapping.
  removeMapping(key: HloModalSelectionKey): void {
    const k = this.keyOf(key);
    this.pendingMappings.update(list => list.filter(m => this.keyOf(m) !== k));
  }

  // --- Gated on OQ-IM-1 / OQ-IM-3 (PO decision + edit-mode GET pending) -------
  // The write surface (`saveMappings`, `bodyOf`, `getContribution`, `getMappings`,
  // the `diff()` helper, and the `SaveMappingsResult` type) is intentionally NOT
  // implemented here: it depends on the contribution body shape (OQ-IM-1) and the
  // edit-mode pre-fill route (OQ-IM-3), neither of which is locked. See tasks.md
  // §T-BIL-IM-04 + design.md §4.4.1.

  // --- Private derivation helpers (the single wire→view seam) -----------------

  // Flatten BilateralHlosIndicatorsResponse → IndicatorRow[], joining is_mapped
  // against the persisted set. Null-guards the live wire shape: `pair.outcomes` /
  // `pair.outputs` and each `toc.indicators` are all optional/absent in practice.
  private materializeRows(hlos: BilateralHlosIndicatorsResponse | null, persisted: HloMapping[]): IndicatorRow[] {
    if (!hlos) return [];
    const persistedKeys = new Set(persisted.map(m => this.keyOf(m)));
    const rows: IndicatorRow[] = [];
    for (const pair of hlos.pairs ?? []) {
      const tocResults = [...(pair.outcomes ?? []), ...(pair.outputs ?? [])];
      for (const toc of tocResults) {
        const indicatorType = this.deriveIndicatorType(toc);
        for (const ind of toc.indicators ?? []) {
          const indicator_code = String(ind.indicator_id);
          const key = `${pair.program}|${pair.area_of_work}|${indicator_code}`;
          rows.push({
            indicator_id: ind.indicator_id,
            composite_code: pair.composite_code,
            program: pair.program,
            area_of_work: pair.area_of_work,
            toc_result_id: toc.toc_result_id,
            indicator_type: indicatorType,
            indicator_name: ind.indicator_description,
            target_description: this.composeTarget(ind.target_value_sum, ind.unit_messurament),
            // Temporary derivation — replaced by the wire `is_quantitative` flag once
            // the backend safe bundle mirrors it onto PrmsTocIndicator (OQ-IM-6).
            is_quantitative: this.inferQuantitative(ind),
            is_mapped: persistedKeys.has(key),
            is_stale: false,
            disabled_reason: null
          });
        }
      }
    }
    return rows;
  }

  // Discriminate OUTCOME vs OUTPUT off the live `category` field (case-insensitive).
  // The design's older draft keyed off `result_level_id`, but `category` is the
  // correct live discriminator (`result_level_id` is optional + nullable on the DTO).
  private deriveIndicatorType(toc: PrmsTocResult): IndicatorType {
    switch ((toc.category ?? '').toUpperCase()) {
      case 'OUTCOME':
        return 'outcome';
      case 'OUTPUT':
        return 'output';
      default:
        return 'outcome';
    }
  }

  // Compose the read-only "Expected target" display from PRMS sum + unit. Handles
  // both string and number `value` (live `target_value_sum` is string | number | null).
  private composeTarget(value: string | number | null | undefined, unit: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const valueText = String(value).trim();
    if (valueText.length === 0) return null;
    const unitText = (unit ?? '').trim();
    return unitText.length > 0 ? `${valueText} ${unitText}` : valueText;
  }

  // Temporary heuristic until OQ-IM-6 ships a wire `is_quantitative` flag: an
  // indicator is treated as quantitative when it carries a non-empty unit of measure.
  private inferQuantitative(ind: PrmsTocIndicator): boolean {
    return (ind.unit_messurament ?? '').trim().length > 0;
  }

  // Convert a Set of selection keys back into HloMapping rows by joining against the
  // derived indicatorRows() for display metadata. Preserves quantitative_contribution
  // + reason_code + is_stale from any existing pendingMappings entry with the same key;
  // new keys get null/false defaults. Keys that don't resolve to a known row are dropped.
  private materializeMappings(keys: Set<HloKeyString>): HloMapping[] {
    const rows = this.indicatorRows();
    const rowByKey = new Map<HloKeyString, IndicatorRow>();
    for (const row of rows) {
      rowByKey.set(`${row.program}|${row.area_of_work}|${String(row.indicator_id)}`, row);
    }
    const existingByKey = new Map<HloKeyString, HloMapping>();
    for (const m of this.pendingMappings()) {
      existingByKey.set(this.keyOf(m), m);
    }

    const alignment = this.currentAlignment();
    const leverNameOf = (leverCode: string): string =>
      alignment?.selected_levers?.find(l => l.lever_code === leverCode)?.lever_name ?? leverCode;
    const resultCode = this.hlosIndicators()?.result_code ?? alignment?.result_code ?? '';

    const mappings: HloMapping[] = [];
    for (const key of keys) {
      const row = rowByKey.get(key);
      if (!row) continue; // drop keys that don't resolve to a known catalog row
      const indicator_code = String(row.indicator_id);
      const existing = existingByKey.get(key);
      mappings.push({
        result_code: resultCode,
        lever_code: row.program,
        lever_name: leverNameOf(row.program),
        aow_code: row.area_of_work,
        // PRMS ships no AOW display name today — fall back to the code.
        aow_name: row.area_of_work,
        indicator_code,
        indicator_name: row.indicator_name,
        indicator_type: row.indicator_type,
        is_stale: existing?.is_stale ?? false,
        is_quantitative: row.is_quantitative,
        target_description: row.target_description,
        quantitative_contribution: existing?.quantitative_contribution ?? null,
        reason_code: existing?.reason_code ?? null
      });
    }
    return mappings;
  }
}
