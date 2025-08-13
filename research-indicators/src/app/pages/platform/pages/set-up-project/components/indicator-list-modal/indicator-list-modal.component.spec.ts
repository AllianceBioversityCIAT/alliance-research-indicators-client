import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { IndicatorListModalComponent } from './indicator-list-modal.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('IndicatorListModalComponent', () => {
  let component: IndicatorListModalComponent;
  let fixture: ComponentFixture<IndicatorListModalComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;

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

    await TestBed.configureTestingModule({
      imports: [IndicatorListModalComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
