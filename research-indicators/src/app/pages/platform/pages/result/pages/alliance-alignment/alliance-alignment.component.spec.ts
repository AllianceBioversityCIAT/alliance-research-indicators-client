import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import AllianceAlignmentComponent from './alliance-alignment.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { Router } from '@angular/router';
import { SubmissionService } from '@shared/services/submission.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { GetContractsService } from '@services/control-list/get-contracts.service';
import { GetLeversService } from '@services/control-list/get-levers.service';

class ApiServiceMock {
  GET_Alignments = jest.fn();
  PATCH_Alignments = jest.fn();
}
class CacheServiceMock {
  metadata = signal<Record<string, unknown>>({});
  currentResultId = jest.fn().mockReturnValue(1);
  getCurrentNumericResultId = jest.fn().mockReturnValue(1);
  currentResultIndicatorSectionPath = jest.fn().mockReturnValue('next-section');
  currentMetadata() {
    return this.metadata();
  }
  currentResultIsLoading = jest.fn().mockReturnValue(false);
  showSectionHeaderActions = jest.fn().mockReturnValue(false);
  hasSmallScreen = jest.fn().mockReturnValue(false);
  isSidebarCollapsed = jest.fn().mockReturnValue(false);
}
class ActionsServiceMock {
  showToast = jest.fn();
  saveCurrentSection = jest.fn();
}
class RouterMock {
  navigate = jest.fn();
}
class SubmissionServiceMock {
  isEditableStatus = jest.fn().mockReturnValue(true);
}
class VersionWatcherServiceMock {
  onVersionChange = jest.fn();
}
class GetContractsServiceMock {
  list = jest.fn().mockReturnValue([]);
  loading = jest.fn().mockReturnValue(false);
  isOpenSearch = jest.fn().mockReturnValue(false);
}

let getLeversServiceMock: {
  list: ReturnType<typeof signal<any[]>>;
  loading: ReturnType<typeof signal<boolean>>;
  isOpenSearch: ReturnType<typeof signal<boolean>>;
  main: jest.Mock;
  update: jest.Mock;
};

describe('AllianceAlignmentComponent', () => {
  let component: AllianceAlignmentComponent;
  let fixture: ComponentFixture<AllianceAlignmentComponent>;
  let api: ApiServiceMock;
  let cache: CacheServiceMock;
  let actions: ActionsServiceMock;
  let router: RouterMock;
  let submission: SubmissionServiceMock;
  let route: any;

  beforeEach(async () => {
    getLeversServiceMock = {
      list: signal<any[]>([]),
      loading: signal(false),
      isOpenSearch: signal(false),
      main: jest.fn().mockResolvedValue(undefined),
      update: jest.fn()
    };
    api = new ApiServiceMock();
    cache = new CacheServiceMock();
    actions = new ActionsServiceMock();
    router = new RouterMock();
    submission = new SubmissionServiceMock();
    route = {
      snapshot: {
        paramMap: { get: (k: string) => (k === 'id' ? '1' : null) },
        queryParamMap: { get: (k: string) => (k === 'version' ? 'v1' : null) }
      }
    };

    // Mock GET_Alignments before component creation to avoid constructor error
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] } });

    await TestBed.configureTestingModule({
      imports: [AllianceAlignmentComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: api },
        { provide: CacheService, useValue: cache },
        { provide: ActionsService, useValue: actions },
        { provide: Router, useValue: router },
        { provide: SubmissionService, useValue: submission },
        { provide: VersionWatcherService, useClass: VersionWatcherServiceMock },
        { provide: ActivatedRoute, useValue: route },
        { provide: GetContractsService, useClass: GetContractsServiceMock },
        { provide: GetLeversService, useValue: getLeversServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AllianceAlignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getData and set body', async () => {
    api.GET_Alignments.mockResolvedValue({
      data: { contracts: [{ is_primary: false, is_active: true, result_contract_id: 1, result_id: 1, contract_id: '1', contract_role_id: 1 }] }
    });
    await component.getData();
    expect(api.GET_Alignments).toHaveBeenCalledWith(1);
    expect(component.body().contracts[0].contract_id).toBe('1');
  });

  it('should handle getData with empty response', async () => {
    api.GET_Alignments.mockResolvedValue({ data: {} });
    await component.getData();
    expect(component.body()).toEqual({
      contracts: [],
      result_sdgs: [],
      primary_levers: [],
      contributor_levers: []
    });
  });

  it('should call PATCH_Alignments and show toast on saveData', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [{ id: 1 }] } });
    jest.spyOn(component, 'getData');

    component.body.set({
      contracts: [],
      result_sdgs: [],
      primary_levers: [
        {
          lever_id: 1,
          result_lever_id: 1,
          result_id: 1,
          lever_role_id: 1,
          is_primary: true,
          result_lever_sdgs: [{ id: 1, created_at: '2024-01-01', is_active: true, updated_at: '2024-01-01', clarisa_sdg_id: 1 } as any]
        }
      ],
      contributor_levers: []
    });

    await component.saveData();
    expect(api.PATCH_Alignments).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        contracts: expect.any(Array),
        result_sdgs: expect.any(Array)
      })
    );
    expect(actions.showToast).toHaveBeenCalled();
    expect(component.getData).toHaveBeenCalled();
  });

  it('should not call showToast or getData if PATCH_Alignments fails', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: false });
    jest.spyOn(component, 'getData');
    await component.saveData();
    expect(actions.showToast).not.toHaveBeenCalled();
    expect(component.getData).not.toHaveBeenCalled();
  });

  it('should navigate to back page', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });
    await component.saveData('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'general-information'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should navigate to next page', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'next-section'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should use version in queryParams if present', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });
    route.snapshot.queryParamMap.get = (key: string) => (key === 'version' ? 'v1' : null);
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'next-section'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should not use version in queryParams if not present', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });
    route.snapshot.queryParamMap.get = () => null;
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'next-section'], { queryParams: undefined, replaceUrl: true });
  });

  it('should not PATCH if not editable', async () => {
    submission.isEditableStatus.mockReturnValue(false);
    await component.saveData();
    expect(api.PATCH_Alignments).not.toHaveBeenCalled();
  });

  it('should navigate to next when not editable and saveData("next") (cover line 194)', async () => {
    submission.isEditableStatus.mockReturnValue(false);
    await component.saveData('next');
    expect(api.PATCH_Alignments).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'next-section'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should call markAsPrimary for contract', () => {
    const contract1 = { is_primary: false, is_active: true, result_contract_id: 1, result_id: 1, contract_id: '1', contract_role_id: 1 };
    const contract2 = { is_primary: true, is_active: true, result_contract_id: 2, result_id: 1, contract_id: '2', contract_role_id: 1 };
    component.body.set({ contracts: [contract1, contract2], result_sdgs: [], primary_levers: [], contributor_levers: [] });
    component.markAsPrimary(contract1, 'contract');
    const updatedContracts = component.body().contracts;
    expect(updatedContracts.find(c => c.contract_id === '1')?.is_primary).toBe(true);
    expect(updatedContracts.find(c => c.contract_id === '2')?.is_primary).toBe(false);
    expect(actions.saveCurrentSection).toHaveBeenCalled();
  });

  it('should call markAsPrimary for lever', () => {
    const lever1 = { is_primary: false, lever_id: 1, result_lever_strategic_outcomes: [] };
    component.body.set({ contracts: [], result_sdgs: [], primary_levers: [lever1], contributor_levers: [] });
    component.markAsPrimary(lever1, 'lever');
    const updatedLevers = component.body().primary_levers;
    expect(updatedLevers.find(l => l.lever_id === 1)?.is_primary).toBe(true);
    expect(actions.saveCurrentSection).toHaveBeenCalled();
  });

  it('should toggle lever to non-primary when already primary', () => {
    const lever1 = { is_primary: true, lever_id: 1, result_lever_strategic_outcomes: [] };
    component.body.set({ contracts: [], result_sdgs: [], primary_levers: [lever1], contributor_levers: [] });
    component.markAsPrimary(lever1, 'lever');
    const updatedLevers = component.body().primary_levers;
    expect(updatedLevers.find(l => l.lever_id === 1)?.is_primary).toBe(false);
  });

  it('should set non-target levers to is_primary false when marking one lever', () => {
    const lever1 = { is_primary: false, lever_id: 10, result_lever_strategic_outcomes: [] };
    const lever2 = { is_primary: true, lever_id: 20, result_lever_strategic_outcomes: [] };
    component.body.set({ contracts: [], result_sdgs: [], primary_levers: [lever1, lever2], contributor_levers: [] });
    component.markAsPrimary(lever1, 'lever');
    const updatedLevers = component.body().primary_levers;
    expect(updatedLevers.find(l => l.lever_id === 10)?.is_primary).toBe(true);
    expect(updatedLevers.find(l => l.lever_id === 20)?.is_primary).toBe(false);
  });

  it('should update optionsDisabled and primary_levers when body has primary_levers and contributor_levers', () => {
    const primaryLevers = [{ lever_id: 1, is_primary: true }];
    const contributorLevers = [{ lever_id: 2, is_primary: false }];
    component.body.set({
      contracts: [],
      result_sdgs: [],
      primary_levers: primaryLevers,
      contributor_levers: contributorLevers
    });
    fixture.detectChanges();
    expect(component.optionsDisabled()).toEqual(primaryLevers);
    expect(component.primaryOptionsDisabled()).toEqual(contributorLevers);
  });

  it('should call markAsPrimary for sdg', () => {
    const sdg1 = { sdg_id: 1, is_primary: false } as any;
    const sdg2 = { sdg_id: 2, is_primary: true } as any;
    component.body.set({
      contracts: [],
      result_sdgs: [sdg1, sdg2],
      primary_levers: [],
      contributor_levers: []
    });
    component.markAsPrimary(sdg1, 'sdg');
    const updatedSdgs = component.body().result_sdgs;
    const withSdgId = (sdg: any) => (sdg as { sdg_id?: number }).sdg_id;
    expect(updatedSdgs.find(s => withSdgId(s) === 1)).toBeDefined();
    expect((updatedSdgs.find(s => withSdgId(s) === 1) as any).is_primary).toBe(true);
    expect((updatedSdgs.find(s => withSdgId(s) === 2) as any).is_primary).toBe(false);
    expect(actions.saveCurrentSection).toHaveBeenCalled();
  });

  it('should leave body unchanged when markAsPrimary is called with unknown type', () => {
    const prev = { contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] };
    component.body.set(prev);
    component.markAsPrimary({ is_primary: false }, 'unknown' as 'contract');
    expect(component.body()).toBe(prev);
    expect(actions.saveCurrentSection).toHaveBeenCalled();
  });

  it('should call canRemove and return true if editable', () => {
    submission.isEditableStatus.mockReturnValue(true);
    expect(component.canRemove()).toBe(true);
  });

  it('should call canRemove and return false if not editable', () => {
    submission.isEditableStatus.mockReturnValue(false);
    expect(component.canRemove()).toBe(false);
  });

  describe('saveData with lever outcomes', () => {
    it('should normalize outcomes when value is a number', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: [5] as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes[0]).toEqual({ lever_strategic_outcome_id: 5 });
    });

    it('should normalize outcomes when value is an object with lever_strategic_outcome_id', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: [{ lever_strategic_outcome_id: 10 }] as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes[0]).toEqual({ lever_strategic_outcome_id: 10 });
    });

    it('should normalize outcomes when value is an object with id', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: [{ id: 15 }] as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes[0]).toEqual({ id: 15, lever_strategic_outcome_id: 15 });
    });

    it('should normalize outcomes when value is invalid', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: [null] as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes[0]).toEqual({ lever_strategic_outcome_id: 0 });
    });

    it('should handle array of outcomes', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: [1, 2, 3] as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes).toHaveLength(3);
    });

    it('should handle single number outcome', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: 7 as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes).toHaveLength(1);
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes[0]).toEqual({ lever_strategic_outcome_id: 7 });
    });

    it('should handle single object outcome', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 1, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const signal = component.getLeverSignal(lever);
      signal.set({ result_lever_strategic_outcomes: { lever_strategic_outcome_id: 20 } as any });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes).toHaveLength(1);
      expect(callArgs[1].primary_levers[0].result_lever_strategic_outcomes[0]).toEqual({ lever_strategic_outcome_id: 20 });
    });

    it('should handle lever without signal', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      const lever = { lever_id: 999, result_lever_strategic_outcomes: [] };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].primary_levers[0]).toEqual(lever);
    });

    it('should map result_sdgs correctly from lever selections', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [
          {
            lever_id: 1,
            result_lever_id: 1,
            result_id: 1,
            lever_role_id: 1,
            is_primary: true,
            result_lever_sdgs: [{ id: 1, created_at: '2024-01-01', is_active: true, updated_at: '2024-01-01', clarisa_sdg_id: 1 } as any]
          }
        ],
        contributor_levers: []
      });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].result_sdgs[0]).toEqual({
        created_at: '2024-01-01',
        is_active: true,
        updated_at: '2024-01-01',
        clarisa_sdg_id: 1,
        result_id: 1
      });
    });
  });

  describe('getShortDescription', () => {
    beforeEach(() => {
      component.containerRef = { nativeElement: { offsetWidth: 1000 } } as any;
    });

    it('should return full description when shorter than max for small screen', () => {
      component.containerWidth = 800;
      const description = 'Short text';
      expect(component.getShortDescription(description)).toBe('Short text');
    });

    it('should truncate description for small screen (< 900)', () => {
      component.containerWidth = 800;
      const description = 'a'.repeat(100);
      const result = component.getShortDescription(description);
      expect(result.length).toBe(76); // 73 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate description for medium screen (900-1100)', () => {
      component.containerWidth = 1000;
      const description = 'a'.repeat(120);
      const result = component.getShortDescription(description);
      expect(result.length).toBe(108); // 105 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate description for large screen (1100-1240)', () => {
      component.containerWidth = 1150;
      const description = 'a'.repeat(150);
      const result = component.getShortDescription(description);
      expect(result.length).toBe(138); // 135 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate description for extra large screen (>= 1240)', () => {
      component.containerWidth = 1300;
      const description = 'a'.repeat(170);
      const result = component.getShortDescription(description);
      expect(result.length).toBe(158); // 155 + '...'
      expect(result.endsWith('...')).toBe(true);
    });

    it('should return full description when shorter than max for extra large screen', () => {
      component.containerWidth = 1300;
      const description = 'Short text';
      expect(component.getShortDescription(description)).toBe('Short text');
    });
  });

  describe('getLeverName', () => {
    it('should return lever name with string id', () => {
      expect(component.getLeverName('1')).toBe('Lever 1');
    });

    it('should return lever name with number id', () => {
      expect(component.getLeverName(2)).toBe('Lever 2');
    });
  });

  describe('getLeverSdgSignal', () => {
    it('should return existing signal if already created', () => {
      const lever = { lever_id: 1, result_lever_sdgs: [{ id: 1 } as any] };
      const signal1 = component.getLeverSdgSignal(lever as any);
      const signal2 = component.getLeverSdgSignal(lever as any);
      expect(signal1).toBe(signal2);
    });

    it('should create new signal with sdgs from lever', () => {
      const lever = { lever_id: 2, result_lever_sdgs: [{ id: 2, clarisa_sdg_id: 2 } as any] };
      const s = component.getLeverSdgSignal(lever as any);
      expect(s().result_lever_sdgs).toEqual([{ id: 2, clarisa_sdg_id: 2 }]);
    });
  });

  describe('getLeverSignal', () => {
    it('should return existing signal if already created', () => {
      const lever = { lever_id: 1, result_lever_strategic_outcomes: [{ lever_strategic_outcome_id: 1 }] };
      const signal1 = component.getLeverSignal(lever);
      const signal2 = component.getLeverSignal(lever);
      expect(signal1).toBe(signal2);
    });

    it('should create new signal if not exists', () => {
      const lever = { lever_id: 2, result_lever_strategic_outcomes: [{ lever_strategic_outcome_id: 2 }] };
      const signal = component.getLeverSignal(lever);
      expect(signal().result_lever_strategic_outcomes).toEqual([{ lever_strategic_outcome_id: 2 }]);
    });

    it('should create signal with empty array if outcomes are missing', () => {
      const lever = { lever_id: 3 };
      const signal = component.getLeverSignal(lever);
      expect(signal().result_lever_strategic_outcomes).toEqual([]);
    });
  });

  describe('getData', () => {
    it('should migrate legacy flat result_sdgs onto a single primary lever', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [
            { clarisa_sdg_id: 1, id: 1, created_at: '', updated_at: '', is_active: true },
            { clarisa_sdg_id: 2, id: 2, created_at: '', updated_at: '', is_active: true }
          ],
          primary_levers: [
            {
              lever_id: 10,
              result_lever_id: 1,
              result_id: 1,
              lever_role_id: 1,
              is_primary: true
            }
          ],
          contributor_levers: []
        }
      });

      await component.getData();

      expect(component.body().result_sdgs).toEqual([]);
      expect(component.body().primary_levers[0].result_lever_sdgs?.[0].sdg_id).toBe(1);
      expect(component.body().primary_levers[0].result_lever_sdgs?.[1].sdg_id).toBe(2);
    });

    it('should handle missing result_sdgs', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          primary_levers: [],
          contributor_levers: []
        }
      });

      await component.getData();

      expect(component.body().result_sdgs).toEqual([]);
    });
  });

  describe('constructor', () => {
    it('should register version change watcher', () => {
      const versionWatcher = TestBed.inject(VersionWatcherService);
      expect(versionWatcher.onVersionChange).toHaveBeenCalled();
    });

    it('should call getData on version change', async () => {
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] } });
      const versionWatcher = TestBed.inject(VersionWatcherService);
      const getDataSpy = jest.spyOn(component, 'getData').mockResolvedValue();

      // Get the callback that was registered
      const callback = (versionWatcher.onVersionChange as jest.Mock).mock.calls[0][0];
      await callback();

      expect(getDataSpy).toHaveBeenCalled();
    });
  });

  describe('effects', () => {
    it('should update optionsDisabled when primary_levers change', fakeAsync(() => {
      const primaryLever = { lever_id: 1, name: 'Lever 1' };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [primaryLever],
        contributor_levers: []
      });

      tick();
      flush();
      fixture.detectChanges();

      const disabled = component.optionsDisabled();
      expect(disabled).toEqual([primaryLever]);
    }));

    it('should set optionsDisabled from primary_levers when truthy (cover line 89-90)', fakeAsync(() => {
      const levers = [{ lever_id: 1, name: 'L1' }];
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: levers as any,
        contributor_levers: []
      });
      fixture.detectChanges();
      tick();
      flush();
      expect(component.optionsDisabled()).toEqual(levers);
    }));

    it('should set optionsDisabled to empty array when primary_levers is falsy (cover || [] branch line 89)', fakeAsync(() => {
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: undefined as any,
        contributor_levers: []
      });
      tick(0);
      TestBed.flushEffects();
      expect(component.optionsDisabled()).toEqual([]);
    }));

    it('getPrimaryLeversForOptions should return [] when primary_levers is undefined (cover || [] branch)', () => {
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: undefined as any,
        contributor_levers: []
      });
      expect(component.getPrimaryLeversForOptions()).toEqual([]);
    });

    it('should update primaryOptionsDisabled when contributor_levers change', fakeAsync(() => {
      const contributorLever = { lever_id: 2, name: 'Lever 2' };
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: [contributorLever]
      });

      tick();
      flush();
      fixture.detectChanges();

      const disabled = component.primaryOptionsDisabled();
      expect(disabled).toEqual([contributorLever]);
    }));

    it('should set primaryOptionsDisabled from contributor_levers when truthy (cover line 96-97)', fakeAsync(() => {
      const levers = [{ lever_id: 2, name: 'L2' }];
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: levers as any
      });
      fixture.detectChanges();
      tick();
      flush();
      expect(component.primaryOptionsDisabled()).toEqual(levers);
    }));

    it('should set primaryOptionsDisabled to empty array when contributor_levers is falsy (cover || [] branch line 97)', fakeAsync(() => {
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: undefined as any
      });
      tick(0);
      TestBed.flushEffects();
      expect(component.primaryOptionsDisabled()).toEqual([]);
    }));

    it('getContributorLeversForOptions should return [] when contributor_levers is undefined (cover || [] branch)', () => {
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: undefined as any
      });
      expect(component.getContributorLeversForOptions()).toEqual([]);
    });
  });

  describe('saveData result_sdgs mapping', () => {
    it('should map result_sdgs with all properties', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [
          {
            lever_id: 1,
            result_lever_id: 1,
            result_id: 1,
            lever_role_id: 1,
            is_primary: true,
            result_lever_sdgs: [
              {
                id: 5,
                clarisa_sdg_id: 5,
                created_at: '2024-01-01',
                is_active: true,
                updated_at: '2024-01-02'
              } as any
            ]
          }
        ],
        contributor_levers: []
      });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].result_sdgs[0]).toEqual({
        created_at: '2024-01-01',
        is_active: true,
        updated_at: '2024-01-02',
        clarisa_sdg_id: 5,
        result_id: 1
      });
    });

    it('should map result_sdgs when array exists', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [
          {
            lever_id: 1,
            result_lever_id: 1,
            result_id: 1,
            lever_role_id: 1,
            is_primary: true,
            result_lever_sdgs: [
              { id: 1, created_at: '2024-01-01', is_active: true, updated_at: '2024-01-01', clarisa_sdg_id: 1 } as any,
              { id: 2, created_at: '2024-01-02', is_active: true, updated_at: '2024-01-02', clarisa_sdg_id: 2 } as any
            ]
          }
        ],
        contributor_levers: []
      });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].result_sdgs).toHaveLength(2);
      expect(callArgs[1].result_sdgs[0].clarisa_sdg_id).toBe(1);
      expect(callArgs[1].result_sdgs[1].clarisa_sdg_id).toBe(2);
    });

    it('should handle result_sdgs as undefined', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });

      component.body.set({
        contracts: [],
        result_sdgs: undefined as any,
        primary_levers: [],
        contributor_levers: []
      });

      await component.saveData();

      expect(api.PATCH_Alignments).toHaveBeenCalled();
      const callArgs = api.PATCH_Alignments.mock.calls[0];
      expect(callArgs[1].result_sdgs).toEqual([]);
    });
  });

  describe('contractServiceParams', () => {
    it('should set exclude-pooled-funding to false when indicator_id is 5', () => {
      cache.metadata.set({ indicator_id: 5 });
      expect(component.contractServiceParams()['exclude-pooled-funding']).toBe(false);
    });

    it('should set exclude-pooled-funding to true when indicator_id is not 5', () => {
      cache.metadata.set({ indicator_id: 4 });
      expect(component.contractServiceParams()['exclude-pooled-funding']).toBe(true);
    });
  });

  describe('getRequiredLeverIdsFromContracts', () => {
    it('should collect unique lever ids only from primary contributing contracts', () => {
      const ids = component.getRequiredLeverIdsFromContracts([
        null,
        { is_primary: false, lever_id: 999 },
        { is_primary: true, levers: [{ id: 1, full_name: 'Not available' }] },
        { is_primary: true, levers: [{ lever_id: 2, full_name: 'OK', short_name: 's' }] },
        { is_primary: true, lever_id: 3 },
        { is_primary: true, lever_id: 3 }
      ]);
      expect(ids).toEqual([2, 3]);
    });

    it('should return empty array for undefined contracts', () => {
      expect(component.getRequiredLeverIdsFromContracts(undefined)).toEqual([]);
    });

    it('should skip contracts where nested lever has no resolvable id', () => {
      expect(component.getRequiredLeverIdsFromContracts([{ is_primary: true, levers: [{}] }])).toEqual([]);
    });

    it('should ignore levers on non-primary contracts', () => {
      expect(
        component.getRequiredLeverIdsFromContracts([
          { is_primary: false, lever_id: 50 },
          { is_primary: true, lever_id: 7 }
        ])
      ).toEqual([7]);
    });
  });

  describe('isLeverRequiredFromContributingProject', () => {
    it('should return true when lever id matches the primary contributing contract lever', () => {
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 7 }],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: []
      });
      expect(component.isLeverRequiredFromContributingProject({ lever_id: 7 } as any)).toBe(true);
    });

    it('should return false when no match', () => {
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 7 }],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: []
      });
      expect(component.isLeverRequiredFromContributingProject({ lever_id: 99 } as any)).toBe(false);
    });

    it('should return false when lever is only on a non-primary contract', () => {
      component.body.set({
        contracts: [
          { is_primary: true, lever_id: 1 },
          { is_primary: false, lever_id: 50 }
        ],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: []
      });
      expect(component.isLeverRequiredFromContributingProject({ lever_id: 50 } as any)).toBe(false);
    });
  });

  describe('removePrimaryLever / removeContributorLever', () => {
    const lever = {
      lever_id: 42,
      result_lever_id: 1,
      result_id: 1,
      lever_role_id: 1,
      is_primary: true,
      short_name: 'X',
      other_names: '',
      result_lever_sdgs: [],
      result_lever_sdg_targets: [],
      result_lever_strategic_outcomes: []
    } as any;

    it('should remove primary lever when editable and not required', () => {
      submission.isEditableStatus.mockReturnValue(true);
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });
      component.getLeverSignal(lever);
      component.getLeverSdgSignal(lever);

      component.removePrimaryLever(lever);

      expect(component.body().primary_levers).toEqual([]);
      expect(actions.saveCurrentSection).toHaveBeenCalled();
    });

    it('should not remove primary when not editable', () => {
      submission.isEditableStatus.mockReturnValue(false);
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });
      component.removePrimaryLever(lever);
      expect(component.body().primary_levers).toHaveLength(1);
    });

    it('should not remove primary when lever is required by primary contract', () => {
      submission.isEditableStatus.mockReturnValue(true);
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 42 }],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });
      component.removePrimaryLever(lever);
      expect(component.body().primary_levers).toHaveLength(1);
    });

    it('should remove contributor lever when editable', () => {
      submission.isEditableStatus.mockReturnValue(true);
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: [lever]
      });
      component.removeContributorLever(lever);
      expect(component.body().contributor_levers).toEqual([]);
      expect(actions.saveCurrentSection).toHaveBeenCalled();
    });

    it('should not remove contributor when not editable', () => {
      submission.isEditableStatus.mockReturnValue(false);
      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: [lever]
      });
      component.removeContributorLever(lever);
      expect(component.body().contributor_levers).toHaveLength(1);
    });
  });

  describe('syncContractLeversToPrimaryEffect and lever resolution', () => {
    it('sync effect merges required levers into primary_levers', () => {
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 88 }],
        result_sdgs: [],
        primary_levers: [],
        contributor_levers: []
      });
      fixture.detectChanges();
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component.body().primary_levers.some(l => String(l.lever_id) === '88')).toBe(true);
    });

    it('findCatalogLever returns matching catalog row', () => {
      getLeversServiceMock.list.set([{ lever_id: 77, id: 77, short_name: 'Cat', other_names: 'o' } as any]);
      expect((component as any).findCatalogLever(77)?.short_name).toBe('Cat');
    });

    it('findCatalogLever matches catalog row by id when lever_id is absent', () => {
      getLeversServiceMock.list.set([{ id: 82, short_name: 'ById', other_names: '' } as any]);
      expect((component as any).findCatalogLever(82)?.short_name).toBe('ById');
    });

    it('findCatalogLever uses empty array when list() is undefined', () => {
      const svc = (component as any).getLeversService;
      const prev = svc.list;
      svc.list = () => undefined as any;
      expect((component as any).findCatalogLever(1)).toBeUndefined();
      svc.list = prev;
    });

    it('leverFromCatalog maps catalog entry to Lever', () => {
      const lever = (component as any).leverFromCatalog({
        lever_id: 9,
        id: 9,
        short_name: 'S',
        other_names: 'o'
      });
      expect(lever.lever_id).toBe(9);
      expect(lever.short_name).toBe('S');
    });

    it('leverFromContractNested maps nested contract fields', () => {
      const lever = (component as any).leverFromContractNested(
        { short_name: 'Sn', other_names: 'on', lever_url: 'http://x' },
        66
      );
      expect(lever.lever_id).toBe(66);
      expect(lever.short_name).toBe('Sn');
    });

    it('findNestedLeverShape returns nested lever object', () => {
      const contracts = [
        { levers: [{ id: 66, full_name: 'N', short_name: 'Sn', other_names: 'on', lever_url: 'http://x' }] }
      ];
      expect((component as any).findNestedLeverShape(contracts, 66)?.short_name).toBe('Sn');
    });

    it('resolveLeverForPrimary returns existing primary when present', () => {
      const existing = { lever_id: 5, short_name: 'Keep' } as any;
      expect((component as any).resolveLeverForPrimary(5, [existing], [])).toBe(existing);
    });

    it('resolveLeverForPrimary prefers catalog over nested contract', () => {
      getLeversServiceMock.list.set([{ lever_id: 77, id: 77, short_name: 'Cat', other_names: 'o' } as any]);
      const contracts = [{ is_primary: true, lever_id: 77 }];
      const lever = (component as any).resolveLeverForPrimary(77, [], contracts);
      expect(lever.short_name).toBe('Cat');
    });

    it('resolveLeverForPrimary uses nested contract when catalog misses', () => {
      getLeversServiceMock.list.set([]);
      const contracts = [
        {
          is_primary: true,
          levers: [{ id: 66, full_name: 'N', short_name: 'Sn', other_names: 'on', lever_url: 'http://x' }]
        }
      ];
      const lever = (component as any).resolveLeverForPrimary(66, [], contracts);
      expect(lever.short_name).toBe('Sn');
    });

    it('resolveLeverForPrimary falls back to minimal stub', () => {
      const lever = (component as any).resolveLeverForPrimary(999, [], []);
      expect(lever.lever_id).toBe(999);
      expect(lever.result_lever_sdgs).toEqual([]);
    });

    it('computeMergedPrimaryLevers combines required and optional primaries', () => {
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 10 }],
        result_sdgs: [],
        primary_levers: [{ lever_id: 20, short_name: 'Opt' } as any],
        contributor_levers: []
      });
      const merged = (component as any).computeMergedPrimaryLevers();
      expect(merged.map((l: any) => l.lever_id)).toEqual([10, 20]);
    });

    it('samePrimaryLeverSequence returns true for identical id order', () => {
      const a = [{ lever_id: 1 }, { lever_id: 2 }] as any[];
      expect((component as any).samePrimaryLeverSequence(a, [{ lever_id: 1 }, { lever_id: 2 }])).toBe(true);
      expect((component as any).samePrimaryLeverSequence(a, [{ lever_id: 2 }, { lever_id: 1 }])).toBe(false);
    });
  });

  describe('getData normalization', () => {
    it('should normalize SDG targets from numbers and mixed object shapes', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [],
          primary_levers: [
            {
              lever_id: 1,
              result_lever_sdg_targets: [3, { sdg_target_id: 4 }, { id: '5' }, { id: 'bad' }, null] as any
            }
          ],
          contributor_levers: []
        }
      });
      await component.getData();
      const targets = component.body().primary_levers[0].result_lever_sdg_targets ?? [];
      expect(targets.map(t => t.sdg_target_id)).toEqual([3, 4, 5]);
    });

    it('should migrate legacy result_sdgs onto a single contributor lever', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [{ clarisa_sdg_id: 9, id: 9, created_at: '', updated_at: '', is_active: true }],
          primary_levers: [],
          contributor_levers: [{ lever_id: 20, result_lever_id: 1, result_id: 1, lever_role_id: 1, is_primary: false }]
        }
      });
      await component.getData();
      expect(component.body().contributor_levers[0].result_lever_sdgs?.[0].sdg_id).toBe(9);
    });
  });

  describe('saveData with SDG signal merge', () => {
    it('should merge leverSdgSignals targets into payload', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] } });

      const lever = {
        lever_id: 11,
        result_lever_id: 1,
        result_id: 1,
        lever_role_id: 1,
        is_primary: true,
        result_lever_sdgs: [{ id: 1, clarisa_sdg_id: 1 } as any],
        result_lever_sdg_targets: []
      } as any;

      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const sdgSig = component.getLeverSdgSignal(lever);
      sdgSig.set({
        result_lever_sdgs: [],
        result_lever_sdg_targets: [{ sdg_target_id: 21 }, { sdg_target_id: 0 }, { sdg_target_id: NaN } as any]
      });

      await component.saveData();

      const payload = api.PATCH_Alignments.mock.calls[0][1];
      expect(payload.primary_levers[0].result_lever_sdg_targets).toEqual([{ sdg_target_id: 21 }]);
      expect(payload.primary_levers[0].result_lever_sdgs).toEqual([]);
    });

    it('treats undefined result_lever_sdg_targets as empty when merging', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] } });

      const lever = {
        lever_id: 12,
        result_lever_id: 1,
        result_id: 1,
        lever_role_id: 1,
        is_primary: true,
        result_lever_sdgs: [],
        result_lever_sdg_targets: []
      } as any;

      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [lever],
        contributor_levers: []
      });

      const sdgSig = component.getLeverSdgSignal(lever);
      sdgSig.set({ result_lever_sdgs: [], result_lever_sdg_targets: undefined as any });

      await component.saveData();

      expect(api.PATCH_Alignments.mock.calls[0][1].primary_levers[0].result_lever_sdg_targets).toEqual([]);
    });
  });

  describe('additional branch coverage', () => {
    it('skips legacy root SDG migration when any lever already has SDGs', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [{ clarisa_sdg_id: 1, id: 1, created_at: '', updated_at: '', is_active: true }],
          primary_levers: [
            {
              lever_id: 10,
              result_lever_sdgs: [{ id: 2, clarisa_sdg_id: 2, created_at: '', updated_at: '', is_active: true } as any]
            }
          ],
          contributor_levers: []
        }
      });
      await component.getData();
      expect(component.body().primary_levers[0].result_lever_sdgs?.[0].sdg_id).toBe(2);
    });

    it('maps result_sdgs payload using clarisa_sdg_id when id is absent', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [], primary_levers: [], contributor_levers: [] } });

      component.body.set({
        contracts: [],
        result_sdgs: [],
        primary_levers: [
          {
            lever_id: 1,
            result_lever_id: 1,
            result_id: 1,
            lever_role_id: 1,
            is_primary: true,
            result_lever_sdgs: [{ clarisa_sdg_id: 42, created_at: 'a', is_active: true, updated_at: 'b' } as any]
          }
        ],
        contributor_levers: []
      });

      await component.saveData();

      const sent = api.PATCH_Alignments.mock.calls[0][1].result_sdgs[0];
      expect(sent.clarisa_sdg_id).toBe(42);
    });

    it('getLeverSdgSignal uses empty arrays when lever omits sdg fields', () => {
      const lever = { lever_id: 55 } as any;
      const s = component.getLeverSdgSignal(lever);
      expect(s().result_lever_sdgs).toEqual([]);
      expect(s().result_lever_sdg_targets).toEqual([]);
    });

    it('sync effect skips body.update when merged sequence matches current', () => {
      const updateSpy = jest.spyOn(component.body, 'update');
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 1 }],
        result_sdgs: [],
        primary_levers: [{ lever_id: 1, result_lever_strategic_outcomes: [] } as any],
        contributor_levers: []
      });
      fixture.detectChanges();
      TestBed.flushEffects();
      expect(updateSpy).not.toHaveBeenCalled();
    });

    it('samePrimaryLeverSequence is false when lever ids differ at same index', () => {
      expect(
        (component as any).samePrimaryLeverSequence([{ lever_id: 1 }, { lever_id: 2 }] as any, [{ lever_id: 1 }, { lever_id: 9 }] as any)
      ).toBe(false);
    });

    it('normalizeSdgs picks clarisa_sdg_id when sdg_id missing in getData', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [],
          primary_levers: [
            {
              lever_id: 1,
              result_lever_sdgs: [{ clarisa_sdg_id: 8, id: 8, created_at: '', updated_at: '', is_active: true } as any]
            }
          ],
          contributor_levers: []
        }
      });
      await component.getData();
      expect(component.body().primary_levers[0].result_lever_sdgs?.[0].sdg_id).toBe(8);
    });

    it('normalizeSdgs uses id when sdg_id and clarisa are absent', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [],
          primary_levers: [
            {
              lever_id: 1,
              result_lever_sdgs: [{ id: 99, created_at: '', updated_at: '', is_active: true } as any]
            }
          ],
          contributor_levers: []
        }
      });
      await component.getData();
      expect(component.body().primary_levers[0].result_lever_sdgs?.[0].sdg_id).toBe(99);
    });

    it('computeMergedPrimaryLevers treats missing contracts and primary arrays as empty', () => {
      component.body.set({
        contracts: undefined as any,
        result_sdgs: [],
        primary_levers: undefined as any,
        contributor_levers: []
      });
      const merged = (component as any).computeMergedPrimaryLevers();
      expect(Array.isArray(merged)).toBe(true);
    });

    it('sync effect handles undefined primary_levers on body', () => {
      component.body.set({
        contracts: [{ is_primary: true, lever_id: 3 }],
        result_sdgs: [],
        primary_levers: undefined as any,
        contributor_levers: []
      });
      fixture.detectChanges();
      TestBed.flushEffects();
      expect(component.body().primary_levers?.length).toBeGreaterThan(0);
    });

    it('leverFromCatalog uses id when lever_id is missing', () => {
      const lever = (component as any).leverFromCatalog({ id: 4, short_name: 'Z', other_names: 'oz' } as any);
      expect(lever.lever_id).toBe(4);
    });

    it('anyLeverHasSdgs handles null result_lever_sdgs on a lever', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [],
          primary_levers: [{ lever_id: 1, result_lever_sdgs: null as any }],
          contributor_levers: []
        }
      });
      await component.getData();
      expect(component.body().primary_levers[0].result_lever_sdgs).toEqual([]);
    });

    it('findNestedLeverShape skips contracts until leverId matches', () => {
      const contracts = [{ lever_id: 1 }, { levers: [{ id: 2, full_name: 'N', short_name: 'Second' }] }];
      expect((component as any).findNestedLeverShape(contracts, 2)?.short_name).toBe('Second');
    });

    it('findNestedLeverShape returns undefined when no nested lever matches', () => {
      expect((component as any).findNestedLeverShape([{ lever_id: 9 }], 2)).toBeUndefined();
    });

    it('findNestedLeverShape returns on first contract when it matches', () => {
      const contracts = [{ levers: [{ id: 3, full_name: 'Y', short_name: 'First' }] }];
      expect((component as any).findNestedLeverShape(contracts, 3)?.short_name).toBe('First');
    });
  });
});
