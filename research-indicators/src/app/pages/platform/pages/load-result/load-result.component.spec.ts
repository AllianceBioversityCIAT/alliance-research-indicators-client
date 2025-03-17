import { ComponentFixture, TestBed } from '@angular/core/testing';

import LoadResultComponent from './load-result.component';

describe('LoadResultComponent', () => {
  let component: LoadResultComponent;
  let fixture: ComponentFixture<LoadResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadResultComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
