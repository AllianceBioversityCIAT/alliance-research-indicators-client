import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BilateralService } from './bilateral.service';
import { ApiService } from './api.service';
import { RolesService } from './cache/roles.service';
import { CurrentResultService } from './cache/current-result.service';
import { FindContracts, FindContractsResponse } from '@shared/interfaces/find-contracts.interface';
import { MainResponse } from '@shared/interfaces/responses.interface';
import { PoolFundingTagPatchResponse } from '@interfaces/bilateral/agresso-contract.interface';
import { AlignmentResponse, PoolFundingSciencePrograms } from '@interfaces/bilateral/pool-funding-alignment.interface';

describe('BilateralService', () => {
  let service: BilateralService;
  let mockApi: {
    GET_FindContracts: jest.Mock;
    PATCH_PoolFundingTag: jest.Mock;
    GET_PoolFundingAlignment: jest.Mock;
    PATCH_PoolFundingAlignment: jest.Mock;
    GET_PoolFundingSciencePrograms: jest.Mock;
  };
  let canAccessCenterAdminSignal: ReturnType<typeof signal<boolean>>;
  let isCurrentUserOwnerSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    mockApi = {
      GET_FindContracts: jest.fn(),
      PATCH_PoolFundingTag: jest.fn(),
      GET_PoolFundingAlignment: jest.fn(),
      PATCH_PoolFundingAlignment: jest.fn(),
      GET_PoolFundingSciencePrograms: jest.fn()
    };
    canAccessCenterAdminSignal = signal<boolean>(false);
    isCurrentUserOwnerSignal = signal<boolean>(false);
    TestBed.configureTestingModule({
      providers: [
        BilateralService,
        { provide: ApiService, useValue: mockApi },
        { provide: RolesService, useValue: { canAccessCenterAdmin: canAccessCenterAdminSignal } },
        { provide: CurrentResultService, useValue: { isCurrentUserOwner: isCurrentUserOwnerSignal } }
      ]
    });
    service = TestBed.inject(BilateralService);
  });

  const ok = <T>(data: T, overrides: Partial<MainResponse<T>> = {}): MainResponse<T> =>
    ({
      data,
      status: 200,
      description: 'OK',
      timestamp: '',
      path: '',
      successfulRequest: true,
      errorDetail: { errors: '', detail: '', description: '' },
      ...overrides
    }) as MainResponse<T>;

  const err = <T>(status: number, description: string, data: T): MainResponse<T> =>
    ({
      data,
      status,
      description: 'error',
      timestamp: '',
      path: '',
      successfulRequest: false,
      errorDetail: { errors: '', detail: '', description }
    }) as MainResponse<T>;

  describe('getContract', () => {
    it('happy path — sets currentContract, returns the first row, toggles loadingContract', async () => {
      const row: FindContracts = {
        agreement_id: 'AC-1594',
        is_pool_funding_contributor: true,
        funding_type: 'Bilateral'
      };
      const response = ok<FindContractsResponse>({
        data: [row],
        metadata: { total: 1, page: 1, limit: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
      });
      let loadingDuringCall = false;
      mockApi.GET_FindContracts.mockImplementation(() => {
        loadingDuringCall = service.loadingContract();
        return Promise.resolve(response);
      });

      const result = await service.getContract('AC-1594');

      expect(loadingDuringCall).toBe(true);
      expect(service.loadingContract()).toBe(false);
      expect(service.currentContract()).toEqual(row);
      expect(result).toEqual(row);
      expect(mockApi.GET_FindContracts).toHaveBeenCalledWith({ 'contract-code': 'AC-1594', limit: 1 });
    });

    it('empty result — returns null and sets currentContract to null', async () => {
      mockApi.GET_FindContracts.mockResolvedValue(
        ok<FindContractsResponse>({
          data: [],
          metadata: { total: 0, page: 1, limit: 1, totalPages: 0, hasNextPage: false, hasPreviousPage: false }
        })
      );

      const result = await service.getContract('nope');

      expect(result).toBeNull();
      expect(service.currentContract()).toBeNull();
      expect(service.loadingContract()).toBe(false);
    });

    it('unsuccessful request (404) — returns null and clears currentContract', async () => {
      mockApi.GET_FindContracts.mockResolvedValue(err<FindContractsResponse>(404, 'not found', undefined as unknown as FindContractsResponse));

      const result = await service.getContract('gone');

      expect(result).toBeNull();
      expect(service.currentContract()).toBeNull();
      expect(service.loadingContract()).toBe(false);
    });
  });

  describe('patchTag', () => {
    const seedContract = () => {
      const row: FindContracts = {
        agreement_id: 'AC-1594',
        is_pool_funding_contributor: false,
        funding_type: 'Bilateral'
      };
      service.currentContract.set(row);
      return row;
    };

    it('200 — returns ok:true, updates currentContract optimistically, toggles savingTag', async () => {
      seedContract();
      const data: PoolFundingTagPatchResponse = {
        agreement_id: 'AC-1594',
        is_pool_funding_contributor: true,
        updated_at: '2026-05-20T00:00:00.000Z'
      };
      let savingDuringCall = false;
      mockApi.PATCH_PoolFundingTag.mockImplementation(() => {
        savingDuringCall = service.savingTag();
        return Promise.resolve(ok<PoolFundingTagPatchResponse>(data));
      });

      const result = await service.patchTag('AC-1594', true);

      expect(savingDuringCall).toBe(true);
      expect(service.savingTag()).toBe(false);
      expect(result).toEqual({ ok: true, data });
      expect(service.currentContract()?.is_pool_funding_contributor).toBe(true);
      expect(mockApi.PATCH_PoolFundingTag).toHaveBeenCalledWith('AC-1594', { is_pool_funding_contributor: true });
    });

    it('400 with "bilateral" in errorDetail.description — returns ok:false, leaves currentContract unchanged', async () => {
      seedContract();
      mockApi.PATCH_PoolFundingTag.mockResolvedValue(
        err<PoolFundingTagPatchResponse>(
          400,
          'This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag.',
          undefined as unknown as PoolFundingTagPatchResponse
        )
      );

      const result = await service.patchTag('AC-NB', true);

      expect(result).toEqual({
        ok: false,
        status: 400,
        description: 'This contract is not bilateral. Only bilateral contracts can carry the Pool Funding tag.'
      });
      expect(service.currentContract()?.is_pool_funding_contributor).toBe(false);
      expect(service.savingTag()).toBe(false);
    });

    it('500 — returns ok:false with status 500 and propagated description', async () => {
      mockApi.PATCH_PoolFundingTag.mockResolvedValue(
        err<PoolFundingTagPatchResponse>(500, 'Internal Server Error', undefined as unknown as PoolFundingTagPatchResponse)
      );

      const result = await service.patchTag('AC-1594', true);

      expect(result).toEqual({ ok: false, status: 500, description: 'Internal Server Error' });
      expect(service.savingTag()).toBe(false);
    });

    it('rejection — savingTag resets to false (defensive try/finally)', async () => {
      mockApi.PATCH_PoolFundingTag.mockRejectedValue(new Error('network down'));

      await expect(service.patchTag('AC-1594', true)).rejects.toThrow('network down');

      expect(service.savingTag()).toBe(false);
    });
  });

  describe('isBilateral', () => {
    it('true when funding_type contains "bilateral" (any case)', () => {
      expect(service.isBilateral({ funding_type: 'Bilateral' })).toBe(true);
      expect(service.isBilateral({ funding_type: 'BILATERAL CONTRACT' })).toBe(true);
      expect(service.isBilateral({ funding_type: 'mixed bilateral' })).toBe(true);
    });

    it('false when funding_type is missing or non-bilateral', () => {
      expect(service.isBilateral(null)).toBe(false);
      expect(service.isBilateral(undefined)).toBe(false);
      expect(service.isBilateral({})).toBe(false);
      expect(service.isBilateral({ funding_type: 'Pool Funding' })).toBe(false);
      expect(service.isBilateral({ funding_type: null })).toBe(false);
    });
  });

  describe('getAlignment', () => {
    const baseAlignment: AlignmentResponse = {
      result_code: 'RES-001',
      eligible: true,
      has_pool_funding_alignment_eligible: true,
      has_contribution: true,
      selected_levers: [{ lever_code: 'L1', lever_name: 'Lever 1' }],
      is_synced_to_prms: false,
      is_read_only: false
    };

    it('happy path — sets currentAlignment, toggles loadingAlignment true→false', async () => {
      let loadingDuringCall = false;
      mockApi.GET_PoolFundingAlignment.mockImplementation(() => {
        loadingDuringCall = service.loadingAlignment();
        return Promise.resolve(ok<AlignmentResponse>(baseAlignment));
      });

      const result = await service.getAlignment('RES-001');

      expect(loadingDuringCall).toBe(true);
      expect(service.loadingAlignment()).toBe(false);
      expect(service.currentAlignment()).toEqual(baseAlignment);
      expect(result).toEqual(baseAlignment);
      expect(mockApi.GET_PoolFundingAlignment).toHaveBeenCalledWith('RES-001');
    });

    it('404 — returns null and sets currentAlignment to null', async () => {
      mockApi.GET_PoolFundingAlignment.mockResolvedValue(
        err<AlignmentResponse>(404, 'not found', undefined as unknown as AlignmentResponse)
      );

      const result = await service.getAlignment('NONE');

      expect(result).toBeNull();
      expect(service.currentAlignment()).toBeNull();
      expect(service.loadingAlignment()).toBe(false);
    });

    it('rejection — loadingAlignment resets to false (defensive try/finally)', async () => {
      mockApi.GET_PoolFundingAlignment.mockRejectedValue(new Error('network down'));

      await expect(service.getAlignment('RES-001')).rejects.toThrow('network down');

      expect(service.loadingAlignment()).toBe(false);
    });
  });

  describe('getSciencePrograms (REQ-BIL-ASR-01)', () => {
    const mapped: PoolFundingSciencePrograms = {
      result_code: '19792',
      mapping_status: 'mapped',
      clarisa_project: { id: 1, short_name: 'T-PJ-003262-...' },
      science_programs: [
        { code: 'SP09', name: 'Scaling for Impact', category: 'Scaling programs', color: '#ec4899', icon_key: 'SP09', allocation: 25 },
        { code: 'SP10', name: 'Gender Equality and Inclusion', category: 'Accelerators', color: '#8b5cf6', icon_key: 'SP10', allocation: 75 }
      ]
    };

    it('mapped + SPs — sets sciencePrograms + mappingStatus, toggles loading, calls per-result endpoint with the numeric code', async () => {
      let loadingDuringCall = false;
      mockApi.GET_PoolFundingSciencePrograms.mockImplementation(() => {
        loadingDuringCall = service.loadingSciencePrograms();
        return Promise.resolve(ok<PoolFundingSciencePrograms>(mapped));
      });

      const result = await service.getSciencePrograms('STAR-19792');

      expect(loadingDuringCall).toBe(true);
      expect(service.loadingSciencePrograms()).toBe(false);
      expect(mockApi.GET_PoolFundingSciencePrograms).toHaveBeenCalledWith('STAR-19792');
      expect(service.mappingStatus()).toBe('mapped');
      expect(service.sciencePrograms()).toEqual(mapped.science_programs);
      expect(result).toEqual(mapped.science_programs);
    });

    it('unmapped — empty list + mappingStatus "unmapped" (no fallback to the 13-SP catalog, pitfall 1)', async () => {
      mockApi.GET_PoolFundingSciencePrograms.mockResolvedValue(
        ok<PoolFundingSciencePrograms>({
          result_code: '19792',
          mapping_status: 'unmapped',
          clarisa_project: null,
          science_programs: []
        })
      );

      const result = await service.getSciencePrograms('19792');

      expect(service.mappingStatus()).toBe('unmapped');
      expect(service.sciencePrograms()).toEqual([]);
      expect(result).toEqual([]);
    });

    it('mapped + empty list — keeps mappingStatus "mapped" with an empty list (distinct from unmapped)', async () => {
      mockApi.GET_PoolFundingSciencePrograms.mockResolvedValue(
        ok<PoolFundingSciencePrograms>({
          result_code: '19792',
          mapping_status: 'mapped',
          clarisa_project: { id: 1, short_name: 'T-PJ-003262-...' },
          science_programs: []
        })
      );

      await service.getSciencePrograms('19792');

      expect(service.mappingStatus()).toBe('mapped');
      expect(service.sciencePrograms()).toEqual([]);
    });

    it('unsuccessful request — clears list + status to null, no catalog fallback', async () => {
      mockApi.GET_PoolFundingSciencePrograms.mockResolvedValue(
        err<PoolFundingSciencePrograms>(404, 'not found', undefined as unknown as PoolFundingSciencePrograms)
      );

      const result = await service.getSciencePrograms('NONE');

      expect(service.sciencePrograms()).toEqual([]);
      expect(service.mappingStatus()).toBeNull();
      expect(result).toEqual([]);
      expect(service.loadingSciencePrograms()).toBe(false);
    });

    it('rejection — loadingSciencePrograms resets to false (defensive try/finally)', async () => {
      mockApi.GET_PoolFundingSciencePrograms.mockRejectedValue(new Error('network down'));

      await expect(service.getSciencePrograms('19792')).rejects.toThrow('network down');

      expect(service.loadingSciencePrograms()).toBe(false);
    });
  });

  describe('patchAlignment', () => {
    const successAlignment: AlignmentResponse = {
      result_code: 'RES-001',
      eligible: true,
      has_pool_funding_alignment_eligible: true,
      has_contribution: true,
      selected_levers: [{ lever_code: 'L1', lever_name: 'Lever 1' }],
      is_synced_to_prms: false,
      is_read_only: false
    };

    it('200 — returns ok:true and updates currentAlignment', async () => {
      let savingDuringCall = false;
      mockApi.PATCH_PoolFundingAlignment.mockImplementation(() => {
        savingDuringCall = service.savingAlignment();
        return Promise.resolve(ok<AlignmentResponse>(successAlignment));
      });

      const result = await service.patchAlignment('RES-001', { has_contribution: true, lever_codes: ['L1'] });

      expect(savingDuringCall).toBe(true);
      expect(service.savingAlignment()).toBe(false);
      expect(result).toEqual({ ok: true, data: successAlignment });
      expect(service.currentAlignment()).toEqual(successAlignment);
    });

    it('400 with structured field-keyed errors — returns ok:false with fieldErrors', async () => {
      const errorsJson = JSON.stringify({ has_contribution: 'must be true or false', lever_codes: 'at least one required' });
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue({
        data: undefined,
        status: 400,
        description: 'error',
        timestamp: '',
        path: '',
        successfulRequest: false,
        errorDetail: { errors: errorsJson, detail: '', description: 'Validation failed' }
      } as MainResponse<AlignmentResponse>);

      const result = await service.patchAlignment('RES-001', { has_contribution: true });

      expect(result).toEqual({
        ok: false,
        status: 400,
        description: 'Validation failed',
        fieldErrors: { has_contribution: 'must be true or false', lever_codes: 'at least one required' }
      });
      expect(service.savingAlignment()).toBe(false);
    });

    it('400 without parseable field errors — returns ok:false with description, no fieldErrors', async () => {
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue(
        err<AlignmentResponse>(400, 'has_contribution must be set', undefined as unknown as AlignmentResponse)
      );

      const result = await service.patchAlignment('RES-001', { has_contribution: true });

      expect(result).toEqual({
        ok: false,
        status: 400,
        description: 'has_contribution must be set'
      });
      expect((result as { fieldErrors?: unknown }).fieldErrors).toBeUndefined();
    });

    it('409 — returns ok:false with status 409 (component handles refetch)', async () => {
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue(
        err<AlignmentResponse>(409, 'Result was synced to PRMS', undefined as unknown as AlignmentResponse)
      );

      const result = await service.patchAlignment('RES-001', { has_contribution: true });

      expect(result).toEqual({ ok: false, status: 409, description: 'Result was synced to PRMS' });
      expect(service.savingAlignment()).toBe(false);
    });

    it('500 — returns ok:false with status 500; global interceptor handles toast', async () => {
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue(
        err<AlignmentResponse>(500, 'Internal Server Error', undefined as unknown as AlignmentResponse)
      );

      const result = await service.patchAlignment('RES-001', { has_contribution: false });

      expect(result).toEqual({ ok: false, status: 500, description: 'Internal Server Error' });
      expect(service.savingAlignment()).toBe(false);
    });

    it('rejection — savingAlignment resets to false (defensive try/finally)', async () => {
      mockApi.PATCH_PoolFundingAlignment.mockRejectedValue(new Error('network down'));

      await expect(service.patchAlignment('RES-001', { has_contribution: false })).rejects.toThrow('network down');

      expect(service.savingAlignment()).toBe(false);
    });
  });

  describe('editable computed', () => {
    const readOnlyFalse: AlignmentResponse = {
      result_code: 'RES-001',
      eligible: true,
      has_pool_funding_alignment_eligible: true,
      has_contribution: false,
      selected_levers: [],
      is_synced_to_prms: false,
      is_read_only: false
    };

    it('false when currentAlignment is null', () => {
      service.currentAlignment.set(null);
      canAccessCenterAdminSignal.set(true);
      isCurrentUserOwnerSignal.set(true);

      expect(service.editable()).toBe(false);
    });

    it('false when is_read_only is true (even for admin owner)', () => {
      service.currentAlignment.set({ ...readOnlyFalse, is_read_only: true });
      canAccessCenterAdminSignal.set(true);
      isCurrentUserOwnerSignal.set(true);

      expect(service.editable()).toBe(false);
    });

    it('true for admin / center admin (canAccessCenterAdmin=true) when not read-only', () => {
      service.currentAlignment.set(readOnlyFalse);
      canAccessCenterAdminSignal.set(true);
      isCurrentUserOwnerSignal.set(false);

      expect(service.editable()).toBe(true);
    });

    it('true for owner (isCurrentUserOwner=true) when not admin and not read-only', () => {
      service.currentAlignment.set(readOnlyFalse);
      canAccessCenterAdminSignal.set(false);
      isCurrentUserOwnerSignal.set(true);

      expect(service.editable()).toBe(true);
    });

    it('false when neither admin nor owner', () => {
      service.currentAlignment.set(readOnlyFalse);
      canAccessCenterAdminSignal.set(false);
      isCurrentUserOwnerSignal.set(false);

      expect(service.editable()).toBe(false);
    });
  });
});
