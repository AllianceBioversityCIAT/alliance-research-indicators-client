import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressTowardsIndicatorsComponent } from './progress-towards-indicators.component';

describe('ProgressTowardsIndicatorsComponent', () => {
  let component: ProgressTowardsIndicatorsComponent;
  let fixture: ComponentFixture<ProgressTowardsIndicatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressTowardsIndicatorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgressTowardsIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
