import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageIndicatorModalComponent } from './manage-indicator-modal.component';

describe('ManageIndicatorModalComponent', () => {
  let component: ManageIndicatorModalComponent;
  let fixture: ComponentFixture<ManageIndicatorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageIndicatorModalComponent]
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
