import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerSelectedItemComponent } from './partner-selected-item.component';

describe('PartnerSelectedItemComponent', () => {
  let component: PartnerSelectedItemComponent;
  let fixture: ComponentFixture<PartnerSelectedItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerSelectedItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerSelectedItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
