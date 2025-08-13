import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ManageIndicatorModalComponent } from './manage-indicator-modal.component';
import { SetUpProjectService } from '../../set-up-project.service';
import { ActionsService } from '../../../../../../shared/services/actions.service';

describe('ManageIndicatorModalComponent', () => {
  let component: ManageIndicatorModalComponent;
  let fixture: ComponentFixture<ManageIndicatorModalComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;
  let mockActionsService: Partial<ActionsService>;

  beforeEach(async () => {
    mockSetUpProjectService = {
      structures: signal([]),
      showCreateStructure: signal(false),
      manageIndicatorModal: signal({ show: false }),
      showAllIndicators: signal(false),
      editingElementId: signal(null),
      assignIndicatorsModal: signal({ show: false, target: { type: 'item', structureIndex: 0, itemIndex: 0 } }),
      indicatorList: signal([])
    };

    mockActionsService = {
      showToast: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ManageIndicatorModalComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService },
        { provide: ActionsService, useValue: mockActionsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageIndicatorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
