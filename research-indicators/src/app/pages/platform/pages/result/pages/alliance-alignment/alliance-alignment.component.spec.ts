import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

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

class ApiServiceMock {
  GET_Alignments = jest.fn();
  PATCH_Alignments = jest.fn();
}
class CacheServiceMock {
  currentResultId = jest.fn().mockReturnValue(1);
  getCurrentNumericResultId = jest.fn().mockReturnValue(1);
  currentResultIndicatorSectionPath = jest.fn().mockReturnValue('next-section');
  currentMetadata = jest.fn().mockReturnValue({});
  currentResultIsLoading = jest.fn().mockReturnValue(false);
  showSectionHeaderActions = jest.fn().mockReturnValue(false);
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
    api = new ApiServiceMock();
    cache = new CacheServiceMock();
    actions = new ActionsServiceMock();
    router = new RouterMock();
    submission = new SubmissionServiceMock();
    route = { snapshot: { paramMap: { get: (k: string) => (k === 'id' ? '1' : null) }, queryParamMap: { get: (k: string) => (k === 'version' ? 'v1' : null) } } };
    
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
        { provide: GetContractsService, useClass: GetContractsServiceMock }
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
    
    // Set result_sdgs to ensure line 145 is covered
    component.body.set({
      contracts: [],
      result_sdgs: [{ id: 1, created_at: '2024-01-01', is_active: true, updated_at: '2024-01-01' }],
      primary_levers: [],
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

  it('should call markAsPrimary for contract', () => {
    const contract1 = { is_primary: false, is_active: true, result_contract_id: 1, result_id: 1, contract_id: '1', contract_role_id: 1 };
    const contract2 = { is_primary: true, is_active: true, result_contract_id: 2, result_id: 1, contract_id: '2', contract_role_id: 1 };
    component.body.set({ contracts: [contract1, contract2], result_sdgs: [] });
    component.markAsPrimary(contract1, 'contract');
    expect(contract1.is_primary).toBe(true);
    expect(contract2.is_primary).toBe(false);
    expect(actions.saveCurrentSection).toHaveBeenCalled();
  });

  it('should call markAsPrimary for lever', () => {
    const lever1 = { is_primary: false, is_active: true, result_contract_id: 1, result_id: 1, contract_id: '1', contract_role_id: 1 };
    component.body.set({ contracts: [lever1], result_sdgs: [] });
    component.markAsPrimary(lever1, 'lever');
    expect(lever1.is_primary).toBe(true);
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

    it('should map result_sdgs correctly', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });
      
      component.body.set({ 
        contracts: [], 
        result_sdgs: [
          { id: 1, created_at: '2024-01-01', is_active: true, updated_at: '2024-01-01' }
        ],
        primary_levers: [],
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
    it('should map result_sdgs with clarisa_sdg_id', async () => {
      api.GET_Alignments.mockResolvedValue({
        data: {
          contracts: [],
          result_sdgs: [
            { clarisa_sdg_id: 1, name: 'SDG 1' },
            { clarisa_sdg_id: 2, name: 'SDG 2' }
          ],
          primary_levers: [],
          contributor_levers: []
        }
      });
      
      await component.getData();
      
      expect(component.body().result_sdgs[0].sdg_id).toBe(1);
      expect(component.body().result_sdgs[0].is_primary).toBe(false);
      expect(component.body().result_sdgs[1].sdg_id).toBe(2);
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

  });

  describe('saveData result_sdgs mapping', () => {
    it('should map result_sdgs with all properties', async () => {
      api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
      api.GET_Alignments.mockResolvedValue({ data: { contracts: [], result_sdgs: [] } });
      
      component.body.set({
        contracts: [],
        result_sdgs: [
          { 
            id: 5, 
            created_at: '2024-01-01', 
            is_active: true, 
            updated_at: '2024-01-02',
            sdg_id: 5,
            is_primary: false
          }
        ],
        primary_levers: [],
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
        result_sdgs: [
          { id: 1, created_at: '2024-01-01', is_active: true, updated_at: '2024-01-01' },
          { id: 2, created_at: '2024-01-02', is_active: true, updated_at: '2024-01-02' }
        ],
        primary_levers: [],
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
});
