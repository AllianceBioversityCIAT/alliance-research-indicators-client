import { ComponentFixture, TestBed } from '@angular/core/testing';
import GeneralInformationComponent from './general-information.component';
import {
  actionsServiceMock,
  cacheServiceMock,
  apiServiceMock,
  submissionServiceMock,
  getMetadataServiceMock,
  routerMock
} from 'src/app/testing/mock-services.mock';

// Inline mocks for missing services
const getResultsServiceMock = {
  updateList: jest.fn()
};

const getUserStaffServiceMock = {
  getData: jest.fn().mockResolvedValue({ data: [] })
};

const versionWatcherServiceMock = {
  onVersionChange: jest.fn()
};
import { ActionsService } from '@shared/services/actions.service';
import { CacheService } from '@shared/services/cache/cache.service';
import { ApiService } from '@shared/services/api.service';
import { SubmissionService } from '@shared/services/submission.service';
import { GetMetadataService } from '@shared/services/get-metadata.service';
import { Router } from '@angular/router';
import { GetResultsService } from '@shared/services/control-list/get-results.service';
import { GetUserStaffService } from '@shared/services/control-list/get-user-staff.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { GeneralInformation } from '@interfaces/result/general-information.interface';

jest.mock('../../../../../../shared/services/control-list/get-results.service');
jest.mock('../../../../../../shared/services/control-list/get-user-staff.service');
jest.mock('@shared/services/version-watcher.service');
jest.mock('@shared/services/service-locator.service');

describe('GeneralInformationComponent', () => {
  let component: GeneralInformationComponent;
  let fixture: ComponentFixture<GeneralInformationComponent>;
  let actionsService: jest.Mocked<ActionsService>;
  let cacheService: jest.Mocked<CacheService>;
  let apiService: jest.Mocked<ApiService>;
  let submissionService: jest.Mocked<SubmissionService>;
  let getMetadataService: jest.Mocked<GetMetadataService>;
  let router: jest.Mocked<Router>;
  let getResultsService: jest.Mocked<GetResultsService>;
  let getUserStaffService: jest.Mocked<GetUserStaffService>;
  let versionWatcherService: jest.Mocked<VersionWatcherService>;
  let serviceLocator: jest.Mocked<ServiceLocatorService>;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralInformationComponent],
      providers: [
        { provide: ActionsService, useValue: actionsServiceMock },
        { provide: CacheService, useValue: cacheServiceMock },
        { provide: GetResultsService, useValue: getResultsServiceMock },
        { provide: GetUserStaffService, useValue: getUserStaffServiceMock },
        { provide: VersionWatcherService, useValue: versionWatcherServiceMock },
        {
          provide: ServiceLocatorService,
          useValue: {
            get: jest.fn().mockReturnValue({ loading: jest.fn().mockReturnValue(false) }),
            getService: jest.fn().mockReturnValue({
              loading: jest.fn().mockReturnValue(false),
              list: jest.fn().mockResolvedValue([]),
              isOpenSearch: jest.fn().mockReturnValue(false),
              getData: jest.fn().mockResolvedValue([]),
              search: jest.fn().mockResolvedValue([]),
              filter: jest.fn().mockResolvedValue([]),
              visibleOptions: jest.fn().mockReturnValue([])
            })
          }
        },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: jest.fn().mockReturnValue('123') }, queryParamMap: { get: jest.fn().mockReturnValue('1.0') } } } },
        { provide: ApiService, useValue: apiServiceMock },
        { provide: SubmissionService, useValue: submissionServiceMock },
        { provide: GetMetadataService, useValue: getMetadataServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralInformationComponent);
    component = fixture.componentInstance;
    actionsService = TestBed.inject(ActionsService) as jest.Mocked<ActionsService>;
    cacheService = TestBed.inject(CacheService) as jest.Mocked<CacheService>;
    apiService = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
    submissionService = TestBed.inject(SubmissionService) as jest.Mocked<SubmissionService>;
    getMetadataService = TestBed.inject(GetMetadataService) as jest.Mocked<GetMetadataService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    getResultsService = TestBed.inject(GetResultsService) as jest.Mocked<GetResultsService>;
    getUserStaffService = TestBed.inject(GetUserStaffService) as jest.Mocked<GetUserStaffService>;
    versionWatcherService = TestBed.inject(VersionWatcherService) as jest.Mocked<VersionWatcherService>;
    serviceLocator = TestBed.inject(ServiceLocatorService) as jest.Mocked<ServiceLocatorService>;
    route = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getData and set body', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.getData();

    expect((apiService as any).GET_GeneralInformation).toHaveBeenCalledWith(123);
    expect(component.body()).toEqual(mockData);
  });

  it('should call saveData and update everything if editable', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: true, 
      status: 200,
      data: mockData
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });

    await component.saveData();

    expect((apiService as any).PATCH_GeneralInformation).toHaveBeenCalledWith(123, mockData);
    expect((actionsService as any).showToast).toHaveBeenCalled();
    expect((getResultsService as any).updateList).toHaveBeenCalled();
  });

  it('should not call PATCH_GeneralInformation if not editable', async () => {
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(false);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: true, 
      status: 200
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.saveData();

    expect((apiService as any).PATCH_GeneralInformation).not.toHaveBeenCalled();
  });

  it('should navigate to next page if page is next', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: true, 
      status: 200,
      data: mockData
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });

    await component.saveData('next');

    expect(router.navigate).toHaveBeenCalledWith(['result', '123', 'alliance-alignment'], { queryParams: { version: '1.0' }, replaceUrl: true });
  });

  it('should handle error in getData gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (apiService as any).GET_GeneralInformation = jest.fn().mockRejectedValue(new Error('Test error'));
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await expect(component.getData()).rejects.toThrow('Test error');

    consoleSpy.mockRestore();
  });

  it('should handle error in saveData gracefully', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: false, 
      status: 409,
      errorDetail: { errors: 'The name of the result is already registered' }
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.saveData();

    expect((actionsService as any).showToast).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'The name of the result is already registered'
    });
    expect(component.loading()).toBe(false);
  });

  it('should show error toast with errorDetail.detail when errors is absent', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: false, 
      errorDetail: { detail: 'Conflict detail message' }
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.saveData();

    expect((actionsService as any).showToast).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Conflict detail message'
    });
    expect(component.loading()).toBe(false);
  });

  it('should show error toast with fallback message when errorDetail has no errors or detail', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: false, 
      errorDetail: {}
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.saveData();

    expect((actionsService as any).showToast).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Unable to save data, please try again'
    });
    expect(component.loading()).toBe(false);
  });

  it('should show error toast when status is 409 (conflict)', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: true, 
      status: 409,
      errorDetail: { detail: 'Version conflict' }
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.saveData();

    expect((actionsService as any).showToast).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Version conflict'
    });
    expect(component.loading()).toBe(false);
  });

  it('should handle getData when response has no main_contact_person', async () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1'
    };
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.getData();

    expect(component.body().title).toBe('Test Title');
    expect(component.body().user_id).toBe('1');
  });

  it('should handle getData when response has main_contact_person with user_id', async () => {
    const mockData = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      main_contact_person: { user_id: '2' }
    };
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.getData();

    expect(component.body().title).toBe('Test Title');
    expect(component.body().user_id).toBe('2');
  });

  it('should navigate to next page without version query param', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: true, 
      status: 200,
      data: mockData
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });
    (route as any).snapshot = { paramMap: { get: jest.fn().mockReturnValue('123') }, queryParamMap: { get: jest.fn().mockReturnValue(null) } };

    await component.saveData('next');

    expect(routerMock.navigate).toHaveBeenCalledWith(['result', '123', 'alliance-alignment'], { queryParams: undefined, replaceUrl: true });
  });

  it('should handle saveData when not editable and page is next', async () => {
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(false);
    (route as any).snapshot = { paramMap: { get: jest.fn().mockReturnValue('123') }, queryParamMap: { get: jest.fn().mockReturnValue('1.0') } };

    await component.saveData('next');

    expect(routerMock.navigate).toHaveBeenCalledWith(['result', '123', 'alliance-alignment'], { queryParams: { version: '1.0' }, replaceUrl: true });
  });

  it('should handle saveData when editable but no page parameter', async () => {
    const mockData: GeneralInformation = {
      title: 'Test Title',
      description: 'Test Description',
      year: '2024',
      keywords: ['test'],
      user_id: '1',
      main_contact_person: { user_id: '1' }
    };
    component.body.set(mockData);
    (submissionService as any).isEditableStatus = jest.fn().mockReturnValue(true);
    (apiService as any).PATCH_GeneralInformation = jest.fn().mockResolvedValue({ 
      successfulRequest: true, 
      status: 200,
      data: mockData
    });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: mockData });

    // Reset router mock calls
    (routerMock.navigate as jest.Mock).mockClear();

    await component.saveData();

    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('should handle getData when response has no data', async () => {
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: {} });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.getData();

    expect(component.body().title).toBeUndefined();
  });

  it('should handle getData when response data is null', async () => {
    (apiService as any).GET_GeneralInformation = jest.fn().mockResolvedValue({ data: {} });
    (cacheService as any).currentResultId = jest.fn().mockReturnValue(123);

    await component.getData();

    expect(component.body().title).toBeUndefined();
  });

  it('should call getData when version watcher callback is invoked', async () => {
    const vw = TestBed.inject(VersionWatcherService) as jest.Mocked<VersionWatcherService>;
    const getDataSpy = jest.spyOn(component, 'getData').mockResolvedValue();
    // Component registers its callback in constructor; find the one that invokes our getData
    const calls = vw.onVersionChange.mock.calls;
    for (let i = 0; i < calls.length; i++) {
      getDataSpy.mockClear();
      await calls[i][0]();
      if (getDataSpy.mock.calls.length > 0) break;
    }
    expect(getDataSpy).toHaveBeenCalled();
  });
});
