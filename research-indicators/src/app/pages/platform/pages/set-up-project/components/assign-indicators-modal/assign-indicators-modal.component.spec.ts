import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignIndicatorsModalComponent } from './assign-indicators-modal.component';

describe('AssignIndicatorsModalComponent', () => {
  let component: AssignIndicatorsModalComponent;
  let fixture: ComponentFixture<AssignIndicatorsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignIndicatorsModalComponent]
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
