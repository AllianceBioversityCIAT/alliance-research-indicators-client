import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { computed, signal } from '@angular/core';
import { of } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import SetUpProjectComponent from './set-up-project.component';
import { SetUpProjectService } from './set-up-project.service';
import { ActionsService } from '../../../../shared/services/actions.service';

describe('SetUpProjectComponent', () => {
  let component: SetUpProjectComponent;
  let fixture: ComponentFixture<SetUpProjectComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;
  let mockActionsService: Partial<ActionsService>;
  let mockRouter: Partial<Router>;
  let mockActivatedRoute: Partial<ActivatedRoute>;

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
      navigate: jest.fn().mockResolvedValue(true)
    };

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

    await TestBed.configureTestingModule({
      imports: [SetUpProjectComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SetUpProjectService, useValue: mockSetUpProjectService },
        { provide: ActionsService, useValue: mockActionsService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetUpProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
