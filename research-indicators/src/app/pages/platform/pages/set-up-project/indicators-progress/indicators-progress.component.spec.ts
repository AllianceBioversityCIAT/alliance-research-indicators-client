import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorsProgressComponent } from './indicators-progress.component';

describe('IndicatorsProgressComponent', () => {
  let component: IndicatorsProgressComponent;
  let fixture: ComponentFixture<IndicatorsProgressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorsProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorsProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
