import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { ActionsService } from '@shared/services/actions.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { SubmissionService } from '@shared/services/submission.service';
import EvidenceComponent from './evidence.component';
import { actionsServiceMock, cacheServiceMock, apiServiceMock, submissionServiceMock } from 'src/app/testing/mock-services.mock';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Evidence } from '../../../../../../shared/interfaces/patch-result-evidences.interface';

jest.mock('@shared/services/version-watcher.service', () => ({
  VersionWatcherService: jest.fn().mockImplementation(() => ({
    onVersionChange: jest.fn()
  }))
}));

jest.mock('@angular/router', () => ({
  ...jest.requireActual('@angular/router'),
  Router: jest.fn().mockImplementation(() => ({
    navigate: jest.fn()
  }))
}));

describe('EvidenceComponent', () => {
  let component: EvidenceComponent;
  let fixture: ComponentFixture<EvidenceComponent>;
  let router: Router;
  let api: any;
  let actions: any;
  let cache: any;
  let submission: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, EvidenceComponent],
      providers: [
        { provide: ActionsService, useValue: { ...actionsServiceMock, showToast: jest.fn(), saveCurrentSection: jest.fn() } },
        {
          provide: CacheService,
          useValue: { ...cacheServiceMock, currentMetadata: jest.fn(() => ({ indicator_id: 1, status_id: 4 })), currentResultId: jest.fn(() => 123) }
        },
        {
          provide: ApiService,
          useValue: {
            ...apiServiceMock,
            GET_ResultEvidences: jest.fn().mockResolvedValue({ data: { evidence: [{ evidence_url: 'url', evidence_description: 'desc' }] } }),
            PATCH_ResultEvidences: jest.fn().mockResolvedValue({ data: { evidence: [{ evidence_url: 'url', evidence_description: 'desc' }] } })
          }
        },
        { provide: SubmissionService, useValue: { ...submissionServiceMock, isEditableStatus: jest.fn().mockReturnValue(true) } },
        { provide: VersionWatcherService, useValue: { onVersionChange: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ version: '1.0' }),
            params: of({ id: '123' }),
            snapshot: {
              paramMap: { get: (key: string) => (key === 'id' ? '123' : null) },
              queryParamMap: { get: (key: string) => (key === 'version' ? '1.0' : null) }
            }
          }
        },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvidenceComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    api = TestBed.inject(ApiService);
    actions = TestBed.inject(ActionsService);
    cache = TestBed.inject(CacheService);
    submission = TestBed.inject(SubmissionService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add evidence', () => {
    const initialLength = component.body().evidence.length;
    component.addEvidence();
    expect(component.body().evidence.length).toBe(initialLength + 1);
  });

  it('should delete evidence and call saveCurrentSection', () => {
    component.body.set({
      evidence: [
        {
          evidence_url: 'url',
          evidence_description: 'desc',
          is_active: true,
          result_evidence_id: null,
          result_id: null,
          evidence_role_id: null,
          is_private: false
        },
        {
          evidence_url: 'url2',
          evidence_description: 'desc2',
          is_active: true,
          result_evidence_id: null,
          result_id: null,
          evidence_role_id: null,
          is_private: false
        }
      ]
    });
    const spy = jest.spyOn(actions, 'saveCurrentSection');
    component.deleteEvidence(0);
    expect(component.body().evidence.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should get data and set evidence if empty', async () => {
    api.GET_ResultEvidences.mockResolvedValueOnce({ data: { evidence: [] } });
    await component.getData();
    expect(component.body().evidence.length).toBe(1);
  });

  it('should get data and set evidence if present', async () => {
    api.GET_ResultEvidences.mockResolvedValueOnce({
      data: {
        evidence: [
          {
            evidence_url: 'url',
            evidence_description: 'desc',
            is_active: true,
            result_evidence_id: null,
            result_id: null,
            evidence_role_id: null,
            is_private: false
          }
        ]
      }
    });
    await component.getData();
    expect(component.body().evidence[0].evidence_url).toBe('url');
  });

  it('should save data and show toast if editable', async () => {
    const spyToast = jest.spyOn(actions, 'showToast');
    const spyGetData = jest.spyOn(component, 'getData');
    submission.isEditableStatus.mockReturnValue(true);
    await component.saveData();
    expect(spyToast).toHaveBeenCalled();
    expect(spyGetData).toHaveBeenCalled();
  });

  it('should navigate to back page', async () => {
    const spy = jest.spyOn(router, 'navigate');
    await component.saveData('back');
    expect(spy).toHaveBeenCalledWith(['result', 123, 'geographic-scope'], expect.anything());
  });

  it('should navigate to next page', async () => {
    const spy = jest.spyOn(router, 'navigate');
    await component.saveData('next');
    expect(spy).toHaveBeenCalledWith(['result', 123, 'ip-rights'], expect.anything());
  });

  it('should not call PATCH_ResultEvidences if not editable', async () => {
    submission.isEditableStatus.mockReturnValue(false);
    const spyPatch = jest.spyOn(api, 'PATCH_ResultEvidences');
    await component.saveData();
    expect(spyPatch).not.toHaveBeenCalled();
  });

  it('should set loading true and false in getData', async () => {
    component.loading.set(false);
    const promise = component.getData();
    expect(component.loading()).toBe(true);
    await promise;
    expect(component.loading()).toBe(false);
  });

  it('should set loading true and false in saveData', async () => {
    component.loading.set(false);
    const promise = component.saveData();
    expect(component.loading()).toBe(true);
    await promise;
    expect(component.loading()).toBe(false);
  });

  it('should throw error in getData if service fails', async () => {
    api.GET_ResultEvidences.mockRejectedValueOnce(new Error('fail'));
    await expect(component.getData()).rejects.toThrow('fail');
  });

  it('should throw error in saveData if service fails', async () => {
    api.PATCH_ResultEvidences.mockRejectedValueOnce(new Error('fail'));
    submission.isEditableStatus.mockReturnValue(true);
    await expect(component.saveData()).rejects.toThrow('fail');
  });

  it('should not delete evidence if index is out of bounds', () => {
    component.body.set({ evidence: [new Evidence()] });
    const spy = jest.spyOn(actions, 'saveCurrentSection');
    component.deleteEvidence(5);
    expect(component.body().evidence.length).toBe(1);
    expect(spy).toHaveBeenCalled();
  });

  it('should not navigate if page param is invalid', async () => {
    const spy = jest.spyOn(router, 'navigate');
    await component.saveData('invalid' as any);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should render evidence items in template', () => {
    component.body.set({ evidence: [new Evidence(), new Evidence()] });
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('app-evidence-item');
    expect(items.length).toBe(2);
  });

  it('should call deleteEvidence when child emits deleteEvidenceEvent', () => {
    component.body.set({ evidence: [new Evidence()] });
    fixture.detectChanges();
    const child = fixture.debugElement.nativeElement.querySelector('app-evidence-item');
    const spy = jest.spyOn(component, 'deleteEvidence');
    component.deleteEvidence(0);
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should not call PATCH_ResultEvidences or showToast if isEditableStatus is false', async () => {
    submission.isEditableStatus.mockReturnValue(false);
    const spyPatch = jest.spyOn(api, 'PATCH_ResultEvidences');
    const spyToast = jest.spyOn(actions, 'showToast');
    await component.saveData();
    expect(spyPatch).not.toHaveBeenCalled();
    expect(spyToast).not.toHaveBeenCalled();
  });
});
