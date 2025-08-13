import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CreateItemComponent } from './create-item.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('CreateItemComponent', () => {
  let component: CreateItemComponent;
  let fixture: ComponentFixture<CreateItemComponent>;
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
      imports: [CreateItemComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateItemComponent);
    component = fixture.componentInstance;
    // Set required inputs
    component.structure = { name: 'Test Structure', code: 'TEST', items: [], indicators: [] };
    component.index = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
