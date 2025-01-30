import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorsTabFilterComponent } from './indicators-tab-filter.component';

describe('IndicatorsTabFilterComponent', () => {
  let component: IndicatorsTabFilterComponent;
  let fixture: ComponentFixture<IndicatorsTabFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorsTabFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorsTabFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
