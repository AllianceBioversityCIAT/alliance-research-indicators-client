import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import CapacitySharingComponent from './capacity-sharing.component';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SubmissionService } from '@shared/services/submission.service';
import { AllModalsService } from '@shared/services/cache/all-modals.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';

// Mocks
const apiService = {
  GET_CapacitySharing: jest.fn().mockResolvedValue({ data: {} }),
  PATCH_CapacitySharing: jest.fn().mockResolvedValue({ data: {} }),
  GET_SessionFormat: jest.fn().mockResolvedValue({ data: [] }),
  GET_SessionLength: jest.fn().mockResolvedValue({ data: [] }),
  GET_SessionPurpose: jest.fn().mockResolvedValue({ data: [] }),
  GET_SessionType: jest.fn().mockResolvedValue({ data: [] }),
  GET_DeliveryModality: jest.fn().mockResolvedValue({ data: [] }),
  GET_DeliveryModalities: jest.fn().mockResolvedValue({ data: [] }),
  GET_Gender: jest.fn().mockResolvedValue({ data: [] }),
  GET_Degree: jest.fn().mockResolvedValue({ data: [] }),
  GET_Institutions: jest.fn().mockResolvedValue({ data: [] }),
  GET_Countries: jest.fn().mockResolvedValue({ data: [] }),
  GET_Regions: jest.fn().mockResolvedValue({ data: [] }),
  GET_Years: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllIndicators: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllResultStatus: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllYears: jest.fn().mockResolvedValue({ data: [] }),
  GET_ClarisaLanguages: jest.fn().mockResolvedValue({ data: [] }),
  GET_Contracts: jest.fn().mockResolvedValue({ data: [] }),
  GET_GeoFocus: jest.fn().mockResolvedValue({ data: [] }),
  GET_InnovationCharacteristics: jest.fn().mockResolvedValue({ data: [] }),
  GET_InnovationDevOutput: jest.fn().mockResolvedValue({ data: [] }),
  GET_InnovationReadinessLevels: jest.fn().mockResolvedValue({ data: [] }),
  GET_InnovationTypes: jest.fn().mockResolvedValue({ data: [] }),
  GET_InnovationUseOutput: jest.fn().mockResolvedValue({ data: [] }),
  GET_InstitutionTypes: jest.fn().mockResolvedValue({ data: [] }),
  GET_UserStaff: jest.fn().mockResolvedValue({ data: [] }),
  GET_YearsByCode: jest.fn().mockResolvedValue({ data: [] }),
  GET_Languages: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllLanguages: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInstitutions: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllCountries: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllRegions: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllContracts: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllGeoFocus: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInnovationCharacteristics: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInnovationDevOutput: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInnovationReadinessLevels: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInnovationTypes: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInnovationUseOutput: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllInstitutionTypes: jest.fn().mockResolvedValue({ data: [] }),
  GET_AllUserStaff: jest.fn().mockResolvedValue({ data: [] })
};

const actions = {
  showToast: jest.fn()
};

const router = {
  navigate: jest.fn()
};

const submission = {
  isEditableStatus: jest.fn()
};

const allModalsService = {
  setPartnerRequestSection: jest.fn(),
  openModal: jest.fn()
};

const versionWatcher = {
  onVersionChange: jest.fn()
};

class CacheServiceMock {
  currentResultId = jest.fn().mockReturnValue(1);
  currentMetadata = jest.fn().mockReturnValue({ result_title: 'Test Title' });
  currentResultIsLoading = jest.fn().mockReturnValue(false);
  showSectionHeaderActions = jest.fn().mockReturnValue(false);
  isSidebarCollapsed = jest.fn().mockReturnValue(false);
  loadingCurrentResult = {
    set: jest.fn()
  };
}

// Mock de ActivatedRoute con version
const activatedRouteMock = {
  snapshot: {
    queryParamMap: {
      get: (key: string) => (key === 'version' ? 'v1' : null)
    }
  }
};

describe('CapacitySharingComponent', () => {
  let component: CapacitySharingComponent;
  let fixture: ComponentFixture<CapacitySharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacitySharingComponent, HttpClientTestingModule],
      providers: [
        { provide: ApiService, useValue: apiService },
        { provide: CacheService, useClass: CacheServiceMock },
        { provide: ActionsService, useValue: actions },
        { provide: Router, useValue: router },
        { provide: SubmissionService, useValue: submission },
        { provide: AllModalsService, useValue: allModalsService },
        { provide: VersionWatcherService, useValue: versionWatcher },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CapacitySharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getData and set body with parsed dates', async () => {
    const mockResponse = {
      data: {
        start_date: '2023-01-01T00:00:00.000Z',
        end_date: '2023-12-31T00:00:00.000Z',
        session_length_id: 1
      }
    };
    apiService.GET_CapacitySharing.mockResolvedValue(mockResponse);

    await component.getData();

    expect(apiService.GET_CapacitySharing).toHaveBeenCalled();
    expect(component.body().start_date).toBeInstanceOf(Date);
    expect(component.body().end_date).toBeInstanceOf(Date);
  });

  it('should handle getData with string dates', async () => {
    const mockResponse = {
      data: {
        start_date: '2023-01-01',
        end_date: '2023-12-31'
      }
    };
    apiService.GET_CapacitySharing.mockResolvedValue(mockResponse);

    await component.getData();

    expect(component.body().start_date).toBeInstanceOf(Date);
    expect(component.body().end_date).toBeInstanceOf(Date);
  });

  it('should handle getData with undefined dates', async () => {
    const mockResponse = {
      data: {
        start_date: undefined,
        end_date: undefined
      }
    };
    apiService.GET_CapacitySharing.mockResolvedValue(mockResponse);

    await component.getData();

    expect(component.body().start_date).toBeUndefined();
    expect(component.body().end_date).toBeUndefined();
  });

  it('should call PATCH_CapacitySharing and show toast on saveData', async () => {
    submission.isEditableStatus.mockReturnValue(true);
    apiService.PATCH_CapacitySharing.mockResolvedValue({});
    apiService.GET_CapacitySharing.mockResolvedValue({ data: {} });

    await component.saveData();

    expect(apiService.PATCH_CapacitySharing).toHaveBeenCalled();
    expect(actions.showToast).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'CapSharing Details',
      detail: 'Data saved successfully'
    });
  });

  it('should not call PATCH if not editable', async () => {
    submission.isEditableStatus.mockReturnValue(false);

    await component.saveData();

    expect(apiService.PATCH_CapacitySharing).not.toHaveBeenCalled();
    expect(actions.showToast).not.toHaveBeenCalled();
  });

  it('should navigate to next page', async () => {
    submission.isEditableStatus.mockReturnValue(true);
    apiService.PATCH_CapacitySharing.mockResolvedValue({});
    apiService.GET_CapacitySharing.mockResolvedValue({ data: {} });

    await component.saveData('next');

    expect(router.navigate).toHaveBeenCalledWith(['result', '1', 'partners'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should navigate to back page', async () => {
    submission.isEditableStatus.mockReturnValue(true);
    apiService.PATCH_CapacitySharing.mockResolvedValue({});
    apiService.GET_CapacitySharing.mockResolvedValue({ data: {} });

    await component.saveData('back');

    expect(router.navigate).toHaveBeenCalledWith(['result', '1', 'alliance-alignment'], { queryParams: { version: 'v1' }, replaceUrl: true });
  });

  it('should convert dates to ISO string before PATCH', async () => {
    submission.isEditableStatus.mockReturnValue(true);
    apiService.PATCH_CapacitySharing.mockResolvedValue({});
    apiService.GET_CapacitySharing.mockResolvedValue({ data: {} });

    component.body.set({
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31')
    });

    await component.saveData();

    expect(apiService.PATCH_CapacitySharing).toHaveBeenCalledWith(
      expect.objectContaining({
        start_date: '2023-01-01T00:00:00.000Z',
        end_date: '2023-12-31T00:00:00.000Z'
      })
    );
  });

  it('should set section and open modal', () => {
    component.setSectionAndOpenModal('test-section');

    expect(allModalsService.setPartnerRequestSection).toHaveBeenCalledWith('test-section');
    expect(allModalsService.openModal).toHaveBeenCalledWith('requestPartner');
  });

  it('should parse date to local date', () => {
    const result = component.parseToLocalDate('2023-01-01T12:00:00.000Z');

    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2023);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getDate()).toBe(1);
  });

  it('should compute isLongTermSelected correctly', () => {
    component.body.set({ session_length_id: 2 });
    expect(component.isLongTermSelected()).toBe(true);

    component.body.set({ session_length_id: 1 });
    expect(component.isLongTermSelected()).toBe(false);
  });

  it('should compute isStartDateGreaterThanEndDate correctly', () => {
    component.body.set({
      start_date: new Date('2023-12-31'),
      end_date: new Date('2023-01-01')
    });
    expect(component.isStartDateGreaterThanEndDate()).toBe(true);

    component.body.set({
      start_date: new Date('2023-01-01'),
      end_date: new Date('2023-12-31')
    });
    expect(component.isStartDateGreaterThanEndDate()).toBe(false);
  });

  it('should return false for isStartDateGreaterThanEndDate when dates are missing', () => {
    component.body.set({});
    expect(component.isStartDateGreaterThanEndDate()).toBe(false);

    component.body.set({ start_date: new Date('2023-01-01') });
    expect(component.isStartDateGreaterThanEndDate()).toBe(false);

    component.body.set({ end_date: new Date('2023-12-31') });
    expect(component.isStartDateGreaterThanEndDate()).toBe(false);
  });

  it('should call canRemove and return true if editable', () => {
    submission.isEditableStatus.mockReturnValue(true);
    expect(component.canRemove()).toBe(true);
  });

  it('should call canRemove and return false if not editable', () => {
    submission.isEditableStatus.mockReturnValue(false);
    expect(component.canRemove()).toBe(false);
  });

  it('should clear degree_id when long term is not selected', fakeAsync(() => {
    // Configurar el valor inicial antes de crear el componente
    component.body.set({ session_length_id: 2, degree_id: 5 });
    tick();

    // Cambiar a no long term
    component.body.set({ session_length_id: 1 });
    tick();

    // El effect debería limpiar degree_id
    expect(component.body().degree_id).toBeUndefined();
  }));

  it('should not clear degree_id when long term is selected', fakeAsync(() => {
    // Configurar el valor inicial antes de crear el componente
    component.body.set({ session_length_id: 1, degree_id: 5 });
    tick();

    // Cambiar a long term
    component.body.set({ session_length_id: 2, degree_id: 5 });
    tick();

    // El degree_id debería mantenerse
    expect(component.body().degree_id).toBe(5);
  }));

  it('should handle saveData without page parameter', async () => {
    submission.isEditableStatus.mockReturnValue(true);
    apiService.PATCH_CapacitySharing.mockResolvedValue({});
    apiService.GET_CapacitySharing.mockResolvedValue({ data: {} });

    await component.saveData();

    expect(apiService.PATCH_CapacitySharing).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle saveData with undefined dates in body', async () => {
    submission.isEditableStatus.mockReturnValue(true);
    apiService.PATCH_CapacitySharing.mockResolvedValue({});
    apiService.GET_CapacitySharing.mockResolvedValue({ data: {} });

    component.body.set({
      start_date: undefined,
      end_date: undefined
    });

    await component.saveData();

    expect(apiService.PATCH_CapacitySharing).toHaveBeenCalledWith(
      expect.objectContaining({
        start_date: undefined,
        end_date: undefined
      })
    );
  });
});
