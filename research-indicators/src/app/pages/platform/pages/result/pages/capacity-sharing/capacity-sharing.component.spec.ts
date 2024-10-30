import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacitySharingComponent } from './capacity-sharing.component';

describe('CapacitySharingComponent', () => {
  let component: CapacitySharingComponent;
  let fixture: ComponentFixture<CapacitySharingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CapacitySharingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CapacitySharingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
