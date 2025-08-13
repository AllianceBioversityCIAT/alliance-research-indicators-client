import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { AssignIndicatorsModalComponent } from './assign-indicators-modal.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('AssignIndicatorsModalComponent', () => {
  let component: AssignIndicatorsModalComponent;
  let fixture: ComponentFixture<AssignIndicatorsModalComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;

  beforeEach(async () => {
    mockSetUpProjectService = {
      structures: signal([]),
      showCreateStructure: signal(false),
      manageIndicatorModal: signal({ show: false }),
      showAllIndicators: signal(false),
      editingElementId: signal(null),
      assignIndicatorsModal: signal({ show: false, target: { type: 'item', structureIndex: 0, itemIndex: 0 } }),
      indicatorList: signal([]),
      assignIndicator: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AssignIndicatorsModalComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignIndicatorsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
