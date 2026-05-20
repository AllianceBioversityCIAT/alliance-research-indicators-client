import { TestBed } from '@angular/core/testing';
import { BilateralService } from './bilateral.service';
import { ApiService } from './api.service';
import { FindContracts, FindContractsResponse } from '@shared/interfaces/find-contracts.interface';
import { MainResponse } from '@shared/interfaces/responses.interface';
import { PoolFundingTagPatchResponse } from '@interfaces/bilateral/agresso-contract.interface';

describe('BilateralService', () => {
  let service: BilateralService;
  let mockApi: { GET_FindContracts: jest.Mock; PATCH_PoolFundingTag: jest.Mock };

  beforeEach(() => {
    mockApi = {
      GET_FindContracts: jest.fn(),
      PATCH_PoolFundingTag: jest.fn()
    };
    TestBed.configureTestingModule({
      providers: [BilateralService, { provide: ApiService, useValue: mockApi }]
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
});
