import { ComponentFixture, TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';

import { AssignIndicatorsModalComponent } from './assign-indicators-modal.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('AssignIndicatorsModalComponent', () => {
  let component: AssignIndicatorsModalComponent;
  let fixture: ComponentFixture<AssignIndicatorsModalComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;

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
      level1Name: signal('Level 1'),
      level2Name: signal('Level 2'),
      targetInfo: computed(() => assignIndicatorsModalSignal().targetLevel1 || assignIndicatorsModalSignal().targetLevel2),
      assignIndicator: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AssignIndicatorsModalComponent],
      providers: [{ provide: SetUpProjectService, useValue: mockSetUpProjectService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AssignIndicatorsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
