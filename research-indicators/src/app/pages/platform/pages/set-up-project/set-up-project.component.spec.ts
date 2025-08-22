import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

import SetUpProjectComponent from './set-up-project.component';
import { SetUpProjectService } from './set-up-project.service';
import { ActionsService } from '../../../../shared/services/actions.service';
import { CacheService } from '../../../../shared/services/cache/cache.service';
import { ProjectUtilsService } from '../../../../shared/services/project-utils.service';
import { ApiService } from '../../../../shared/services/api.service';
import { ProjectItemComponent } from '../../../../shared/components/project-item/project-item.component';
import { CustomTagComponent } from '../../../../shared/components/custom-tag/custom-tag.component';

describe('SetUpProjectComponent', () => {
  let component: SetUpProjectComponent;
  let fixture: ComponentFixture<SetUpProjectComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;
  let mockActionsService: Partial<ActionsService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;
  let mockCacheService: Partial<CacheService>;
  let mockProjectUtilsService: Partial<ProjectUtilsService>;
  let mockApiService: Partial<ApiService>;

  beforeEach(async () => {
    const assignIndicatorsModalSignal = signal({ show: false, targetLevel1: undefined, targetLevel2: undefined });

    mockSetUpProjectService = {
      structures: signal([]),
      showCreateStructure: signal(false),
      manageIndicatorModal: signal({ show: false }),
      showAllIndicators: signal(false),
      editingElementId: signal(null),
      assignIndicatorsModal: assignIndicatorsModalSignal,
      indicatorList: signal([]),
      loadingStructures: signal(false),
      currentAgreementId: signal(null),
      routeid: signal('test-project-id'),
      getStructures: jest.fn().mockResolvedValue(undefined),
      getIndicators: jest.fn().mockResolvedValue(undefined),
      // Add missing signals and methods
      level1Name: signal('Structure'),
      level2Name: signal('Item'),
      editingLevel1: signal(false),
      editingLevel2: signal(false),
      targetInfo: computed(() => assignIndicatorsModalSignal().targetLevel1 || assignIndicatorsModalSignal().targetLevel2),
      manageIndicatorform: signal({
        name: '',
        description: '',
        numberType: '',
        numberFormat: '',
        years: [],
        targetUnit: '',
        targetValue: 0,
        baseline: 0,
        agreement_id: 1,
        code: ''
      }),
      startEditingLevel1: jest.fn(),
      startEditingLevel2: jest.fn(),
      saveLevel1Name: jest.fn(),
      saveLevel2Name: jest.fn(),
      cancelEditingLevel1: jest.fn(),
      cancelEditingLevel2: jest.fn()
    };

    mockActionsService = {
      showToast: jest.fn()
    };

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
      events: of(),
      url: '/test',
      routerState: {
        snapshot: {
          url: '/test'
        }
      }
    } as any;

    mockActivatedRoute = {
      firstChild: {
        snapshot: {
          routeConfig: { path: 'structure' }
        }
      },
      snapshot: {
        params: { id: 'test-project-id' },
        routeConfig: { path: 'structure' }
      },
      params: of({ id: 'test-project-id' })
    } as any;

    mockCacheService = {
      onlyMvpUsers: signal(false)
    };

    mockProjectUtilsService = {
      sortIndicators: jest.fn().mockReturnValue([]),
      getStatusDisplay: jest.fn().mockReturnValue({ statusId: 1, statusName: 'Active' }),
      getLeverName: jest.fn().mockReturnValue('Test Lever'),
      hasField: jest.fn().mockReturnValue(true)
    };

    mockApiService = {
      GET_ResultsCount: jest.fn().mockResolvedValue({ data: { indicators: [] } })
    };

    await TestBed.configureTestingModule({
      imports: [SetUpProjectComponent, ProjectItemComponent, CustomTagComponent, RouterTestingModule.withRoutes([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SetUpProjectService, useValue: mockSetUpProjectService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ProjectUtilsService, useValue: mockProjectUtilsService },
        { provide: ApiService, useValue: mockApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetUpProjectComponent);
    component = fixture.componentInstance;
    // Set a minimal project object to avoid RouterLink issues
    component.currentProject.set({
      agreement_id: 'test-id',
      description: 'Test Project',
      indicators: []
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
