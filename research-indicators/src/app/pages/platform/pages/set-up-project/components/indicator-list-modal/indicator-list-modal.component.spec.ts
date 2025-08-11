import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorListModalComponent } from './indicator-list-modal.component';

describe('IndicatorListModalComponent', () => {
  let component: IndicatorListModalComponent;
  let fixture: ComponentFixture<IndicatorListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorListModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
