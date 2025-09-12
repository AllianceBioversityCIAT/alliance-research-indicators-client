import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStructureDetailComponent } from './manage-structure-detail.component';

describe('ManageStructureDetailComponent', () => {
  let component: ManageStructureDetailComponent;
  let fixture: ComponentFixture<ManageStructureDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageStructureDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageStructureDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
