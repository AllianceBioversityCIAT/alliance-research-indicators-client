import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectedComponent } from './multiselected.component';

describe('MultiselectedComponent', () => {
  let component: MultiselectedComponent;
  let fixture: ComponentFixture<MultiselectedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiselectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
