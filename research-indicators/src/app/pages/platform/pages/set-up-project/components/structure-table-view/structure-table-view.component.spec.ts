import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { StructureTableViewComponent } from './structure-table-view.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('StructureTableViewComponent', () => {
  let component: StructureTableViewComponent;
  let fixture: ComponentFixture<StructureTableViewComponent>;

  beforeEach(async () => {
    const mockSetUpProjectService = {
      structures: signal([]),
      strcutureGrouped: signal([]),
      level1Name: signal('Level 1'),
      level2Name: signal('Level 2'),
      editingFocus: signal(false),
      assignIndicatorsModal: signal({ show: false }),
      saveStructures: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [StructureTableViewComponent, HttpClientTestingModule],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureTableViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
