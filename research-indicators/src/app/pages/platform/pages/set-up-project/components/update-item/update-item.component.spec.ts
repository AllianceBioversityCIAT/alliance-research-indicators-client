import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { UpdateItemComponent } from './update-item.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('UpdateItemComponent', () => {
  let component: UpdateItemComponent;
  let fixture: ComponentFixture<UpdateItemComponent>;
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
      imports: [UpdateItemComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateItemComponent);
    component = fixture.componentInstance;
    // Set required inputs
    component.item = { name: 'Test Item', code: 'TEST' };
    component.structureIndex = 0;
    component.itemIndex = 0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
