import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { UpdateStructureComponent } from './update-structure.component';
import { SetUpProjectService } from '../../set-up-project.service';
import { SignalUtilsService } from '../../../../../../shared/services/signal-utils.service';

describe('UpdateStructureComponent', () => {
  let component: UpdateStructureComponent;
  let fixture: ComponentFixture<UpdateStructureComponent>;
  let mockSetUpProjectService: Partial<SetUpProjectService>;
  let mockSignalUtilsService: Partial<SignalUtilsService>;

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

    mockSignalUtilsService = {
      deepClone: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UpdateStructureComponent],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService },
        { provide: SignalUtilsService, useValue: mockSignalUtilsService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateStructureComponent);
    component = fixture.componentInstance;
    // Set required inputs
    component.index = 0;
    component.structure = { name: 'Test Structure', code: 'TEST', items: [], indicators: [] };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
