import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { signal } from '@angular/core';

import { StructureCardsViewComponent } from './structure-cards-view.component';
import { SetUpProjectService } from '../../set-up-project.service';

describe('StructureCardsViewComponent', () => {
  let component: StructureCardsViewComponent;
  let fixture: ComponentFixture<StructureCardsViewComponent>;

  beforeEach(async () => {
    const mockSetUpProjectService = {
      structures: signal([]),
      level1Name: signal('Level 1'),
      level2Name: signal('Level 2'),
      editingElementId: signal(null),
      assignIndicatorsModal: signal({ show: false }),
      showCreateStructure: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [StructureCardsViewComponent, HttpClientTestingModule],
      providers: [
        { provide: SetUpProjectService, useValue: mockSetUpProjectService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructureCardsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
