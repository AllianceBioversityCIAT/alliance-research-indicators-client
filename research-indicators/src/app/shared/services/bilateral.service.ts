import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AgressoContractRow, PoolFundingTagPatchResponse } from '@interfaces/bilateral/agresso-contract.interface';

export type PatchTagResult =
  | { ok: true; data: PoolFundingTagPatchResponse }
  | { ok: false; status: number; description: string };

@Injectable({ providedIn: 'root' })
export class BilateralService {
  private readonly api = inject(ApiService);

  readonly currentContract = signal<AgressoContractRow | null>(null);
  readonly loadingContract = signal(false);
  readonly savingTag = signal(false);

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
}
