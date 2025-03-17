import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarInputComponent } from './calendar-input.component';

describe('CalendarInputComponent', () => {
  let component: CalendarInputComponent;
  let fixture: ComponentFixture<CalendarInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
