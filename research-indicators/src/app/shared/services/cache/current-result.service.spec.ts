import { TestBed } from '@angular/core/testing';
import { CurrentResultService } from './current-result.service';
import { ApiService } from '../api.service';
import { AllModalsService } from './all-modals.service';
import { CacheService } from './cache.service';
import { CreateResultManagementService } from '../../components/all-modals/modals-content/create-result-modal/services/create-result-management.service';

describe('CurrentResultService', () => {
  let service: CurrentResultService;

  const mockApi: Partial<ApiService> = {
    GET_OICRModal: jest.fn()
  };

  const signalMock = () => ({ set: jest.fn() });

  const mockAllModals: Partial<AllModalsService> = {
    openModal: jest.fn()
  };

  const mockCreateResultManagement: Partial<CreateResultManagementService> = {
    currentRequestedResultCode: signalMock() as unknown as CreateResultManagementService['currentRequestedResultCode'],
    editingOicr: signalMock() as unknown as CreateResultManagementService['editingOicr'],
    createOicrBody: signalMock() as unknown as CreateResultManagementService['createOicrBody'],
    resultPageStep: signalMock() as unknown as CreateResultManagementService['resultPageStep'],
    modalTitle: signalMock() as unknown as CreateResultManagementService['modalTitle'],
    contractId: signalMock() as unknown as CreateResultManagementService['contractId'],
    resultTitle: signalMock() as unknown as CreateResultManagementService['resultTitle']
  };

  const mockCache: Partial<CacheService> = {
    currentResultId: signalMock() as unknown as CacheService['currentResultId']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        CurrentResultService,
        { provide: ApiService, useValue: mockApi },
        { provide: AllModalsService, useValue: mockAllModals },
        { provide: CacheService, useValue: mockCache },
        { provide: CreateResultManagementService, useValue: mockCreateResultManagement }
      ]
    });
    service = TestBed.inject(CurrentResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('validateOpenResult should return true when indicatorId is 5', () => {
    expect(service.validateOpenResult(5, 1)).toBe(true);
  });

  it('validateOpenResult should return true when resultStatusId is 9', () => {
    expect(service.validateOpenResult(1, 9)).toBe(true);
  });

  it('validateOpenResult should return false otherwise', () => {
    expect(service.validateOpenResult(1, 1)).toBe(false);
  });

  it('openEditRequestdOicrsModal should short-circuit and return false when validation fails', async () => {
    const result = await service.openEditRequestdOicrsModal(1, 1, 123);
    expect(result).toBe(false);
    expect(mockApi.GET_OICRModal).not.toHaveBeenCalled();
    expect(mockAllModals.openModal).not.toHaveBeenCalled();
    expect((mockCreateResultManagement.currentRequestedResultCode as any).set).not.toHaveBeenCalled();
    expect((mockCache.currentResultId as any).set).not.toHaveBeenCalled();
  });

  it('openEditRequestdOicrsModal should load data, set signals and return true with defaulted comment', async () => {
    const responseData = {
      step_three: { comment_geo_scope: undefined },
      base_information: { contract_id: 'C-1', title: 'TITLE-1' }
    };
    (mockApi.GET_OICRModal as jest.Mock).mockResolvedValueOnce({ data: responseData });

    const ok = await service.openEditRequestdOicrsModal(5, 1, 456);

    expect(ok).toBe(true);
    expect(mockApi.GET_OICRModal).toHaveBeenCalledWith(456);
    expect((mockCreateResultManagement.currentRequestedResultCode as any).set).toHaveBeenCalledWith(456);
    expect((mockCreateResultManagement.editingOicr as any).set).toHaveBeenCalledWith(true);
    const createOicrSetArg = (mockCreateResultManagement.createOicrBody as any).set.mock.calls[0][0];
    expect(createOicrSetArg.step_three.comment_geo_scope).toBe('');
    expect(mockAllModals.openModal).toHaveBeenCalledWith('createResult');
    expect((mockCreateResultManagement.resultPageStep as any).set).toHaveBeenCalledWith(2);
    expect((mockCreateResultManagement.modalTitle as any).set).toHaveBeenCalledWith('Outcome Impact Case Report (OICR)');
    expect((mockCreateResultManagement.contractId as any).set).toHaveBeenCalledWith('C-1');
    expect((mockCreateResultManagement.resultTitle as any).set).toHaveBeenCalledWith('TITLE-1');
    expect((mockCache.currentResultId as any).set).toHaveBeenCalledWith(456);
  });

  it('openEditRequestdOicrsModal should preserve existing comment_geo_scope', async () => {
    const responseData = {
      step_three: { comment_geo_scope: 'existing' },
      base_information: { contract_id: 'C-2', title: 'TITLE-2' }
    };
    (mockApi.GET_OICRModal as jest.Mock).mockResolvedValueOnce({ data: responseData });

    const ok = await service.openEditRequestdOicrsModal(5, 1, 789);

    expect(ok).toBe(true);
    const setArg = (mockCreateResultManagement.createOicrBody as any).set.mock.calls[0][0];
    expect(setArg.step_three.comment_geo_scope).toBe('existing');
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { CurrentResultService } from './current-result.service';

describe('CurrentResultService', () => {
  let service: CurrentResultService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CurrentResultService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
