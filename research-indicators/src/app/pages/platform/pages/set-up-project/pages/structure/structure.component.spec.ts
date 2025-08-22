import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import StructureComponent from './structure.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('StructureComponent', () => {
  let component: StructureComponent;
  let fixture: ComponentFixture<StructureComponent>;
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
      // Add missing signals and methods
      level1Name: signal('Structure'),
      level2Name: signal('Item'),
      editingLevel1: signal(false),
      editingLevel2: signal(false),
      startEditingLevel1: jest.fn(),
      startEditingLevel2: jest.fn(),
      saveLevel1Name: jest.fn(),
      saveLevel2Name: jest.fn(),
      cancelEditingLevel1: jest.fn(),
      cancelEditingLevel2: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [StructureComponent],
      providers: [{ provide: SetUpProjectService, useValue: mockSetUpProjectService }]
    }).compileComponents();

    fixture = TestBed.createComponent(StructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
