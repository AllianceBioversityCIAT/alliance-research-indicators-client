import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
    route = { snapshot: { queryParamMap: { get: (k: string) => (k === 'version' ? 'v1' : null) } } };
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

  it('should call PATCH_Alignments and show toast on saveData', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: { contracts: [{ id: 1 }] } });
    jest.spyOn(component, 'getData');
    await component.saveData();
    expect(api.PATCH_Alignments).toHaveBeenCalledWith(1, expect.anything());
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
    api.GET_Alignments.mockResolvedValue({ data: {} });
    await component.saveData('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'general-information'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should navigate to next page', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: {} });
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'next-section'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should use version in queryParams if present', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: {} });
    route.snapshot.queryParamMap.get = (key: string) => (key === 'version' ? 'v1' : null);
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'next-section'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should not use version in queryParams if not present', async () => {
    api.PATCH_Alignments.mockResolvedValue({ successfulRequest: true });
    api.GET_Alignments.mockResolvedValue({ data: {} });
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
    component.body.set({ contracts: [contract1, contract2] });
    component.markAsPrimary(contract1, 'contract');
    expect(contract1.is_primary).toBe(true);
    expect(contract2.is_primary).toBe(false);
    expect(actions.saveCurrentSection).toHaveBeenCalled();
  });

  it('should call markAsPrimary for lever', () => {
    const lever1 = { is_primary: false, is_active: true, result_contract_id: 1, result_id: 1, contract_id: '1', contract_role_id: 1 };
    component.body.set({ contracts: [lever1] });
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
});
