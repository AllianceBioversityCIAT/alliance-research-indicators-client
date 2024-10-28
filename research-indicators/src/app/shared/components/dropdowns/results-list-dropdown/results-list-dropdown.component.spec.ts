import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsListDropdownComponent } from './results-list-dropdown.component';

describe('ResultsListDropdownComponent', () => {
  let component: ResultsListDropdownComponent;
  let fixture: ComponentFixture<ResultsListDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsListDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsListDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
