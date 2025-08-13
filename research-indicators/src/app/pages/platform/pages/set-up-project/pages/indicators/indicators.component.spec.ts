import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import IndicatorsComponent from './indicators.component';
import { SetUpProjectService } from '../../set-up-project.service';
import { ApiService } from '../../../../../../shared/services/api.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';

describe('IndicatorsComponent', () => {
  let component: IndicatorsComponent;
  let fixture: ComponentFixture<IndicatorsComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;
  let mockApiService: Partial<ApiService>;
  let mockActionsService: Partial<ActionsService>;

  beforeEach(async () => {
    mockSetUpProjectService = {
      structures: signal([]),
      showCreateStructure: signal(false),
      manageIndicatorModal: signal({ show: false }),
      showAllIndicators: signal(false),
      editingElementId: signal(null),
      assignIndicatorsModal: signal({ show: false, target: { type: 'item', structureIndex: 0, itemIndex: 0 } }),
      indicatorList: signal([]),
      loadingStructures: signal(false)
    };

    mockApiService = {
      POST_Indicator: jest.fn().mockResolvedValue({ successfulRequest: true, data: {} })
    };

    mockActionsService = {
      showToast: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [IndicatorsComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService },
        { provide: ApiService, useValue: mockApiService },
        { provide: ActionsService, useValue: mockActionsService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(IndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
