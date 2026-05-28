import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AgressoContractRow, PoolFundingTagPatchResponse } from '@interfaces/bilateral/agresso-contract.interface';
import {
  AlignmentResponse,
  PoolFundingMappingStatus,
  PoolFundingScienceProgram,
  UpdatePoolFundingAlignmentDto
} from '@interfaces/bilateral/pool-funding-alignment.interface';
import { RolesService } from './cache/roles.service';
import { CurrentResultService } from './cache/current-result.service';
import { ErrorResponse } from '@shared/interfaces/responses.interface';

export type PatchTagResult =
  | { ok: true; data: PoolFundingTagPatchResponse }
  | { ok: false; status: number; description: string };

export type PatchAlignmentResult =
  | { ok: true; data: AlignmentResponse }
  | { ok: false; status: number; description: string; fieldErrors?: Record<string, string> };

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
      return {
        ok: false,
        status: res?.status ?? 0,
        description: res?.errorDetail?.description ?? '',
        ...(fieldErrors ? { fieldErrors } : {})
      };
    } finally {
      this.savingAlignment.set(false);
    }
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
}
