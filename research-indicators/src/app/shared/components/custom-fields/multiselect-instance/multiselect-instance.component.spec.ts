import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectInstanceComponent } from './multiselect-instance.component';

describe('MultiselectInstanceComponent', () => {
  let component: MultiselectInstanceComponent;
  let fixture: ComponentFixture<MultiselectInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectInstanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiselectInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
