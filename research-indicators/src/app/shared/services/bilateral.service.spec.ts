import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BilateralService } from './bilateral.service';
import { ApiService } from './api.service';
import { RolesService } from './cache/roles.service';
import { CurrentResultService } from './cache/current-result.service';
import { FindContracts, FindContractsResponse } from '@shared/interfaces/find-contracts.interface';
import { MainResponse } from '@shared/interfaces/responses.interface';
import { PoolFundingTagPatchResponse } from '@interfaces/bilateral/agresso-contract.interface';
import {
  AlignmentResponse,
  BilateralHlosIndicatorsResponse,
  HloMapping,
  PoolFundingSciencePrograms
} from '@interfaces/bilateral/pool-funding-alignment.interface';
import {
  bilateralHlosIndicatorsResponseMock,
  bilateralHlosNoAowResponseMock,
  persistedMappingMock
} from '../../testing/fixtures/bilateral.fixtures';

describe('BilateralService', () => {
  let service: BilateralService;
  let mockApi: {
    GET_FindContracts: jest.Mock;
    PATCH_PoolFundingTag: jest.Mock;
    GET_PoolFundingAlignment: jest.Mock;
    PATCH_PoolFundingAlignment: jest.Mock;
    GET_PoolFundingSciencePrograms: jest.Mock;
    GET_PoolFundingHlosIndicators: jest.Mock;
  };
  let canAccessCenterAdminSignal: ReturnType<typeof signal<boolean>>;
  let isCurrentUserOwnerSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    mockApi = {
      GET_FindContracts: jest.fn(),
      PATCH_PoolFundingTag: jest.fn(),
      GET_PoolFundingAlignment: jest.fn(),
      PATCH_PoolFundingAlignment: jest.fn(),
      GET_PoolFundingSciencePrograms: jest.fn(),
      GET_PoolFundingHlosIndicators: jest.fn()
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

    it('REQ-BIL-ASR-03 — 400 with unknown_sp_codes as STRINGIFIED-JSON errors → unknownSpCodes populated', async () => {
      const errorsJson = JSON.stringify({ unknown_sp_codes: ['SP04', 'SP07'] });
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue({
        data: undefined,
        status: 400,
        description: 'Validation failed',
        timestamp: '',
        path: '',
        successfulRequest: false,
        errorDetail: { errors: errorsJson, detail: '', description: 'Validation failed' }
      } as MainResponse<AlignmentResponse>);

      const result = await service.patchAlignment('RES-001', { has_contribution: true, sp_codes: ['SP04', 'SP07'] });

      expect(result).toEqual({
        ok: false,
        status: 400,
        description: 'Validation failed',
        unknownSpCodes: ['SP04', 'SP07']
      });
      // unknown_sp_codes is an array → NOT captured by the string-valued fieldErrors path.
      expect((result as { fieldErrors?: unknown }).fieldErrors).toBeUndefined();
    });

    it('REQ-BIL-ASR-03 — 400 with unknown_sp_codes as an OBJECT errors envelope → unknownSpCodes populated (tolerant of object shape)', async () => {
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue({
        data: undefined,
        status: 400,
        description: 'Validation failed',
        timestamp: '',
        path: '',
        successfulRequest: false,
        // Live envelope may return `errors` as an object rather than stringified JSON.
        errorDetail: { errors: { unknown_sp_codes: ['SP09'] } as unknown as string, detail: '', description: 'Validation failed' }
      } as MainResponse<AlignmentResponse>);

      const result = await service.patchAlignment('RES-001', { has_contribution: true, sp_codes: ['SP09'] });

      expect((result as { unknownSpCodes?: string[] }).unknownSpCodes).toEqual(['SP09']);
    });

    it('REQ-BIL-ASR-03 — 400 with BOTH string-valued field errors and an unknown_sp_codes array → fieldErrors AND unknownSpCodes both surfaced (no regression)', async () => {
      const errorsJson = JSON.stringify({ has_contribution: 'must be true or false', unknown_sp_codes: ['SP04'] });
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue({
        data: undefined,
        status: 400,
        description: 'Validation failed',
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
        // string-valued path still works exactly as before…
        fieldErrors: { has_contribution: 'must be true or false' },
        // …and the array is carried separately.
        unknownSpCodes: ['SP04']
      });
    });

    it('REQ-BIL-ASR-03 — 400 whose unknown_sp_codes array has no valid string entries → no unknownSpCodes key', async () => {
      const errorsJson = JSON.stringify({ unknown_sp_codes: ['', 123, null] });
      mockApi.PATCH_PoolFundingAlignment.mockResolvedValue({
        data: undefined,
        status: 400,
        description: 'Validation failed',
        timestamp: '',
        path: '',
        successfulRequest: false,
        errorDetail: { errors: errorsJson, detail: '', description: 'Validation failed' }
      } as MainResponse<AlignmentResponse>);

      const result = await service.patchAlignment('RES-001', { has_contribution: true });

      expect((result as { unknownSpCodes?: unknown }).unknownSpCodes).toBeUndefined();
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

  // --- T-BIL-IM-04 — indicator-mapping read + modal-selection surface ---------

  describe('getHlosIndicators (T-BIL-IM-04)', () => {
    it('happy path — sets hlosIndicators, toggles loadingHlos true→false, returns the response', async () => {
      let loadingDuringCall = false;
      mockApi.GET_PoolFundingHlosIndicators.mockImplementation(() => {
        loadingDuringCall = service.loadingHlos();
        return Promise.resolve(ok<BilateralHlosIndicatorsResponse>(bilateralHlosIndicatorsResponseMock));
      });

      const result = await service.getHlosIndicators('19792');

      expect(loadingDuringCall).toBe(true);
      expect(service.loadingHlos()).toBe(false);
      expect(service.hlosIndicators()).toEqual(bilateralHlosIndicatorsResponseMock);
      expect(result).toEqual(bilateralHlosIndicatorsResponseMock);
      expect(mockApi.GET_PoolFundingHlosIndicators).toHaveBeenCalledWith('19792');
    });

    it('preserves aow_status onto the signal (real passthrough, non-"has_aow" value)', async () => {
      mockApi.GET_PoolFundingHlosIndicators.mockResolvedValue(ok<BilateralHlosIndicatorsResponse>(bilateralHlosNoAowResponseMock));

      await service.getHlosIndicators('19792');

      expect(service.hlosIndicators()?.aow_status).toBe('no_aow_mappings');
    });

    it('failure (404) — returns null and leaves the prior hlosIndicators signal untouched (no catalog fallback)', async () => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);
      mockApi.GET_PoolFundingHlosIndicators.mockResolvedValue(
        err<BilateralHlosIndicatorsResponse>(404, 'not found', undefined as unknown as BilateralHlosIndicatorsResponse)
      );

      const result = await service.getHlosIndicators('NONE');

      expect(result).toBeNull();
      expect(service.hlosIndicators()).toEqual(bilateralHlosIndicatorsResponseMock);
      expect(service.loadingHlos()).toBe(false);
    });

    it('rejection — loadingHlos resets to false (defensive try/finally)', async () => {
      mockApi.GET_PoolFundingHlosIndicators.mockRejectedValue(new Error('network down'));

      await expect(service.getHlosIndicators('19792')).rejects.toThrow('network down');

      expect(service.loadingHlos()).toBe(false);
    });
  });

  describe('indicatorRows / materializeRows (T-BIL-IM-04)', () => {
    it('empty when hlosIndicators is null', () => {
      expect(service.indicatorRows()).toEqual([]);
    });

    it('flattens nested pairs → rows (outcomes ∪ outputs), one row per indicator', () => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);

      const rows = service.indicatorRows();

      // 2 (outcome A) + 1 (output A) + 1 (outcome B) = 4
      expect(rows).toHaveLength(4);
      expect(rows.map(r => String(r.indicator_id)).sort()).toEqual(['5001', '5002', '5003', '6001']);
      const first = rows.find(r => r.indicator_id === '5001');
      expect(first).toMatchObject({
        program: 'SP01',
        area_of_work: 'AOW06',
        composite_code: 'SP01-AOW06',
        toc_result_id: 1001,
        indicator_name: 'Number of farmers adopting practice',
        is_stale: false,
        disabled_reason: null
      });
    });

    it('joins is_mapped against persistedMappings by composite key', () => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);
      service.persistedMappings.set([persistedMappingMock]);

      const rows = service.indicatorRows();
      const mapped = rows.find(r => r.indicator_id === '5001');
      const unmapped = rows.find(r => r.indicator_id === '5002');

      expect(mapped?.is_mapped).toBe(true);
      expect(unmapped?.is_mapped).toBe(false);
    });

    it('empty pairs:[] → empty rows', () => {
      service.hlosIndicators.set({ ...bilateralHlosIndicatorsResponseMock, pairs: [] });

      expect(service.indicatorRows()).toEqual([]);
    });

    it('no_aow_mappings rows carry empty area_of_work in their key', () => {
      service.hlosIndicators.set(bilateralHlosNoAowResponseMock);

      const rows = service.indicatorRows();

      expect(rows).toHaveLength(1);
      expect(rows[0].area_of_work).toBe('');
      expect(rows[0].program).toBe('SP05');
      // joining a mapping with empty AOW marks it mapped
      service.persistedMappings.set([
        { ...persistedMappingMock, lever_code: 'SP05', aow_code: '', indicator_code: '7001' }
      ]);
      expect(service.indicatorRows()[0].is_mapped).toBe(true);
    });

    it('deriveIndicatorType — OUTCOME → outcome, OUTPUT → output, unknown → outcome', () => {
      service.hlosIndicators.set({
        ...bilateralHlosIndicatorsResponseMock,
        pairs: [
          {
            program: 'SP01',
            area_of_work: 'AOW06',
            composite_code: 'SP01-AOW06',
            metadata: { total: 3, outcomes: 1, outputs: 2 },
            outcomes: [
              {
                toc_result_id: 1,
                category: 'OUTCOME',
                result_title: 'O',
                indicators: [{ indicator_id: 'a', indicator_description: 'A' }]
              }
            ],
            outputs: [
              {
                toc_result_id: 2,
                category: 'OUTPUT',
                result_title: 'P',
                indicators: [{ indicator_id: 'b', indicator_description: 'B' }]
              },
              {
                toc_result_id: 3,
                category: 'SOMETHING_ELSE',
                result_title: 'X',
                indicators: [{ indicator_id: 'c', indicator_description: 'C' }]
              }
            ]
          }
        ]
      });

      const byId = new Map(service.indicatorRows().map(r => [String(r.indicator_id), r.indicator_type]));
      expect(byId.get('a')).toBe('outcome');
      expect(byId.get('b')).toBe('output');
      expect(byId.get('c')).toBe('outcome');
    });

    it('composeTarget — string value, number value, and null', () => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);
      const rows = service.indicatorRows();

      // number value + unit
      expect(rows.find(r => r.indicator_id === '5001')?.target_description).toBe('1200 farmers');
      // string value + unit
      expect(rows.find(r => r.indicator_id === '6001')?.target_description).toBe('350 ha');
      // null value → null
      expect(rows.find(r => r.indicator_id === '5002')?.target_description).toBeNull();
    });

    it('inferQuantitative — true when a non-empty unit is present, false otherwise', () => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);
      const rows = service.indicatorRows();

      expect(rows.find(r => r.indicator_id === '5001')?.is_quantitative).toBe(true);
      expect(rows.find(r => r.indicator_id === '5002')?.is_quantitative).toBe(false);
    });
  });

  describe('modal selection lifecycle (T-BIL-IM-04)', () => {
    const seedTree = () => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);
      service.currentAlignment.set({
        result_code: '19792',
        eligible: true,
        has_pool_funding_alignment_eligible: true,
        has_contribution: true,
        selected_levers: [{ lever_code: 'SP01', lever_name: 'Science Program 01' }],
        is_synced_to_prms: false,
        is_read_only: false
      });
    };

    it('loadModalSelection — seeds hloModalSelection from pendingMappings keys', () => {
      service.pendingMappings.set([persistedMappingMock]);

      service.loadModalSelection();

      expect([...service.hloModalSelection()]).toEqual(['SP01|AOW06|5001']);
    });

    it('commitModalSelection — materializes the draft set into pendingMappings rows', () => {
      seedTree();
      service.hloModalSelection.set(new Set(['SP01|AOW06|5001']));

      service.commitModalSelection();

      const pending = service.pendingMappings();
      expect(pending).toHaveLength(1);
      expect(pending[0]).toMatchObject({
        result_code: '19792',
        lever_code: 'SP01',
        lever_name: 'Science Program 01',
        aow_code: 'AOW06',
        aow_name: 'AOW06',
        indicator_code: '5001',
        indicator_name: 'Number of farmers adopting practice',
        indicator_type: 'outcome',
        is_stale: false,
        is_quantitative: true,
        target_description: '1200 farmers',
        quantitative_contribution: null,
        reason_code: null
      });
    });

    it('cancelModalSelection — leaves pendingMappings untouched (discard semantics)', () => {
      service.pendingMappings.set([persistedMappingMock]);
      service.hloModalSelection.set(new Set()); // a different draft

      service.cancelModalSelection();

      expect(service.pendingMappings()).toEqual([persistedMappingMock]);
    });
  });

  describe('updateMappingField / removeMapping (T-BIL-IM-04)', () => {
    it('updateMappingField — patches only the matching pending mapping', () => {
      service.pendingMappings.set([
        persistedMappingMock,
        { ...persistedMappingMock, indicator_code: '5002', lever_name: 'Science Program 01' }
      ]);

      service.updateMappingField(
        { lever_code: 'SP01', aow_code: 'AOW06', indicator_code: '5001' },
        { reason_code: 'indirect' }
      );

      const list = service.pendingMappings();
      expect(list.find(m => m.indicator_code === '5001')?.reason_code).toBe('indirect');
      expect(list.find(m => m.indicator_code === '5002')?.reason_code).toBe('direct');
    });

    it('removeMapping — drops the matching pending mapping', () => {
      service.pendingMappings.set([
        persistedMappingMock,
        { ...persistedMappingMock, indicator_code: '5002' }
      ]);

      service.removeMapping({ lever_code: 'SP01', aow_code: 'AOW06', indicator_code: '5001' });

      const list = service.pendingMappings();
      expect(list).toHaveLength(1);
      expect(list[0].indicator_code).toBe('5002');
    });
  });

  describe('materializeMappings preservation + drop semantics (T-BIL-IM-04)', () => {
    beforeEach(() => {
      service.hlosIndicators.set(bilateralHlosIndicatorsResponseMock);
      service.currentAlignment.set({
        result_code: '19792',
        eligible: true,
        has_pool_funding_alignment_eligible: true,
        has_contribution: true,
        selected_levers: [{ lever_code: 'SP01', lever_name: 'Science Program 01' }],
        is_synced_to_prms: false,
        is_read_only: false
      });
    });

    it('preserves reason_code / quantitative_contribution / is_stale on surviving keys', () => {
      // an existing pending entry for 5001 carries user-entered values
      const existing: HloMapping = {
        ...persistedMappingMock,
        is_stale: true,
        quantitative_contribution: 'Major',
        reason_code: 'direct'
      };
      service.pendingMappings.set([existing]);
      // re-commit a selection that still includes 5001
      service.hloModalSelection.set(new Set(['SP01|AOW06|5001']));

      service.commitModalSelection();

      const row = service.pendingMappings().find(m => m.indicator_code === '5001');
      expect(row?.reason_code).toBe('direct');
      expect(row?.quantitative_contribution).toBe('Major');
      expect(row?.is_stale).toBe(true);
    });

    it('drops keys that do not resolve to a known catalog row', () => {
      service.hloModalSelection.set(new Set(['SP01|AOW06|5001', 'SP99|AOWX|999999']));

      service.commitModalSelection();

      const codes = service.pendingMappings().map(m => m.indicator_code);
      expect(codes).toEqual(['5001']);
    });

    it('new keys default to null reason_code / quantitative_contribution and is_stale false', () => {
      service.pendingMappings.set([]);
      service.hloModalSelection.set(new Set(['SP02|AOW02|5003']));

      service.commitModalSelection();

      const row = service.pendingMappings().find(m => m.indicator_code === '5003');
      expect(row?.reason_code).toBeNull();
      expect(row?.quantitative_contribution).toBeNull();
      expect(row?.is_stale).toBe(false);
      // lever_name falls back to lever_code when not in selected_levers (SP02 isn't)
      expect(row?.lever_name).toBe('SP02');
    });
  });
});
