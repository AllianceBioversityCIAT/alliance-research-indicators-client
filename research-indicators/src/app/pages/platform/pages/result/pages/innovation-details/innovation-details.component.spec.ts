import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../../../shared/services/api.service';
import { CacheService } from '../../../../../../shared/services/cache/cache.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';
import { SubmissionService } from '@shared/services/submission.service';
import { VersionWatcherService } from '@shared/services/version-watcher.service';
import { GetInnovationReadinessLevelsService } from '@shared/services/control-list/get-innovation-readiness-levels.service';
import InnovationDetailsComponent from './innovation-details.component';
import { Actor, InstitutionType } from '@shared/interfaces/get-innovation-details.interface';
import { ServiceLocatorService } from '@shared/services/service-locator.service';
import { GetInnovationCharacteristicsService } from '@shared/services/control-list/get-innovation-characteristics.service';
import { GetInnovationTypesService } from '@shared/services/control-list/get-innovation-types.service';
import { GetAnticipatedUsersService } from '@shared/services/short-control-list/get-anticipated-users.service';
import { GetActorTypesService } from '@shared/services/control-list/get-actor-types.service';
import { GetInstitutionTypesService } from '@shared/services/control-list/get-institution-types.service';
import { UtilsService } from '@shared/services/utils.service';

// Mocks
class ApiServiceMock {
  GET_InnovationDetails = jest.fn().mockReturnValue(
    Promise.resolve({
      data: {
        short_title: 'Test',
        innovation_nature_id: 1,
        innovation_type_id: 2,
        innovation_readiness_id: 3,
        anticipated_users_id: 2,
        expected_outcome: 'Outcome',
        intended_beneficiaries_description: 'Desc',
        actors: [new Actor()],
        institution_types: [new InstitutionType()]
      }
    })
  );
  PATCH_InnovationDetails = jest.fn().mockReturnValue(Promise.resolve({ successfulRequest: true }));
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
  saveCurrentSection = jest.fn();
  showToast = jest.fn();
}
class SubmissionServiceMock {
  isEditableStatus = jest.fn().mockReturnValue(true);
}
class VersionWatcherServiceMock {
  onVersionChange = jest.fn();
}
class GetInnovationReadinessLevelsServiceMock {
  list = jest.fn().mockReturnValue([
    { id: 3, level: 1, name: 'Level 1', definition: 'Def 1' },
    { id: 4, level: 2, name: 'Level 2', definition: 'Def 2' }
  ]);
}

class GetInnovationCharacteristicsServiceMock {
  list = jest.fn().mockReturnValue([]);
  loading = jest.fn().mockReturnValue(false);
  isOpenSearch = jest.fn().mockReturnValue(false);
  currentResultIsLoading = jest.fn().mockReturnValue(false);
}
class GetInnovationTypesServiceMock {
  list = jest.fn().mockReturnValue([]);
  loading = jest.fn().mockReturnValue(false);
  isOpenSearch = jest.fn().mockReturnValue(false);
  currentResultIsLoading = jest.fn().mockReturnValue(false);
}
class GetAnticipatedUsersServiceMock {
  list = jest.fn().mockReturnValue([
    { name: 'This is yet to be determined', value: 1 },
    { name: 'User have been determined', value: 2 }
  ]);
  loading = jest.fn().mockReturnValue(false);
  currentResultIsLoading = jest.fn().mockReturnValue(false);
}
class GetActorTypesServiceMock {
  list = jest.fn().mockReturnValue([]);
  loading = jest.fn().mockReturnValue(false);
  isOpenSearch = jest.fn().mockReturnValue(false);
  currentResultIsLoading = jest.fn().mockReturnValue(false);
}
class GetInstitutionTypesServiceMock {
  list = jest.fn().mockReturnValue([]);
  loading = jest.fn().mockReturnValue(false);
  isOpenSearch = jest.fn().mockReturnValue(false);
  currentResultIsLoading = jest.fn().mockReturnValue(false);
}
class UtilsServiceMock {
  getNestedProperty = jest.fn();
  setNestedPropertyWithReduceSignal = jest.fn();
  setNestedPropertyWithReduce = jest.fn();
  getNestedPropertySignal = jest.fn();
}

class ServiceLocatorServiceMock {
  getService(serviceName: string) {
    switch (serviceName) {
      case 'innovationCharacteristics':
        return new GetInnovationCharacteristicsServiceMock();
      case 'innovationTypes':
        return new GetInnovationTypesServiceMock();
      case 'anticipatedUsers':
        return new GetAnticipatedUsersServiceMock();
      case 'actorTypes':
        return new GetActorTypesServiceMock();
      case 'institutionTypes':
        return new GetInstitutionTypesServiceMock();
      default:
        return { list: jest.fn().mockReturnValue([]), loading: { set: jest.fn() }, isOpenSearch: jest.fn().mockReturnValue(false) };
    }
  }
}

const routerSpy = { navigate: jest.fn() };
const activatedRouteMock = {
  snapshot: {
    paramMap: { get: (key: string) => (key === 'id' ? '1' : null) },
    queryParamMap: {
      get: (key: string) => (key === 'version' ? 'v1' : null)
    }
  }
};

describe('InnovationDetailsComponent', () => {
  let component: InnovationDetailsComponent;
  let fixture: ComponentFixture<InnovationDetailsComponent>;
  let apiService: ApiServiceMock;
  let cache: CacheServiceMock;
  let actions: ActionsServiceMock;
  let submission: SubmissionServiceMock;
  let router: any;
  let getInnovationReadinessLevelsService: GetInnovationReadinessLevelsServiceMock;
  let serviceLocator: ServiceLocatorServiceMock;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InnovationDetailsComponent],
      providers: [
        { provide: ApiService, useClass: ApiServiceMock },
        { provide: CacheService, useClass: CacheServiceMock },
        { provide: ActionsService, useClass: ActionsServiceMock },
        { provide: SubmissionService, useClass: SubmissionServiceMock },
        { provide: VersionWatcherService, useClass: VersionWatcherServiceMock },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: GetInnovationReadinessLevelsService, useClass: GetInnovationReadinessLevelsServiceMock },
        { provide: ServiceLocatorService, useClass: ServiceLocatorServiceMock },
        { provide: GetInnovationCharacteristicsService, useClass: GetInnovationCharacteristicsServiceMock },
        { provide: GetInnovationTypesService, useClass: GetInnovationTypesServiceMock },
        { provide: GetAnticipatedUsersService, useClass: GetAnticipatedUsersServiceMock },
        { provide: GetActorTypesService, useClass: GetActorTypesServiceMock },
        { provide: GetInstitutionTypesService, useClass: GetInstitutionTypesServiceMock },
        { provide: UtilsService, useClass: UtilsServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InnovationDetailsComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as any;
    cache = TestBed.inject(CacheService) as any;
    actions = TestBed.inject(ActionsService) as any;
    submission = TestBed.inject(SubmissionService) as any;
    router = TestBed.inject(Router) as any;
    getInnovationReadinessLevelsService = TestBed.inject(GetInnovationReadinessLevelsService) as any;
    serviceLocator = TestBed.inject(ServiceLocatorService) as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get data and set body', fakeAsync(async () => {
    await component.getData();
    expect(apiService.GET_InnovationDetails).toHaveBeenCalled();
    expect(component.body().short_title).toBe('Test');
    expect(component.selectedStep()).toBe(1);
  }));

  it('should add and delete actor', () => {
    component.body.set({ ...component.body(), actors: [] });
    component.addActor();
    expect(component.body().actors.length).toBe(1);
    component.deleteActor(0);
    expect(component.body().actors.length).toBe(0);
  });

  it('should add and delete institution type', () => {
    component.body.set({ ...component.body(), institution_types: [] });
    component.addInstitutionType();
    expect(component.body().institution_types.length).toBe(1);
    component.deleteInstitutionType(0);
    expect(component.body().institution_types.length).toBe(0);
  });

  it('should return stepNumbers and stepLevels', () => {
    expect(component.stepNumbers).toEqual([1, 2]);
    expect(component.stepLevels.length).toBe(2);
  });

  it('should get selectedLevel', () => {
    component.selectedStep.set(2);
    expect(component.selectedLevel).toEqual({ id: 4, level: 2, name: 'Level 2', definition: 'Def 2' });
  });

  it('should get step tooltip', () => {
    const tooltip = component.getStepTooltip(1);
    expect(tooltip).toContain('Level 1');
  });

  it('should select step and update body', () => {
    component.selectStep(2);
    expect(component.selectedStep()).toBe(2);
    expect(component.body().innovation_readiness_id).toBe(4);
  });

  it('should scroll to anticipated section on change', fakeAsync(() => {
    const scrollIntoViewMock = jest.fn();
    jest.spyOn(document, 'getElementById').mockReturnValue({ scrollIntoView: scrollIntoViewMock } as any);
    component.body.set({ ...component.body(), anticipated_users_id: 2 });
    component.onAnticipatedUsersChange();
    tick(100);
    expect(document.getElementById).toHaveBeenCalledWith('anticipated-section');
    expect(scrollIntoViewMock).toHaveBeenCalled();
  }));

  it('should save data and navigate next', fakeAsync(async () => {
    apiService.PATCH_InnovationDetails.mockReturnValue(Promise.resolve({ successfulRequest: true }));
    jest.spyOn(component, 'getData').mockReturnValue(Promise.resolve());
    await component.saveData('next');
    expect(apiService.PATCH_InnovationDetails).toHaveBeenCalled();
    expect(actions.showToast).toHaveBeenCalled();
    // Navigation happens when editable, so it should be called here
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'partners'], { queryParams: { version: 'v1' }, replaceUrl: true });
  }));

  it('should save data and navigate back', fakeAsync(async () => {
    apiService.PATCH_InnovationDetails.mockReturnValue(Promise.resolve({ successfulRequest: true }));
    jest.spyOn(component, 'getData').mockReturnValue(Promise.resolve());
    await component.saveData('back');
    // Navigation happens when editable, so it should be called here
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'alliance-alignment'], { queryParams: { version: 'v1' }, replaceUrl: true });
  }));

  it('should not PATCH if not editable', fakeAsync(async () => {
    submission.isEditableStatus.mockReturnValue(false);
    await component.saveData();
    expect(apiService.PATCH_InnovationDetails).not.toHaveBeenCalled();
  }));

  it('should navigate when not editable', fakeAsync(async () => {
    submission.isEditableStatus.mockReturnValue(false);
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'partners'], { queryParams: { version: 'v1' }, replaceUrl: true });
  }));

  it('should navigate back when not editable', fakeAsync(async () => {
    submission.isEditableStatus.mockReturnValue(false);
    await component.saveData('back');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'alliance-alignment'], { queryParams: { version: 'v1' }, replaceUrl: true });
  }));

  it('canRemove should return true if editable', () => {
    submission.isEditableStatus.mockReturnValue(true);
    expect(component.canRemove()).toBeTruthy();
    submission.isEditableStatus.mockReturnValue(false);
    expect(component.canRemove()).toBeFalsy();
  });

  it('should not show toast or call getData if PATCH is not successful', fakeAsync(async () => {
    apiService.PATCH_InnovationDetails.mockReturnValue(Promise.resolve({ successfulRequest: false }));
    jest.spyOn(component, 'getData').mockReturnValue(Promise.resolve());
    await component.saveData('next');
    expect(actions.showToast).not.toHaveBeenCalled();
    expect(component.getData).not.toHaveBeenCalled();
  }));

  it('should do nothing if anticipated_users_id is not 2', () => {
    component.body.set({ ...component.body(), anticipated_users_id: 1 });
    // No error should occur, nothing to assert
    component.onAnticipatedUsersChange();
  });

  it('should not throw if getElementById returns null', fakeAsync(() => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);
    component.body.set({ ...component.body(), anticipated_users_id: 2 });
    component.onAnticipatedUsersChange();
    tick(100);
    // No error should occur
  }));

  it('should set default value for new_or_improved_varieties_count when is_new_or_improved_variety is true and count is null', () => {
    component.body.set({
      ...component.body(),
      is_new_or_improved_variety: 1,
      new_or_improved_varieties_count: undefined
    });
    component.onNewOrImprovedVarietyChange();
    expect(component.body().new_or_improved_varieties_count).toBe(1);
  });

  it('should not set default value when is_new_or_improved_variety is false', () => {
    component.body.set({
      ...component.body(),
      is_new_or_improved_variety: 0,
      new_or_improved_varieties_count: undefined
    });
    component.onNewOrImprovedVarietyChange();
    expect(component.body().new_or_improved_varieties_count).toBe(undefined);
  });

  it('should not set default value when new_or_improved_varieties_count already has a value', () => {
    component.body.set({
      ...component.body(),
      is_new_or_improved_variety: 1,
      new_or_improved_varieties_count: 5
    });
    component.onNewOrImprovedVarietyChange();
    expect(component.body().new_or_improved_varieties_count).toBe(5);
  });

  it('should return empty string if getStepTooltip level does not exist', () => {
    expect(component.getStepTooltip(999)).toBe('');
  });

  it('should not update body if selectStep level does not exist', () => {
    const prev = component.body().innovation_readiness_id;
    component.selectStep(999);
    expect(component.body().innovation_readiness_id).toBe(prev);
  });

  it('should set default institution_types and actors if empty in getData', fakeAsync(async () => {
    apiService.GET_InnovationDetails.mockReturnValue(Promise.resolve({ data: { actors: [], institution_types: [] } }));
    await component.getData();
    expect(component.body().actors.length).toBe(1);
    expect(component.body().institution_types.length).toBe(1);
  }));

  it('should pass version as queryParam if present', fakeAsync(async () => {
    submission.isEditableStatus.mockReturnValue(false);
    jest.spyOn(component, 'getData').mockReturnValue(Promise.resolve());
    await component.saveData('next');
    expect(router.navigate).toHaveBeenCalledWith(['result', 1, 'partners'], { queryParams: { version: 'v1' }, replaceUrl: true });
  }));
});
